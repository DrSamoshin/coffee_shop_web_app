import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Fab,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import type { Item } from '../types/api';
import { apiService } from '../services/api';
import { logger } from '../services/logger';
import { useConstants } from '../hooks/useConstants';

const ItemsView: React.FC = () => {
  const { t } = useTranslation();
  const { constants, loading: constantsLoading } = useConstants();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemMeasure, setNewItemMeasure] = useState('');
  const [editItemName, setEditItemName] = useState('');
  const [editItemMeasure, setEditItemMeasure] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  // Устанавливаем единицу измерения по умолчанию когда загружаются константы
  useEffect(() => {
    if (constants.itemMeasurements.length > 0 && !newItemMeasure) {
      setNewItemMeasure(constants.itemMeasurements[0]);
    }
  }, [constants.itemMeasurements, newItemMeasure]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getItems();
      setItems(data);
      logger.info('Items loaded successfully', 'COMPONENT_STATE', { count: data.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to load items', err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim() || !newItemMeasure.trim()) return;
    
    try {
      await apiService.createItem({
        name: newItemName.trim(),
        measurement: newItemMeasure.trim()
      });
      setNewItemName('');
      setNewItemMeasure(constants.itemMeasurements.length > 0 ? constants.itemMeasurements[0] : '');
      setAddDialogOpen(false);
      await loadItems();
      logger.info('Item created', 'USER_ACTION', { name: newItemName, measurement: newItemMeasure });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to create item', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleSaveItem = async () => {
    if (!selectedItem || !editItemName.trim() || !editItemMeasure.trim()) return;
    
    try {
      await apiService.updateItem(selectedItem.id, {
        name: editItemName.trim(),
        measurement: editItemMeasure.trim()
      });
      setEditDialogOpen(false);
      setSelectedItem(null);
      setEditItemName('');
      setEditItemMeasure(constants.itemMeasurements.length > 0 ? constants.itemMeasurements[0] : '');
      await loadItems();
      logger.info('Item updated', 'USER_ACTION', { id: selectedItem.id, name: editItemName, measurement: editItemMeasure });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to update item', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      await apiService.deleteItem(selectedItem.id);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      await loadItems();
      logger.info('Item deleted', 'USER_ACTION', { id: selectedItem.id, name: selectedItem.name });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to delete item', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const openEditDialog = (item: Item) => {
    setSelectedItem(item);
    setEditItemName(item.name || '');
    
    // Проверяем, есть ли единица измерения товара в списке доступных
    const currentMeasure = item.measurement || '';
    const validMeasure = constants.itemMeasurements.includes(currentMeasure)
      ? currentMeasure
      : (constants.itemMeasurements.length > 0 ? constants.itemMeasurements[0] : '');
      
    setEditItemMeasure(validMeasure);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (item: Item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  if (loading || constantsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('items.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {items.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {t('items.noItems')}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('items.name')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('items.measure')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('items.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} sx={{ height: 48 }}>
                      <TableCell sx={{ py: 1 }}>{item.name}</TableCell>
                      <TableCell sx={{ py: 1 }}>{item.measurement}</TableCell>
                      <TableCell align="right" sx={{ py: 1 }}>
                        <IconButton onClick={() => openEditDialog(item)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => openDeleteDialog(item)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Item FAB */}
      <Fab
        color="primary"
        aria-label="add item"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Add Item Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('items.addItem')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('items.name')}
            fullWidth
            variant="outlined"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>{t('items.measure')}</InputLabel>
            <Select
              value={newItemMeasure}
              onChange={(e) => setNewItemMeasure(e.target.value as string)}
              label={t('items.measure')}
            >
              {constants.itemMeasurements.map((measurement) => (
                <MenuItem key={measurement} value={measurement}>
                  {measurement}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAddItem} variant="contained" color="success">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('items.editItem')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('items.name')}
            fullWidth
            variant="outlined"
            value={editItemName}
            onChange={(e) => setEditItemName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>{t('items.measure')}</InputLabel>
            <Select
              value={editItemMeasure}
              onChange={(e) => setEditItemMeasure(e.target.value as string)}
              label={t('items.measure')}
            >
              {constants.itemMeasurements.map((measurement) => (
                <MenuItem key={measurement} value={measurement}>
                  {measurement}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSaveItem} variant="contained" color="success">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Item Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('items.deleteItem')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('items.confirmDelete')}
          </Typography>
          {selectedItem && (
            <Typography variant="body2" color="text.secondary">
              {selectedItem.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteItem} color="error" variant="contained">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ItemsView; 