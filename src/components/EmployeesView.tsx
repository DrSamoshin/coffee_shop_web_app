import React, { useState, useEffect, useCallback } from 'react';
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
import RestoreIcon from '@mui/icons-material/Restore';
import { useTranslation } from 'react-i18next';
import type { Employee } from '../types/api';
import { apiService } from '../services/api';
import { logger } from '../services/logger';
import { useConstants } from '../hooks/useConstants';
import { UI } from '../config/constants';
import { FilterToggle } from './shared';

const EmployeesView: React.FC = () => {
  const { t } = useTranslation();
  const { constants, loading: constantsLoading } = useConstants();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeactivatedOnly, setShowDeactivatedOnly] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Form states
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeePosition, setNewEmployeePosition] = useState<string>('');
  const [editEmployeeName, setEditEmployeeName] = useState('');
  const [editEmployeePosition, setEditEmployeePosition] = useState<string>('');

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = showDeactivatedOnly 
        ? await apiService.getDeactivatedEmployees()
        : await apiService.getEmployees();
      setEmployees(data);
      logger.info('EmployeesView', 'Employees loaded successfully', { count: data.length, deactivatedOnly: showDeactivatedOnly });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('EmployeesView', 'Failed to load employees', err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [showDeactivatedOnly]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Устанавливаем позицию по умолчанию когда загружаются константы
  useEffect(() => {
    if (constants.employeePositions.length > 0 && !newEmployeePosition) {
      setNewEmployeePosition(constants.employeePositions[0]);
    }
  }, [constants.employeePositions, newEmployeePosition]);

  const handleAddEmployee = async () => {
    if (!newEmployeeName.trim()) return;
    
    try {
      await apiService.createEmployee({
        name: newEmployeeName.trim(),
        position: newEmployeePosition
      });
      setNewEmployeeName('');
      setNewEmployeePosition(constants.employeePositions.length > 0 ? constants.employeePositions[0] : '');
      setAddDialogOpen(false);
      await loadEmployees();
      logger.info('Employee created', 'USER_ACTION', { name: newEmployeeName, position: newEmployeePosition });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to create employee', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleSaveEmployee = async () => {
    if (!selectedEmployee || !editEmployeeName.trim()) return;
    
    try {
      await apiService.updateEmployee(selectedEmployee.id, {
        name: editEmployeeName.trim(),
        position: editEmployeePosition
      });
      setEditDialogOpen(false);
      setSelectedEmployee(null);
      setEditEmployeeName('');
      setEditEmployeePosition(constants.employeePositions.length > 0 ? constants.employeePositions[0] : '');
      await loadEmployees();
      logger.info('Employee updated', 'USER_ACTION', { id: selectedEmployee.id, name: editEmployeeName, position: editEmployeePosition });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to update employee', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      await apiService.deleteEmployee(selectedEmployee.id);
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
      await loadEmployees();
      logger.info('Employee deleted', 'USER_ACTION', { id: selectedEmployee.id, name: selectedEmployee.name });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to delete employee', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleActivateEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      await apiService.activateEmployee(selectedEmployee.id);
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
      await loadEmployees();
      logger.info('Employee activated', 'USER_ACTION', { id: selectedEmployee.id, name: selectedEmployee.name });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to activate employee', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditEmployeeName(employee.name || '');
    
    // Проверяем, есть ли позиция сотрудника в списке доступных позиций
    const currentPosition = employee.position || '';
    const validPosition = constants.employeePositions.includes(currentPosition) 
      ? currentPosition 
      : (constants.employeePositions.length > 0 ? constants.employeePositions[0] : '');
      
    setEditEmployeePosition(validPosition);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
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
        {t('employees.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <FilterToggle
        value={showDeactivatedOnly ? 'deactivated' : 'all'}
        onChange={(value) => setShowDeactivatedOnly(value === 'deactivated')}
        options={[
          { value: 'all', label: t('employees.allEmployees') },
          { value: 'deactivated', label: t('employees.showDeactivated') }
        ]}
      />

      <Card>
        <CardContent>
          {employees.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {t('employees.noEmployees')}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>{t('employees.name')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>{t('employees.position')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', width: '150px', minWidth: '150px', maxWidth: '150px', whiteSpace: 'nowrap' }}>{t('employees.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id} sx={{ height: 48 }}>
                      <TableCell sx={{ py: 1, textAlign: 'left' }}>{employee.name}</TableCell>
                      <TableCell sx={{ py: 1, textAlign: 'left' }}>{employee.position}</TableCell>
                      <TableCell align="right" sx={{ py: 1, width: '150px', minWidth: '150px', maxWidth: '150px', whiteSpace: 'nowrap' }}>
                        {!showDeactivatedOnly && (
                          <IconButton onClick={() => openEditDialog(employee)} size="small">
                            <EditIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          onClick={() => openDeleteDialog(employee)} 
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

      {/* Add Employee FAB */}
      <Fab
        color="primary"
        aria-label="add employee"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('employees.addEmployee')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('employees.name')}
            fullWidth
            variant="outlined"
            value={newEmployeeName}
            onChange={(e) => setNewEmployeeName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Position</InputLabel>
            <Select
              value={newEmployeePosition}
              onChange={(e) => setNewEmployeePosition(e.target.value as string)}
              label="Position"
            >
              {constants.employeePositions.map((position) => (
                <MenuItem key={position} value={position}>
                  {position}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} sx={{ color: UI.COLORS.text.secondary, '&:hover, &:active, &:focus': { color: UI.COLORS.text.secondary } }}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleAddEmployee} variant="contained" color="success">
            {t('categories.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('employees.editEmployee')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('employees.name')}
            fullWidth
            variant="outlined"
            value={editEmployeeName}
            onChange={(e) => setEditEmployeeName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Position</InputLabel>
            <Select
              value={editEmployeePosition}
              onChange={(e) => setEditEmployeePosition(e.target.value as string)}
              label="Position"
            >
              {constants.employeePositions.map((position) => (
                <MenuItem key={position} value={position}>
                  {position}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: UI.COLORS.text.secondary, '&:hover, &:active, &:focus': { color: UI.COLORS.text.secondary } }}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleSaveEmployee} variant="contained" color="success">
            {t('categories.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete/Activate Employee Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          {showDeactivatedOnly ? t('employees.activateEmployee') : t('employees.deleteEmployee')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {showDeactivatedOnly ? t('employees.confirmActivate') : t('employees.confirmDelete')}
          </Typography>
          {selectedEmployee && (
            <Typography variant="body2" color="text.secondary">
              {selectedEmployee.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: UI.COLORS.text.secondary, '&:hover, &:active, &:focus': { color: UI.COLORS.text.secondary } }}>
            {t('categories.cancel')}
          </Button>
          <Button 
            onClick={showDeactivatedOnly ? handleActivateEmployee : handleDeleteEmployee} 
            color={showDeactivatedOnly ? "success" : "error"} 
            variant="contained"
          >
            {showDeactivatedOnly ? t('employees.activate') : t('categories.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployeesView; 