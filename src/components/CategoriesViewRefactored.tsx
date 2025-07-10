import React, { useState, useEffect } from 'react';
import { Fab, Card, CardContent, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import type { Category } from '../types/api';
import { apiService } from '../services/api';
import { logger } from '../services/logger';

// Импорты переиспользуемых компонентов
import { PageContainer, DataTable, CrudDialog, type TableColumn } from './shared';
import { useCrudDialog } from '../hooks/useCrudDialog';

const CategoriesViewRefactored: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Используем переиспользуемый хук для управления диалогами
  const {
    addOpen,
    editOpen,
    deleteOpen,
    selectedItem: selectedCategory,
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog
  } = useCrudDialog<Category>();
  
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
      closeAddDialog();
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
      closeEditDialog();
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
      closeDeleteDialog();
      await loadCategories();
      logger.info('Category deleted', 'USER_ACTION', { id: selectedCategory.id, name: selectedCategory.name });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to delete category', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleEdit = (category: Category) => {
    setEditCategoryName(category.name);
    openEditDialog(category);
  };

  // Конфигурация колонок таблицы
  const columns: TableColumn<Category>[] = [
    {
      key: 'name',
      label: t('categories.name'),
      align: 'left'
    }
  ];

  return (
    <PageContainer
      title={t('categories.title')}
      error={error}
      loading={loading}
      onErrorClose={() => setError(null)}
    >
      <Card>
        <CardContent>
          <DataTable<Category>
            data={categories}
            columns={columns}
            emptyMessage={t('categories.noCategories')}
            actionsLabel={t('categories.actions')}
            onEdit={handleEdit}
            onDelete={openDeleteDialog}
          />
        </CardContent>
      </Card>

      {/* Add Category FAB */}
      <Fab
        color="primary"
        aria-label="add category"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={openAddDialog}
      >
        <AddIcon />
      </Fab>

      {/* Add Category Dialog */}
      <CrudDialog
        open={addOpen}
        onClose={closeAddDialog}
        title={t('categories.addCategory')}
        onSave={handleAddCategory}
        saveLabel={t('categories.save')}
        cancelLabel={t('categories.cancel')}
        saveDisabled={!newCategoryName.trim()}
        variant="add"
      >
        <TextField
          autoFocus
          margin="dense"
          label={t('categories.name')}
          fullWidth
          variant="outlined"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
      </CrudDialog>

      {/* Edit Category Dialog */}
      <CrudDialog
        open={editOpen}
        onClose={closeEditDialog}
        title={t('categories.editCategory')}
        onSave={handleEditCategory}
        saveLabel={t('categories.save')}
        cancelLabel={t('categories.cancel')}
        saveDisabled={!editCategoryName.trim()}
        variant="edit"
      >
        <TextField
          autoFocus
          margin="dense"
          label={t('categories.name')}
          fullWidth
          variant="outlined"
          value={editCategoryName}
          onChange={(e) => setEditCategoryName(e.target.value)}
        />
      </CrudDialog>

      {/* Delete Category Dialog */}
      <CrudDialog
        open={deleteOpen}
        onClose={closeDeleteDialog}
        title={t('categories.deleteCategory')}
        onSave={handleDeleteCategory}
        saveLabel={t('categories.delete')}
        cancelLabel={t('categories.cancel')}
        variant="delete"
      >
        <div>
          {t('categories.confirmDelete')}
          {selectedCategory && (
            <div style={{ marginTop: '8px', color: 'gray' }}>
              {selectedCategory.name}
            </div>
          )}
        </div>
      </CrudDialog>
    </PageContainer>
  );
};

export default CategoriesViewRefactored; 