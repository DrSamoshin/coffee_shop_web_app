import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';

export interface TableColumn<T = { id?: string | number }> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableAction<T = { id?: string | number }> {
  icon: React.ReactNode;
  onClick: (row: T) => void;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  tooltip?: string;
  show?: (row: T) => boolean;
}

interface DataTableProps<T = { id?: string | number }> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  emptyMessage?: string;
  actionsLabel?: string;
  showDefaultActions?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  isDeleteMode?: boolean;
}

export const DataTable = <T extends { id?: string | number }>({
  data,
  columns,
  actions = [],
  emptyMessage = 'Нет данных',
  actionsLabel = 'Действия',
  showDefaultActions = true,
  onEdit,
  onDelete,
  isDeleteMode = false
}: DataTableProps<T>) => {
  // Добавляем стандартные действия если они не переданы явно
  const defaultActions: TableAction<T>[] = [];
  
  if (showDefaultActions && onEdit) {
    defaultActions.push({
      icon: <EditIcon />,
      onClick: onEdit,
      color: 'default',
      show: () => !isDeleteMode
    });
  }
  
  if (showDefaultActions && onDelete) {
    defaultActions.push({
      icon: isDeleteMode ? <RestoreIcon /> : <DeleteIcon />,
      onClick: onDelete,
      color: isDeleteMode ? 'success' : 'error'
    });
  }

  const allActions = [...defaultActions, ...actions];
  const hasActions = allActions.length > 0;

  if (data.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell 
                key={column.key}
                sx={{ 
                  fontWeight: 'bold', 
                  textAlign: column.align || 'left',
                  width: column.width
                }}
              >
                {column.label}
              </TableCell>
            ))}
            {hasActions && (
              <TableCell 
                align="right" 
                sx={{ 
                  fontWeight: 'bold', 
                  width: '150px', 
                  minWidth: '150px', 
                  maxWidth: '150px', 
                  whiteSpace: 'nowrap' 
                }}
              >
                {actionsLabel}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.id || index} sx={{ height: 48 }}>
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  sx={{ 
                    py: 1, 
                    textAlign: column.align || 'left' 
                  }}
                >
                  {column.render 
                    ? column.render((row as Record<string, unknown>)[column.key], row)
                    : (row as Record<string, unknown>)[column.key] as React.ReactNode
                  }
                </TableCell>
              ))}
              {hasActions && (
                <TableCell 
                  align="right" 
                  sx={{ 
                    py: 1, 
                    width: '150px', 
                    minWidth: '150px', 
                    maxWidth: '150px', 
                    whiteSpace: 'nowrap' 
                  }}
                >
                  {allActions.map((action, actionIndex) => {
                    if (action.show && !action.show(row)) {
                      return null;
                    }
                    
                    return (
                      <IconButton 
                        key={actionIndex}
                        onClick={() => action.onClick(row)} 
                        size="small"
                        color={action.color}
                        title={action.tooltip}
                      >
                        {action.icon}
                      </IconButton>
                    );
                  })}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 