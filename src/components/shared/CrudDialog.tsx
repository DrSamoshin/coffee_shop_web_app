import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import { UI } from '../../config/constants';

interface CrudDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  saveDisabled?: boolean;
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'add' | 'edit' | 'delete';
}

export const CrudDialog: React.FC<CrudDialogProps> = ({
  open,
  onClose,
  title,
  children,
  onSave,
  onCancel,
  saveLabel = 'Сохранить',
  cancelLabel = 'Отмена',
  saveDisabled = false,
  loading = false,
  maxWidth = 'sm',
  variant = 'add'
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const getSaveButtonColor = () => {
    switch (variant) {
      case 'delete':
        return 'error';
      case 'add':
      case 'edit':
      default:
        return 'success';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={maxWidth} 
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleCancel}
          sx={{ 
            color: UI.COLORS.text.secondary, 
            '&:hover, &:active, &:focus': { 
              color: UI.COLORS.text.secondary 
            } 
          }}
        >
          {cancelLabel}
        </Button>
        <Button 
          onClick={onSave}
          variant="contained" 
          color={getSaveButtonColor()}
          disabled={saveDisabled || loading}
        >
          {loading ? <CircularProgress size={20} /> : saveLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 