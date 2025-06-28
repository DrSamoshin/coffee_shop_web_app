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
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RestoreIcon from '@mui/icons-material/Restore';
import { useTranslation } from 'react-i18next';
import type { Supplier } from '../types/api';
import { apiService } from '../services/api';
import { logger } from '../services/logger';

const SuppliersView: React.FC = () => {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeactivatedOnly, setShowDeactivatedOnly] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // Form states
  const [newSupplierName, setNewSupplierName] = useState('');
  const [editSupplierName, setEditSupplierName] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, [showDeactivatedOnly]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = showDeactivatedOnly 
        ? await apiService.getDeactivatedSuppliers()
        : await apiService.getSuppliers();
      setSuppliers(data);
      logger.info('Suppliers loaded successfully', 'COMPONENT_STATE', { count: data.length, deactivatedOnly: showDeactivatedOnly });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to load suppliers', err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) return;
    
    try {
      await apiService.createSupplier(newSupplierName.trim());
      setNewSupplierName('');
      setAddDialogOpen(false);
      await loadSuppliers();
      logger.info('Supplier created', 'USER_ACTION', { name: newSupplierName });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to create supplier', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleSaveSupplier = async () => {
    if (!selectedSupplier || !editSupplierName.trim()) return;
    
    try {
      await apiService.updateSupplier(selectedSupplier.id, editSupplierName.trim());
      setEditDialogOpen(false);
      setSelectedSupplier(null);
      setEditSupplierName('');
      await loadSuppliers();
      logger.info('Supplier updated', 'USER_ACTION', { id: selectedSupplier.id, name: editSupplierName });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to update supplier', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;
    
    try {
      await apiService.deleteSupplier(selectedSupplier.id);
      setDeleteDialogOpen(false);
      setSelectedSupplier(null);
      await loadSuppliers();
      logger.info('Supplier deleted', 'USER_ACTION', { id: selectedSupplier.id, name: selectedSupplier.name });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to delete supplier', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleActivateSupplier = async () => {
    if (!selectedSupplier) return;
    
    try {
      await apiService.activateSupplier(selectedSupplier.id);
      setDeleteDialogOpen(false);
      setSelectedSupplier(null);
      await loadSuppliers();
      logger.info('Supplier activated', 'USER_ACTION', { id: selectedSupplier.id, name: selectedSupplier.name });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to activate supplier', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditSupplierName(supplier.name || '');
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDeleteDialogOpen(true);
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
        {t('suppliers.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
        <ToggleButtonGroup
          value={showDeactivatedOnly ? 'deactivated' : 'all'}
          exclusive
          onChange={(_, value) => {
            if (value !== null) {
              setShowDeactivatedOnly(value === 'deactivated');
            }
          }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.5,
              fontSize: '0.875rem',
              textTransform: 'none'
            }
          }}
        >
          <ToggleButton value="all">
            {t('suppliers.allSuppliers')}
          </ToggleButton>
          <ToggleButton value="deactivated">
            {t('suppliers.showDeactivated')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Card>
        <CardContent>
          {suppliers.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {t('suppliers.noSuppliers')}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('suppliers.name')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('suppliers.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id} sx={{ height: 48 }}>
                      <TableCell sx={{ py: 1 }}>{supplier.name || 'No name'}</TableCell>
                      <TableCell align="right" sx={{ py: 1 }}>
                        {!showDeactivatedOnly && (
                          <IconButton onClick={() => openEditDialog(supplier)} size="small">
                            <EditIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          onClick={() => openDeleteDialog(supplier)} 
                          size="small" 
                          color={showDeactivatedOnly ? "success" : "error"}
                        >
                          {showDeactivatedOnly ? <RestoreIcon /> : <DeleteIcon />}
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
        aria-label="add supplier"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('suppliers.addSupplier')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('suppliers.name')}
            fullWidth
            variant="outlined"
            value={newSupplierName}
            onChange={(e) => setNewSupplierName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleAddSupplier} variant="contained" color="success">
            {t('categories.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('suppliers.editSupplier')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('suppliers.name')}
            fullWidth
            variant="outlined"
            value={editSupplierName}
            onChange={(e) => setEditSupplierName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleSaveSupplier} variant="contained" color="success">
            {t('categories.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          {showDeactivatedOnly ? t('suppliers.activateSupplier') : t('suppliers.deleteSupplier')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {showDeactivatedOnly ? t('suppliers.confirmActivate') : t('suppliers.confirmDelete')}
          </Typography>
          {selectedSupplier && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {selectedSupplier.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button 
            onClick={showDeactivatedOnly ? handleActivateSupplier : handleDeleteSupplier} 
            color={showDeactivatedOnly ? "success" : "error"} 
            variant="contained"
          >
            {showDeactivatedOnly ? t('suppliers.activate') : t('categories.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SuppliersView;
