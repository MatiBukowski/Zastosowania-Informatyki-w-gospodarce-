import { useEffect, useState } from 'react';
import { getRestaurants, getTablesByRestaurantId } from '../api/RestaurantAPI';
import { TableQR } from '../components/TableQR';
import { ITable, IRestaurant } from '../context/interfaces';
import { Select, MenuItem, FormControl, InputLabel, Button, Box, Checkbox, FormControlLabel, Typography, Divider, Stack } from '@mui/material';

export const TableQRPage = () => {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | ''>('');
  const [tables, setTables] = useState<ITable[]>([]);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);

  useEffect(() => {
    getRestaurants().then(setRestaurants).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedRestaurantId !== '') {
      getTablesByRestaurantId(selectedRestaurantId as number)
        .then((data) => { setTables(data); setSelectedTables([]); })
        .catch(console.error);
    }
  }, [selectedRestaurantId]);

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

      {selectedRestaurantId !== '' && tables.length === 0 && (
        <Typography sx={pageStyles.noTablesText}>No tables found for this restaurant.</Typography>
      )}

      {tables.length > 0 && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Typography variant="h6">Tables List</Typography>
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
                <Box key={table.table_id} sx={pageStyles.tableCard(isSelected)}>
                  <FormControlLabel
                    control={<Checkbox checked={isSelected} onChange={() => toggleTableSelection(table.table_id)} size="small" />}
                    label={<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Table #{table.table_number}</Typography>}
                    sx={{ margin: 0 }}
                  />
                  <Box sx={pageStyles.infoBox(isSelected)}>
                    <Typography variant="caption" display="block" color="text.secondary">
                      System ID: <strong>{table.table_id}</strong>
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Capacity: <strong>{table.capacity} guests</strong>
                    </Typography>
                  </Box>
                  {isSelected && (
                    <Box sx={{ mt: 'auto', pt: 1 }}>
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
  }),
  infoBox: (isSelected: boolean) => ({
    pl: 4,
    mb: isSelected ? 2 : 0
  })
};