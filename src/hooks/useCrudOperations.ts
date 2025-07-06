import { useState } from 'react';
import { logger } from '../services/logger';

export interface CrudOperations<T> {
  // Состояния диалогов
  addDialogOpen: boolean;
  editDialogOpen: boolean;
  deleteDialogOpen: boolean;
  
  // Выбранный элемент
  selectedItem: T | null;
  
  // Действия с диалогами
  openAddDialog: () => void;
  closeAddDialog: () => void;
  openEditDialog: (item: T) => void;
  closeEditDialog: () => void;
  openDeleteDialog: (item: T) => void;
  closeDeleteDialog: () => void;
  
  // CRUD операции
  handleCreate: (createFn: () => Promise<void>) => Promise<void>;
  handleUpdate: (updateFn: () => Promise<void>) => Promise<void>;
  handleDelete: (deleteFn: () => Promise<void>) => Promise<void>;
}

/**
 * Универсальный хук для CRUD операций
 * Следует принципам Single Responsibility и DRY
 */
export function useCrudOperations<T>(componentName: string): CrudOperations<T> {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openAddDialog = () => {
    setAddDialogOpen(true);
    logger.userAction('open_add_dialog', componentName);
  };

  const closeAddDialog = () => {
    setAddDialogOpen(false);
    setSelectedItem(null);
  };

  const openEditDialog = (item: T) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
    logger.userAction('open_edit_dialog', componentName, { item });
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedItem(null);
  };

  const openDeleteDialog = (item: T) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
    logger.userAction('open_delete_dialog', componentName, { item });
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleCreate = async (createFn: () => Promise<void>) => {
    try {
      logger.userAction('create_started', componentName);
      await createFn();
      closeAddDialog();
      logger.userAction('create_success', componentName);
    } catch (err) {
      logger.error(componentName, 'Create operation failed', 
        err instanceof Error ? err : new Error('Create failed')
      );
      throw err;
    }
  };

  const handleUpdate = async (updateFn: () => Promise<void>) => {
    try {
      logger.userAction('update_started', componentName, { selectedItem });
      await updateFn();
      closeEditDialog();
      logger.userAction('update_success', componentName);
    } catch (err) {
      logger.error(componentName, 'Update operation failed', 
        err instanceof Error ? err : new Error('Update failed')
      );
      throw err;
    }
  };

  const handleDelete = async (deleteFn: () => Promise<void>) => {
    try {
      logger.userAction('delete_started', componentName, { selectedItem });
      await deleteFn();
      closeDeleteDialog();
      logger.userAction('delete_success', componentName);
    } catch (err) {
      logger.error(componentName, 'Delete operation failed', 
        err instanceof Error ? err : new Error('Delete failed')
      );
      throw err;
    }
  };

  return {
    addDialogOpen,
    editDialogOpen,
    deleteDialogOpen,
    selectedItem,
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
} 