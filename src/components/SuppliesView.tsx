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
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import type { Supply, Supplier } from '../types/api';
import { apiService } from '../services/api';
import { logger } from '../services/logger';

const SuppliesView: React.FC = () => {
  const { t } = useTranslation();
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  
  // Form states
  const [newSupplyDate, setNewSupplyDate] = useState('');
  const [newSupplySupplierId, setNewSupplySupplierId] = useState('');
  const [editSupplyDate, setEditSupplyDate] = useState('');
  const [editSupplySupplierId, setEditSupplySupplierId] = useState('');

  useEffect(() => {
    loadData();
    // Устанавливаем сегодняшнюю дату по умолчанию
    const today = new Date().toISOString().split('T')[0];
    setNewSupplyDate(today);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [suppliesData, suppliersData] = await Promise.all([
        apiService.getSupplies(),
        apiService.getSuppliers()
      ]);
      setSupplies(suppliesData);
      setSuppliers(suppliersData);
      logger.info('Supplies loaded successfully', 'COMPONENT_STATE', { count: suppliesData.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to load supplies', err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Unknown supplier';
  };

  const handleAddSupply = async () => {
    if (!newSupplyDate.trim() || !newSupplySupplierId) return;
    
    try {
      await apiService.createSupply({
        date: newSupplyDate,
        supplier_id: newSupplySupplierId
      });
      // Сбрасываем только поставщика, дату оставляем на сегодня
      const today = new Date().toISOString().split('T')[0];
      setNewSupplyDate(today);
      setNewSupplySupplierId('');
      setAddDialogOpen(false);
      await loadData();
      logger.info('Supply created', 'USER_ACTION', { date: newSupplyDate, supplier_id: newSupplySupplierId });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to create supply', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleSaveSupply = async () => {
    if (!selectedSupply || !editSupplyDate.trim() || !editSupplySupplierId) return;
    
    try {
      await apiService.updateSupply(selectedSupply.id, {
        date: editSupplyDate,
        supplier_id: editSupplySupplierId
      });
      setEditDialogOpen(false);
      setSelectedSupply(null);
      setEditSupplyDate('');
      setEditSupplySupplierId('');
      await loadData();
      logger.info('Supply updated', 'USER_ACTION', { id: selectedSupply.id, date: editSupplyDate, supplier_id: editSupplySupplierId });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to update supply', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const openEditDialog = (supply: Supply) => {
    setSelectedSupply(supply);
    // Преобразуем дату в формат YYYY-MM-DD для поля date
    const dateOnly = supply.date ? supply.date.split('T')[0] : '';
    setEditSupplyDate(dateOnly);
    setEditSupplySupplierId(supply.supplier_id || '');
    setEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
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
        {t('supplies.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {supplies.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {t('supplies.noSupplies')}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('supplies.date')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('supplies.supplier')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('supplies.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {supplies.map((supply) => (
                    <TableRow key={supply.id} sx={{ height: 48 }}>
                      <TableCell sx={{ py: 1 }}>{formatDate(supply.date)}</TableCell>
                      <TableCell sx={{ py: 1 }}>{getSupplierName(supply.supplier_id)}</TableCell>
                      <TableCell align="right" sx={{ py: 1 }}>
                        <IconButton onClick={() => openEditDialog(supply)} size="small">
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
        aria-label="add supply"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('supplies.addSupply')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('supplies.date')}
            type="date"
            fullWidth
            variant="outlined"
            value={newSupplyDate}
            onChange={(e) => setNewSupplyDate(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>{t('supplies.supplier')}</InputLabel>
            <Select
              value={newSupplySupplierId}
              onChange={(e) => setNewSupplySupplierId(e.target.value)}
              label={t('supplies.supplier')}
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleAddSupply} variant="contained" color="success">
            {t('categories.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('supplies.editSupply')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('supplies.date')}
            type="date"
            fullWidth
            variant="outlined"
            value={editSupplyDate}
            onChange={(e) => setEditSupplyDate(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>{t('supplies.supplier')}</InputLabel>
            <Select
              value={editSupplySupplierId}
              onChange={(e) => setEditSupplySupplierId(e.target.value)}
              label={t('supplies.supplier')}
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleSaveSupply} variant="contained" color="success">
            {t('categories.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SuppliesView; 