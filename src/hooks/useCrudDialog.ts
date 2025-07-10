import { useState, useCallback } from 'react';

interface CrudDialogState<T> {
  addOpen: boolean;
  editOpen: boolean;
  deleteOpen: boolean;
  selectedItem: T | null;
}

export const useCrudDialog = <T>() => {
  const [state, setState] = useState<CrudDialogState<T>>({
    addOpen: false,
    editOpen: false,
    deleteOpen: false,
    selectedItem: null
  });

  const openAddDialog = useCallback(() => {
    setState(prev => ({ ...prev, addOpen: true, selectedItem: null }));
  }, []);

  const closeAddDialog = useCallback(() => {
    setState(prev => ({ ...prev, addOpen: false, selectedItem: null }));
  }, []);

  const openEditDialog = useCallback((item: T) => {
    setState(prev => ({ ...prev, editOpen: true, selectedItem: item }));
  }, []);

  const closeEditDialog = useCallback(() => {
    setState(prev => ({ ...prev, editOpen: false, selectedItem: null }));
  }, []);

  const openDeleteDialog = useCallback((item: T) => {
    setState(prev => ({ ...prev, deleteOpen: true, selectedItem: item }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setState(prev => ({ ...prev, deleteOpen: false, selectedItem: null }));
  }, []);

  const closeAllDialogs = useCallback(() => {
    setState({
      addOpen: false,
      editOpen: false,
      deleteOpen: false,
      selectedItem: null
    });
  }, []);

  return {
    // Состояния
    addOpen: state.addOpen,
    editOpen: state.editOpen,
    deleteOpen: state.deleteOpen,
    selectedItem: state.selectedItem,
    
    // Методы управления
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    closeAllDialogs
  };
}; 