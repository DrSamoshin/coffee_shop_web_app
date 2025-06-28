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
  Container
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import type { Category } from '../types/api';
import { apiService } from '../services/api';
import { logger } from '../services/logger';

const CategoriesView: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCategories();
      setCategories(data);
      logger.info('Categories loaded successfully', 'COMPONENT_STATE', { count: data.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to load categories', err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      await apiService.createCategory(newCategoryName.trim());
      setNewCategoryName('');
      setAddDialogOpen(false);
      await loadCategories();
      logger.info('Category created', 'USER_ACTION', { name: newCategoryName });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to create category', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !editCategoryName.trim()) return;
    
    try {
      await apiService.updateCategory(selectedCategory.id, editCategoryName.trim());
      setEditDialogOpen(false);
      setSelectedCategory(null);
      await loadCategories();
      logger.info('Category updated', 'USER_ACTION', { id: selectedCategory.id, name: editCategoryName });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to update category', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      await apiService.deleteCategory(selectedCategory.id);
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      await loadCategories();
      logger.info('Category deleted', 'USER_ACTION', { id: selectedCategory.id, name: selectedCategory.name });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to delete category', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setEditCategoryName(category.name);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
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
        {t('categories.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {categories.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {t('categories.noCategories')}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('categories.name')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('categories.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} sx={{ height: 48 }}>
                      <TableCell sx={{ py: 1 }}>{category.name}</TableCell>
                      <TableCell align="right" sx={{ py: 1 }}>
                        <IconButton onClick={() => openEditDialog(category)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => openDeleteDialog(category)} size="small" color="error">
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

      {/* Add Category FAB */}
      <Fab
        color="primary"
        aria-label="add category"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Add Category Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('categories.addCategory')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('categories.name')}
            fullWidth
            variant="outlined"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleAddCategory} variant="contained" color="success">
            {t('categories.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('categories.editCategory')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('categories.name')}
            fullWidth
            variant="outlined"
            value={editCategoryName}
            onChange={(e) => setEditCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleEditCategory} variant="contained" color="success">
            {t('categories.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('categories.deleteCategory')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('categories.confirmDelete')}
          </Typography>
          {selectedCategory && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {selectedCategory.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleDeleteCategory} color="error" variant="contained">
            {t('categories.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoriesView; 