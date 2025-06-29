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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Fab,
  Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import type { ReportingPeriod } from '../types/api';
import { apiService } from '../services/api';
import { logger } from '../services/logger';

const ReportingPeriodsView: React.FC = () => {
  const { t } = useTranslation();
  const [periods, setPeriods] = useState<ReportingPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getReportingPeriods();
      const periodsArray = Array.isArray(data) ? data : [];
      setPeriods(periodsArray);
      logger.info('Reporting periods loaded successfully', 'COMPONENT_STATE', { count: periodsArray.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to load reporting periods', err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeriod = async () => {
    try {
      await apiService.createReportingPeriod();
      setAddDialogOpen(false);
      await loadPeriods();
      logger.info('Reporting period created', 'USER_ACTION', {});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to create reporting period', err instanceof Error ? err : new Error(errorMessage));
    }
  };



  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === null) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('ru-RU');
    } catch {
      return 'Invalid Date';
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
        {t('reportingPeriods.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {!Array.isArray(periods) || periods.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {t('reportingPeriods.noPeriods')}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('reportingPeriods.startDate')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('reportingPeriods.endDate')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('reportingPeriods.active')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(periods) && periods.map((period) => (
                    <TableRow key={period.id} sx={{ height: 48 }}>
                      <TableCell sx={{ py: 1 }}>{formatDate(period.start_time)}</TableCell>
                      <TableCell sx={{ py: 1 }}>{formatDate(period.end_time)}</TableCell>
                      <TableCell sx={{ py: 1 }}>
                        {period.active ? (
                          <CheckCircleIcon sx={{ color: 'green' }} />
                        ) : (
                          'Нет'
                        )}
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
        aria-label="add period"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Add Period Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('reportingPeriods.addPeriod')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('reportingPeriods.confirmCreate')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleAddPeriod} variant="contained" color="success">
            {t('reportingPeriods.create')}
          </Button>
        </DialogActions>
      </Dialog>


    </Container>
  );
};

export default ReportingPeriodsView;
