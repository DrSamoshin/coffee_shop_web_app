import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Refresh, Edit, CheckCircle } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { UI } from '../config/constants';
import { apiService } from '../services/api';
import { logger } from '../services/logger';
import type { Order, OrderStatus } from '../types/api';
import { useConstants } from '../hooks/useConstants';
import { PageContainer } from './shared';

const OrdersView: React.FC = () => {
  const { t } = useTranslation();
  const { constants, loading: constantsLoading } = useConstants();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('waiting');
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
      logger.info('OrdersView', 'Orders loaded successfully', { count: ordersData.length });
    } catch (err) {
      logger.error('OrdersView', 'Error loading orders', err instanceof Error ? err : new Error(String(err)));
      setError(t('common.ordersLoadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      setUpdateLoading(selectedOrder.id);
      await apiService.updateOrderStatus(selectedOrder.id, newStatus);
      
      // Обновляем заказ в списке
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: newStatus }
          : order
      ));
      
      setDialogOpen(false);
      setSelectedOrder(null);
      logger.info('OrdersView', 'Order status updated', { orderId: selectedOrder.id, newStatus });
    } catch (err) {
      logger.error('OrdersView', 'Error updating order status', err instanceof Error ? err : new Error(String(err)));
      setError(t('common.orderUpdateError'));
    } finally {
      setUpdateLoading(null);
    }
  };

  const openUpdateDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setDialogOpen(true);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'waiting':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'waiting':
        return t('status.waiting');
      case 'completed':
        return t('status.completed');
      case 'cancelled':
        return t('status.cancelled');
      default:
        return status;
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  return (
    <PageContainer
      title={t('orders.title')}
      loading={loading || constantsLoading}
      error={error}
      onErrorClose={() => setError('')}
    >
      {/* Кнопка обновления */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadOrders}
          disabled={loading}
        >
          {t('orders.refresh')}
        </Button>
      </Box>

      {/* Статистика заказов */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card elevation={2} sx={{ minWidth: 150 }}>
          <CardContent>
            <Typography color="text.secondary" variant="body2">
              {t('orders.total')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {orders.length}
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={2} sx={{ minWidth: 150 }}>
          <CardContent>
            <Typography color="text.secondary" variant="body2">
              {t('orders.pending')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: UI.COLORS.warning.main }}>
              {orders.filter(o => o.status === 'waiting').length}
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={2} sx={{ minWidth: 150 }}>
          <CardContent>
            <Typography color="text.secondary" variant="body2">
              {t('orders.completed')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: UI.COLORS.success.main }}>
              {orders.filter(o => o.status === 'completed').length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Таблица заказов */}
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: UI.COLORS.background.cardHover }}>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>{t('orders.id')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>{t('orders.date')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>{t('orders.amount')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>Скидка</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>Тип</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>Оплата</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>{t('orders.status')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', width: '150px', minWidth: '150px', maxWidth: '150px', whiteSpace: 'nowrap' }}>{t('orders.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>#{order.order_number}</TableCell>
                  <TableCell sx={{ py: 1, textAlign: 'left' }}>{formatDate(order.date)}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>{formatCurrency(order.price)}</TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>{parseFloat(order.discount) > 0 ? formatCurrency(order.discount) : '-'}</TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>
                    <Chip
                      label={order.type === 'dine_in' ? 'В заведении' : order.type === 'takeaway' ? 'На вынос' : 'Доставка'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>
                    <Chip
                      label={order.payment_method === 'cash' ? 'Наличные' : 'Карта'}
                      size="small"
                      color={order.payment_method === 'cash' ? 'default' : 'primary'}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'left' }}>
                    <Chip
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1, width: '150px', minWidth: '150px', maxWidth: '150px', whiteSpace: 'nowrap' }}>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => openUpdateDialog(order)}
                      disabled={updateLoading === order.id}
                    >
                      Редактировать
                    </Button>
                    {order.status === 'waiting' && (
                      <Button
                        size="small"
                        startIcon={<CheckCircle />}
                        color="success"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus('completed');
                          handleUpdateStatus();
                        }}
                        disabled={updateLoading === order.id}
                      >
                        Завершить
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {orders.length === 0 && !loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Заказов не найдено
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Диалог обновления статуса */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          Изменить статус заказа #{selectedOrder?.order_number}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{t('orders.status')}</InputLabel>
            <Select
              value={newStatus}
              label={t('orders.status')}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            >
              {constants.orderStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status === 'waiting' ? t('status.waiting') :
                   status === 'completed' ? t('status.completed') :
                   status === 'cancelled' ? t('status.cancelled') : status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: UI.COLORS.text.secondary, '&:hover, &:active, &:focus': { color: UI.COLORS.text.secondary } }}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={updateLoading !== null}
          >
            {updateLoading ? <CircularProgress size={20} /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default OrdersView; 