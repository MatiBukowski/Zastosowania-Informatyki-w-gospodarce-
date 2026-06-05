import { useEffect, useState } from 'react';
import { useAuth } from '../services/AuthProvider';
import { getRestaurantMenu, addRestaurantMenuItem, updateRestaurantMenuItem } from '../api/RestaurantAPI'; 
import {
  Button, Box, Typography, Divider,
  Grid, Paper, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton
} from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import TextField from '@mui/material/TextField';
import { usePostHog } from '@posthog/react';
import { ISingleRestaurantMenuItem, ISingleRestaurantMenuItemResponse } from '../context/interfaces';
import { fetchAll } from '../api/PaginationHelper';

interface MenuModifyPanelProps {
  restaurantId: number;
  restaurantName: string;
  onClose: () => void;
}

const RestaurantMenuModifyPanel = ({ restaurantId, restaurantName, onClose }: MenuModifyPanelProps) => {
  const { role, isAxiosReady } = useAuth();
  const posthog = usePostHog();
  const isAdmin = role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [menuItems, setMenuItems] = useState<ISingleRestaurantMenuItemResponse[]>([]);
  
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  });

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allItems = await fetchAll((page, size) => getRestaurantMenu(restaurantId, page, size));
      setMenuItems(allItems); 

      posthog.capture('menu_modify_panel_viewed', { restaurant_id: restaurantId });
    } catch (err) {
      console.error("Error while fetching menu:", err);
      setError("Failed to load menu data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAxiosReady && restaurantId) {
      fetchMenu();
      handleCancelEdit();
    }
  }, [restaurantId, isAxiosReady]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'price') {
      const priceRegex = /^\d*([.,]\d{0,2})?$/;
      
      if (value === '' || priceRegex.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditClick = (item: ISingleRestaurantMenuItemResponse) => {
    setEditingItemId(item.menu_item_id);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString()
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setFormData({ name: '', description: '', price: '' });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!formData.name || !formData.price || !formData.description) {
        throw new Error("Name, Price, and Description are required.");
      }

      const payload: ISingleRestaurantMenuItem = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price.replace(',', '.'))
      };

      if (isNaN(payload.price)) {
        throw new Error("Price must be a valid number.");
      }

      if (editingItemId) {
        await updateRestaurantMenuItem(restaurantId, editingItemId, payload);
        setSuccess("Menu item updated successfully!");
        posthog.capture('menu_item_updated', { restaurant_id: restaurantId, menu_item_id: editingItemId });
      } else {
        await addRestaurantMenuItem(restaurantId, payload);
        setSuccess("New menu item added successfully!");
        posthog.capture('menu_item_added', { restaurant_id: restaurantId });
      }

      await fetchMenu();
      handleCancelEdit();

      setTimeout(() => setSuccess(null), 3000);

    } catch (err: any) {
      console.error("Error saving menu item:", err);
      setError(err.message || "Failed to save menu item. Please try again.");
      posthog.capture('menu_item_save_error', { restaurant_id: restaurantId });
    } finally {
      setSaving(false);
    }
  };

  if (loading && menuItems.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* NAGŁÓWEK PANELU */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            <Box component="span" sx={{ color: 'primary.main' }}>
                Managing Menu for Restaurant:{" "}
            </Box>
            <Box component="span" sx={{ color: 'text.primary' }}>
                {restaurantName}
            </Box>
        </Typography>

        {isAdmin && (
          <Button variant="outlined" color="error" onClick={onClose}>
              Close modification panel
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {/* TABELA Z DANIAMI */}
      <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>Current Menu Items ({menuItems.length})</Typography>
      <Divider sx={{ mb: 2 }} />

      {menuItems.length > 0 && (
          <IconButton 
            onClick={() => setIsTableExpanded(!isTableExpanded)} 
            color="primary"
            title={isTableExpanded ? "Collapse table" : "Expand table"}
          >
            {isTableExpanded ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
          </IconButton>
        )}
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          mb: 5, 
          maxHeight: isTableExpanded ? 'none' : 400,
          transition: 'max-height 0.3s ease-in-out'
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Description</b></TableCell>
              <TableCell><b>Price</b></TableCell>
              <TableCell align="right"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {menuItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No items in the menu yet. Add one below!
                </TableCell>
              </TableRow>
            ) : (
              menuItems.map((item) => (
                <TableRow key={item.menu_item_id} hover>
                  <TableCell>{item.menu_item_id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{Number(item.price).toFixed(2)} PLN</TableCell>
                  <TableCell align="right">
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* FORMULARZ DODAWANIA I EDYCJI */}
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              {editingItemId ? `Edit Menu Item (ID: ${editingItemId})` : "Add New Menu Item"}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <TextField 
              fullWidth 
              label="Item Name" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              required
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField 
              fullWidth 
              label="Price" 
              name="price" 
              value={formData.price} 
              onChange={handleInputChange} 
              placeholder="0.00"
              required
              slotProps={{
                htmlInput: { inputMode: 'decimal' }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField 
              fullWidth 
              multiline 
              rows={3} 
              label="Description" 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange}
              required
            />
          </Grid>

          {/* Przyciski Akcji */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {editingItemId && (
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel Edit
              </Button>
            )}
            <Button 
              variant="contained" 
              color={editingItemId ? "primary" : "success"} 
              size="large" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : (editingItemId ? 'Update Item' : 'Add Item')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default RestaurantMenuModifyPanel;