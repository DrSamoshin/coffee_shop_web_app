import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
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
import type { Order } from '../types/api';
import { OrderStatus } from '../types/api';

const OrdersView: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.WAITING);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(t('common.ordersLoadError'));
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
      console.error('Error updating order status:', err);
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
      case OrderStatus.WAITING:
        return 'warning';
      case OrderStatus.COMPLETED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'error';
      case OrderStatus.RETURNED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.WAITING:
        return t('status.waiting');
      case OrderStatus.COMPLETED:
        return t('status.completed');
      case OrderStatus.CANCELLED:
        return t('status.cancelled');
      case OrderStatus.RETURNED:
        return t('status.returned');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
          {t('orders.title')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadOrders}
          disabled={loading}
        >
          {t('orders.refresh')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

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
              {orders.filter(o => o.status === OrderStatus.WAITING).length}
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={2} sx={{ minWidth: 150 }}>
          <CardContent>
            <Typography color="text.secondary" variant="body2">
              {t('orders.completed')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: UI.COLORS.success.main }}>
              {orders.filter(o => o.status === OrderStatus.COMPLETED).length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Таблица заказов */}
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: UI.COLORS.background.cardHover }}>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('orders.id')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('orders.date')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('orders.amount')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Скидка</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Тип</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Оплата</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('orders.status')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('orders.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    #{order.order_number}
                  </TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(order.price)}
                  </TableCell>
                  <TableCell>
                    {parseFloat(order.discount) > 0 ? formatCurrency(order.discount) : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.type === 'dine_in' ? 'В заведении' : 
                             order.type === 'takeout' ? 'На вынос' : 'Доставка'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.payment_method === 'cash' ? 'Наличные' : 'Карта'}
                      size="small"
                      color={order.payment_method === 'cash' ? 'default' : 'primary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => openUpdateDialog(order)}
                      disabled={updateLoading === order.id}
                      sx={{ mr: 1 }}
                    >
                      Редактировать
                    </Button>
                    {order.status === OrderStatus.WAITING && (
                      <Button
                        size="small"
                        startIcon={<CheckCircle />}
                        color="success"
                                                 onClick={() => {
                           setSelectedOrder(order);
                           setNewStatus(OrderStatus.COMPLETED);
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
              <MenuItem value={OrderStatus.WAITING}>{t('status.waiting')}</MenuItem>
              <MenuItem value={OrderStatus.COMPLETED}>{t('status.completed')}</MenuItem>
              <MenuItem value={OrderStatus.CANCELLED}>{t('status.cancelled')}</MenuItem>
              <MenuItem value={OrderStatus.RETURNED}>{t('status.returned')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
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
    </Box>
  );
};

export default OrdersView; 