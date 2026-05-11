import { useEffect, useState } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';
import { getTablesByRestaurantId, getRestaurants} from '../api/RestaurantAPI';
import { TableQR } from '../components/TableQR';
import { ITable, IRestaurant } from '../context/interfaces';
import { Select, MenuItem, FormControl, InputLabel, Button, Box, Checkbox, FormControlLabel, Typography, Divider, Stack } from '@mui/material';
import { usePostHog } from '@posthog/react';

interface ContextType {
  restaurantName: string;
}

export const TableQRPage = () => {
  const { role } = useAuth();
  const { restaurantName } = useOutletContext<ContextType>();
  const [tables, setTables] = useState<ITable[]>([]);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | ''>('');
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const posthog = usePostHog();

  const [searchParams] = useSearchParams();
  const urlRestaurantId = searchParams.get('restaurantId');

  const isAdmin = role === "ADMIN";

  const currentId = isAdmin ? selectedRestaurantId : urlRestaurantId;
  const hasNoTables = currentId && tables.length === 0;

  useEffect(() => {
    if (isAdmin) {
      getRestaurants().then(setRestaurants).catch(console.error);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!role || isAdmin) return;

    if (urlRestaurantId) {
      const id = parseInt(urlRestaurantId, 10);
      getTablesByRestaurantId(id)
        .then((data) => { 
          setTables(data); 
          setSelectedTables([]);
          posthog.capture('tables_qr_generator_viewed', {
            restaurant_id: id,
            tables_count: data.length
          });
        })
        .catch((err) => {
          console.error(err);
          posthog.capture('failed_tables_qr_generator_view', { restaurant_id: id });
        });
    }
  }, [role, isAdmin, urlRestaurantId, posthog]);

  useEffect(() => {
    if (!isAdmin) return;

    if (selectedRestaurantId !== '') {
      getTablesByRestaurantId(selectedRestaurantId as number)
        .then((data) => { 
          setTables(data); 
          setSelectedTables([]);
          posthog.capture('tables_qr_generator_viewed', {
            restaurant_id: selectedRestaurantId,
            tables_count: data.length
          });
        })
        .catch((err) => {
          console.error(err);
          posthog.capture('failed_tables_qr_generator_view', { restaurant_id: selectedRestaurantId });
        });
    }
  }, [isAdmin, selectedRestaurantId, posthog]);

  const toggleTableSelection = (tableId: number) => {
    setSelectedTables((prev) =>
      prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]
    );
  };

  const areAllSelected = tables.length > 0 && selectedTables.length === tables.length;

  const handleToggleSelectAll = () => {
    setSelectedTables(areAllSelected ? [] : tables.map((t) => t.table_id));
  };
 
  const handleDownloadSelected = () => {
    posthog.capture('qr_batch_download', {
        restaurant_id: isAdmin ? selectedRestaurantId : urlRestaurantId,
        selected_count: selectedTables.length
    });
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn) => {
      if (btn.textContent?.includes('Save PNG')) (btn as HTMLButtonElement).click();
    });

  };

  return (
    <Box sx={pageStyles.container}>
      <Typography variant="h4" sx={pageStyles.header}>
        QR Management Dashboard
      </Typography>

      {isAdmin && (
        <>
          <FormControl fullWidth sx={pageStyles.selectWrapper}>
            <InputLabel id="restaurant-select-label">Select Restaurant</InputLabel>
            <Select
              labelId="restaurant-select-label"
              value={selectedRestaurantId}
              label="Select Restaurant"
              onChange={(e) => setSelectedRestaurantId(e.target.value as number)}
            >
              {restaurants.map((r) => (
                <MenuItem key={r.restaurant_id} value={r.restaurant_id}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            {restaurants.find((r) => r.restaurant_id === selectedRestaurantId)?.name || ""}
          </Typography>
        </>
      )}

      {!isAdmin && (
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          {restaurantName}
        </Typography>
      )}

      {hasNoTables && (
        <Typography sx={pageStyles.noTablesText}>No tables found for this restaurant.</Typography>
      )}

      {tables.length > 0 && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Tables List ({selectedTables.length} selected)
            </Typography>

            <Button variant="outlined" size="small" onClick={handleToggleSelectAll}>
              {areAllSelected ? "Deselect All" : "Select All"}
            </Button>
            <Button variant="contained" size="small" color="success" disabled={selectedTables.length === 0} onClick={handleDownloadSelected}>
              Save Selected Codes ({selectedTables.length})
            </Button>
          </Stack>

          <Box sx={pageStyles.grid}>
  {tables.map((table) => {
    const isSelected = selectedTables.includes(table.table_id);
    return (
      <Box
        key={table.table_id}
        sx={{
          ...pageStyles.tableCard(isSelected),
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={() => toggleTableSelection(table.table_id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleTableSelection(table.table_id);
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
  
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleTableSelection(table.table_id);
                  }}
                  size="small"
                />
              }
              label={
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Table #{table.table_number}
                </Typography>
              }
              sx={{ margin: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
            <Box sx={pageStyles.infoBox(isSelected)}>
              <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">
                System ID: <strong>{table.table_id}</strong>
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">
                Capacity: <strong>{table.capacity} guests</strong>
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              opacity: 0.1,
              lineHeight: 1,
              mr: 4,
              pointerEvents: 'none',
            }}
          >
            {table.table_number}
          </Typography>

          </Box>

            {isSelected && (
              <Box sx={{ mt: 'auto', pt: 2, width: '100%' }}>
                <TableQR token={table.qr_code_token} table_number={table.table_number} />
              </Box>
            )}
          </Box>
            );
          })}
        </Box>
        </>
      )}
    </Box>
  );
};


const pageStyles = {
  container: { p: 4 },
  header: { mb: 4, fontWeight: 'bold', color: 'primary.main' },
  selectWrapper: { mb: 4, maxWidth: 600 },
  noTablesText: { mt: 2, color: 'text.secondary' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 3 },
  tableCard: (isSelected: boolean) => ({
    p: 2,
    border: '1px solid',
    borderColor: isSelected ? 'primary.light' : '#e0e0e0',
    borderRadius: 2,
    bgcolor: isSelected ? 'action.hover' : 'background.paper',
    width: 280,
    minHeight: 100,
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'flex-start',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
  }),
  infoBox: (isSelected: boolean) => ({
    pl: 4,
    mb: isSelected ? 2 : 0
  })
};