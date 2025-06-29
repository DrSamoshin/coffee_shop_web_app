import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { logger } from '../services/logger';
import { apiService } from '../services/api';
import type { StoreItem, StoreItemCreate, StoreItemCalculation, Item, Supply, Supplier } from '../types/api';

const StoreView: React.FC = () => {
  const { t } = useTranslation();
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [storeCalculation, setStoreCalculation] = useState<StoreItemCalculation[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [removingItem, setRemovingItem] = useState<StoreItemCalculation | null>(null);
  const [newStoreItem, setNewStoreItem] = useState<StoreItemCreate>({
    item_id: '',
    supply_id: '',
    amount: '',
    price_per_item: ''
  });
  const [editStoreItem, setEditStoreItem] = useState<StoreItemCreate>({
    item_id: '',
    supply_id: '',
    amount: '',
    price_per_item: ''
  });
  const [removeAmount, setRemoveAmount] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [storeItemsData, storeCalculationData, itemsData, suppliesData, suppliersData] = await Promise.all([
        apiService.getStoreItems(),
        apiService.getStoreItemsCalculation(),
        apiService.getItems(),
        apiService.getSupplies(),
        apiService.getSuppliers()
      ]);
      setStoreItems(storeItemsData);
      setStoreCalculation(storeCalculationData);
      setItems(itemsData);
      setSupplies(suppliesData);
      setSuppliers(suppliersData);
      setError(null);
    } catch (err) {
      let errorMessage = 'Ошибка загрузки данных';
      
      if ((err as any).response?.data) {
        const responseData = (err as any).response.data;
        
        if (typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          errorMessage = responseData.detail.map((error: any) => error.msg || error.message || 'Ошибка валидации').join(', ');
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if ((err as any).message) {
        errorMessage = (err as any).message;
      }
      
      setError(errorMessage);
      logger.error('Failed to load store data', 'STORE_VIEW');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStoreItem = async () => {
    try {
      const storeItemToCreate = {
        ...newStoreItem,
        supply_id: newStoreItem.supply_id || null,
        amount: parseFloat(newStoreItem.amount.toString()) || 0,
        price_per_item: parseFloat(newStoreItem.price_per_item.toString()) || 0
      };

      await apiService.createStoreItem(storeItemToCreate);
      setOpenAddDialog(false);
      setNewStoreItem({
        item_id: '',
        supply_id: '',
        amount: '',
        price_per_item: ''
      });
      logger.info('Store item created', 'USER_ACTION', newStoreItem);
      await loadData();
    } catch (err) {
      let errorMessage = 'Ошибка создания записи';
      
      if ((err as any).response?.data) {
        const responseData = (err as any).response.data;
        
        if (typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          // Если detail это массив ошибок валидации
          errorMessage = responseData.detail.map((error: any) => error.msg || error.message || 'Ошибка валидации').join(', ');
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if ((err as any).message) {
        errorMessage = (err as any).message;
      }
      
      setError(errorMessage);
      logger.error('Failed to create store item', 'STORE_VIEW');
    }
  };

  const handleEditStoreItem = (storeItem: StoreItem) => {
    setEditingItem(storeItem);
    setEditStoreItem({
      item_id: storeItem.item_id,
      supply_id: storeItem.supply_id || '',
      amount: storeItem.amount.toString(),
      price_per_item: storeItem.price_per_item.toString()
    });
    setOpenEditDialog(true);
  };

  const handleUpdateStoreItem = async () => {
    if (!editingItem) return;
    
    try {
      const storeItemToUpdate = {
        ...editStoreItem,
        supply_id: editStoreItem.supply_id || null,
        amount: parseFloat(editStoreItem.amount.toString()) || 0,
        price_per_item: parseFloat(editStoreItem.price_per_item.toString()) || 0
      };
      await apiService.updateStoreItem(editingItem.id, storeItemToUpdate);
      setOpenEditDialog(false);
      setEditingItem(null);
      setEditStoreItem({
        item_id: '',
        supply_id: '',
        amount: '',
        price_per_item: ''
      });
      logger.info('Store item updated', 'USER_ACTION', editStoreItem);
      await loadData();
    } catch (err) {
      let errorMessage = 'Ошибка обновления записи';
      
      if ((err as any).response?.data) {
        const responseData = (err as any).response.data;
        
        if (typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          // Если detail это массив ошибок валидации
          errorMessage = responseData.detail.map((error: any) => error.msg || error.message || 'Ошибка валидации').join(', ');
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if ((err as any).message) {
        errorMessage = (err as any).message;
      }
      
      setError(errorMessage);
      logger.error('Failed to update store item', 'STORE_VIEW');
    }
  };



  const getSupplierName = (supplierId: string | null) => {
    if (!supplierId) return null;
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : t('store.unknownSupplier');
  };

  const handleRemoveStoreItem = (item: StoreItemCalculation) => {
    setRemovingItem(item);
    setRemoveAmount(item.amount);
    setOpenRemoveDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (!removingItem) return;
    
    try {
      await apiService.removeStoreItem({
        item_id: removingItem.item_id,
        amount: parseFloat(removeAmount) || 0,
        price_per_item: 0
      });
      setOpenRemoveDialog(false);
      setRemovingItem(null);
      setRemoveAmount('');
      logger.info('Store item removed', 'USER_ACTION', { item_id: removingItem.item_id, amount: removeAmount });
      await loadData();
    } catch (err) {
      let errorMessage = 'Ошибка удаления товара';
      
      if ((err as any).response?.data) {
        const responseData = (err as any).response.data;
        
        if (typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          errorMessage = responseData.detail.map((error: any) => error.msg || error.message || 'Ошибка валидации').join(', ');
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if ((err as any).message) {
        errorMessage = (err as any).message;
      }
      
      setError(errorMessage);
      logger.error('Failed to remove store item', 'STORE_VIEW');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('store.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Карточки с остатками товаров */}
      {storeCalculation.length > 0 && (
        <Box sx={{ 
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2
        }}>
          {storeCalculation.map((item) => (
            <Card key={item.item_id} sx={{ 
              width: '200px', 
              height: '100px', 
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconButton 
                size="small" 
                onClick={() => handleRemoveStoreItem(item)}
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8 
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              
              <Box sx={{ 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '150px' }}>
                  {item.item_name}
                </Typography>
                <Typography variant="h5" color="primary" sx={{ mt: 0.5 }}>
                  {item.amount}
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      <Card>
        <CardContent>
          {storeItems.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {t('store.noItems')}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('store.item')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('store.supplier')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('store.amount')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('store.pricePerItem')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('store.debit')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('store.date')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {storeItems.map((storeItem) => (
                    <TableRow key={storeItem.id} sx={{ height: 48 }}>
                      <TableCell sx={{ py: 1 }}>{storeItem.item_name}</TableCell>
                      <TableCell sx={{ py: 1 }}>{storeItem.supplier || '-'}</TableCell>
                      <TableCell sx={{ py: 1 }}>{storeItem.amount}</TableCell>
                      <TableCell sx={{ py: 1 }}>{storeItem.price_per_item}</TableCell>
                      <TableCell sx={{ py: 1 }}>{storeItem.debit ? t('store.removing') : t('store.adding')}</TableCell>
                      <TableCell sx={{ py: 1 }}>{new Date(storeItem.date).toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ py: 1 }}>
                        <IconButton onClick={() => handleEditStoreItem(storeItem)} size="small">
                          <EditIcon />
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

      <Fab
        color="primary"
        aria-label={t('store.addStoreItem')}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenAddDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* Диалог добавления записи */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('store.addStoreItem')}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" sx={{ mt: 2, mb: 2 }}>
            <InputLabel>{t('store.item')}</InputLabel>
            <Select
              value={newStoreItem.item_id}
              onChange={(e) => setNewStoreItem({ ...newStoreItem, item_id: e.target.value })}
              label={t('store.item')}
            >
              {items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>{t('store.supply')}</InputLabel>
            <Select
              value={newStoreItem.supply_id || ''}
              onChange={(e) => setNewStoreItem({ ...newStoreItem, supply_id: e.target.value || undefined })}
              label={t('store.supply')}
            >
              <MenuItem value="">
                <em>{t('store.noSupply')}</em>
              </MenuItem>
              {supplies.map((supply) => (
                <MenuItem key={supply.id} value={supply.id}>
                  {new Date(supply.date).toLocaleDateString()} - {getSupplierName(supply.supplier_id) || t('store.unknownSupplier')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            autoFocus
            margin="dense"
            label={t('store.amount')}
            type="number"
            fullWidth
            variant="outlined"
            value={newStoreItem.amount}
            onChange={(e) => setNewStoreItem({ ...newStoreItem, amount: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label={t('store.pricePerItem')}
            type="number"
            fullWidth
            variant="outlined"
            value={newStoreItem.price_per_item}
            onChange={(e) => setNewStoreItem({ ...newStoreItem, price_per_item: e.target.value })}
            sx={{ mb: 2 }}
          />


        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>
            {t('categories.cancel')}
          </Button>
          <Button
            onClick={handleAddStoreItem}
            variant="contained"
            color="success"
            disabled={!newStoreItem.item_id || !newStoreItem.amount || !newStoreItem.price_per_item}
          >
            {t('categories.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования записи */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('store.editStoreItem')}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" sx={{ mt: 2, mb: 2 }}>
            <InputLabel>{t('store.item')}</InputLabel>
            <Select
              value={editStoreItem.item_id}
              onChange={(e) => setEditStoreItem({ ...editStoreItem, item_id: e.target.value })}
              label={t('store.item')}
            >
              {items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>{t('store.supply')}</InputLabel>
            <Select
              value={editStoreItem.supply_id || ''}
              onChange={(e) => setEditStoreItem({ ...editStoreItem, supply_id: e.target.value || undefined })}
              label={t('store.supply')}
            >
              <MenuItem value="">
                <em>{t('store.noSupply')}</em>
              </MenuItem>
              {supplies.map((supply) => (
                <MenuItem key={supply.id} value={supply.id}>
                  {new Date(supply.date).toLocaleDateString()} - {getSupplierName(supply.supplier_id) || t('store.unknownSupplier')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            autoFocus
            margin="dense"
            label={t('store.amount')}
            type="number"
            fullWidth
            variant="outlined"
            value={editStoreItem.amount}
            onChange={(e) => setEditStoreItem({ ...editStoreItem, amount: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label={t('store.pricePerItem')}
            type="number"
            fullWidth
            variant="outlined"
            value={editStoreItem.price_per_item}
            onChange={(e) => setEditStoreItem({ ...editStoreItem, price_per_item: e.target.value })}
            sx={{ mb: 2 }}
          />


        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>
            {t('categories.cancel')}
          </Button>
          <Button
            onClick={handleUpdateStoreItem}
            variant="contained"
            color="success"
            disabled={!editStoreItem.item_id || !editStoreItem.amount || !editStoreItem.price_per_item}
          >
            {t('categories.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления товара */}
      <Dialog open={openRemoveDialog} onClose={() => setOpenRemoveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('store.removeStoreItem')}</DialogTitle>
        <DialogContent>
          {removingItem && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t('store.removingItem')}: <strong>{removingItem.item_name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('store.currentAmount')}: {removingItem.amount}
              </Typography>
            </Box>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label={t('store.removeAmount')}
            type="number"
            fullWidth
            variant="outlined"
            value={removeAmount}
            onChange={(e) => setRemoveAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemoveDialog(false)}>
            {t('store.cancel')}
          </Button>
          <Button
            onClick={handleConfirmRemove}
            variant="contained"
            color="error"
            disabled={!removeAmount || parseFloat(removeAmount) <= 0}
          >
            {t('store.remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StoreView; 