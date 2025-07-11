import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line, Bar, AreaChart, Area } from 'recharts';
import { apiService } from '../services/api';
import { logger } from '../services/logger';
import { UI } from '../config/constants';
import { FilterToggle } from './shared';
import type { OrdersReport, Shift, ProductSummary, CategorySummary, OrderSummary } from '../types/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ReportView: React.FC = () => {
  const { t } = useTranslation();
  
  // State for report type
  const [reportType, setReportType] = useState<'shift' | 'period'>('shift');
  
  // State for shift selection
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [shiftsLoading, setShiftsLoading] = useState(false);
  
  // State for reports
  const [ordersReport, setOrdersReport] = useState<OrdersReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrdersReport = useCallback(async (shiftId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getOrdersReport(shiftId);
      setOrdersReport(data);
      logger.info('ReportView', 'Orders report loaded successfully', { shiftId });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders report';
      setError(errorMessage);
      logger.error('ReportView', 'Error loading orders report', err instanceof Error ? err : undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadShifts = useCallback(async () => {
    try {
      setShiftsLoading(true);
      const data = await apiService.getShifts();
      setShifts(data);
      logger.info('ReportView', 'Shifts loaded successfully', { count: data.length });
      
      // Обновляем отчет для выбранной смены, если она выбрана
      if (selectedShiftId) {
        await loadOrdersReport(selectedShiftId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load shifts';
      setError(errorMessage);
      logger.error('ReportView', 'Error loading shifts', err instanceof Error ? err : undefined);
    } finally {
      setShiftsLoading(false);
    }
  }, [selectedShiftId, loadOrdersReport]);

  // Load shifts on component mount
  useEffect(() => {
    loadShifts();
  }, [loadShifts]);



  // Load orders report when shift is selected
  useEffect(() => {
    if (selectedShiftId) {
      loadOrdersReport(selectedShiftId);
    }
  }, [selectedShiftId, loadOrdersReport]);

  const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      useGrouping: true,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPrice = (amount: number): string => {
    if (isNaN(amount)) return '0,00';
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount).replace('.', ',');
  };

  const formatDateOnly = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'waiting': return 'warning';
      case 'cancelled': return 'error';
      case 'in_progress': return 'info';
      default: return 'default';
    }
  };

  const renderComposedProductsChart = (products: ProductSummary[], title: string) => {
    if (!products || products.length === 0) return null;

    const chartData = products.map(product => ({
      name: product.product_name,
      count: product.count,
      price: product.total_product_price
    }));

    return (
      <Card sx={{ mb: 3, mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={150} />
              <YAxis yAxisId="left" label={{ value: t('report.quantity'), angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: t('report.price'), angle: 90, position: 'insideRight' }} />
              <Tooltip formatter={(value, name) => [formatNumber(Number(value)), name]} />
              <Bar yAxisId="left" dataKey="count" fill="#8884d8" name={t('report.quantity')} />
              <Line yAxisId="right" type="monotone" dataKey="price" stroke="#ff7300" strokeWidth={3} name={t('report.price')} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderCategoriesChart = (categories: CategorySummary[], title: string) => {
    if (!categories || categories.length === 0) return null;

    const chartData = categories.map((category, index) => ({
      name: category.product_category,
      value: category.total_product_price,
      fill: COLORS[index % COLORS.length]
    }));

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={180}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatPrice(Number(value)), t('report.price')]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderPaymentMethodChart = (orders: OrderSummary[]) => {
    if (!orders || orders.length === 0) return null;

    const paymentMethodCounts = orders.reduce((acc, order) => {
      const method = order.order_payment_method || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(paymentMethodCounts).map(([method, count], index) => ({
      name: method,
      value: count,
      fill: COLORS[index % COLORS.length]
    }));

    return (
      <Card sx={{ mb: 3, flex: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('report.paymentMethod')}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, t('report.quantity')]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderOrderTypeChart = (orders: OrderSummary[]) => {
    if (!orders || orders.length === 0) return null;

    const orderTypeCounts = orders.reduce((acc, order) => {
      const type = order.order_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(orderTypeCounts).map(([type, count], index) => ({
      name: type,
      value: count,
      fill: COLORS[index % COLORS.length]
    }));

    return (
      <Card sx={{ mb: 3, flex: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('report.orderType')}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, t('report.quantity')]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderOrderDensityChart = (orders: OrderSummary[]) => {
    if (!orders || orders.length === 0) return null;

    // Группируем заказы по часам
    const hourlyData = orders.reduce((acc, order) => {
      const hour = new Date(order.order_date).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Создаем данные для всех 24 часов
    const chartData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      orders: hourlyData[hour] || 0
    }));

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('report.orderDensity')}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                domain={['dataMin', 'dataMax']}
                type="category"
                tick={{ fontSize: UI.SIZES.FONT.SMALL }}
                interval={0}
              />
              <YAxis />
              <Tooltip formatter={(value) => [value, t('report.orderCount')]} />
              <Area type="monotone" dataKey="orders" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderOrdersTable = (orders: OrderSummary[], title: string) => {
    if (!orders || orders.length === 0) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <TableContainer>
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>{t('report.time')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>{t('report.price')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>{t('report.discount')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>{t('report.paymentMethod')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>{t('report.orderType')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>{t('report.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.order_id} sx={{ height: UI.SIZES.SPACING.XL + UI.SIZES.SPACING.MD }}>
                    <TableCell sx={{ py: UI.SIZES.SPACING.XS, textAlign: 'left' }}>{formatTime(order.order_date)}</TableCell>
                    <TableCell sx={{ py: UI.SIZES.SPACING.XS, textAlign: 'right' }}>{formatPrice(order.order_price)}</TableCell>
                    <TableCell sx={{ py: UI.SIZES.SPACING.XS, textAlign: 'right' }}>{formatPrice(order.order_discount)}</TableCell>
                    <TableCell sx={{ py: UI.SIZES.SPACING.XS, textAlign: 'right' }}>{order.order_payment_method}</TableCell>
                    <TableCell sx={{ py: UI.SIZES.SPACING.XS, textAlign: 'right' }}>{order.order_type}</TableCell>
                    <TableCell sx={{ py: UI.SIZES.SPACING.XS, textAlign: 'right' }}>
                      <Chip 
                        label={order.order_status} 
                        color={getStatusColor(order.order_status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const renderOrdersReport = () => {
    if (!ordersReport) return null;

    return (
      <>
        {/* Summary Cards */}
        <Card sx={{ mb: UI.SIZES.SPACING.LG }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('report.shiftSummary')}
            </Typography>
                            <Box sx={{ display: 'flex', gap: UI.SIZES.SPACING.MD, flexWrap: 'wrap' }}>
                              <Box sx={{ flex: '1 1 300px', textAlign: 'center', p: UI.SIZES.SPACING.MD, bgcolor: 'primary.light', borderRadius: UI.SIZES.BORDER.RADIUS.SMALL }}>
                <Typography variant="h4" color="primary.contrastText">
                  {formatPrice(ordersReport.total_income)}
                </Typography>
                <Typography variant="body2" color="primary.contrastText">
                  {t('report.totalIncome')}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 300px', textAlign: 'center', p: UI.SIZES.SPACING.MD, bgcolor: 'secondary.light', borderRadius: UI.SIZES.BORDER.RADIUS.SMALL }}>
                <Typography variant="h4" color="secondary.contrastText">
                  {formatNumber(ordersReport.total_number_orders)}
                </Typography>
                <Typography variant="body2" color="secondary.contrastText">
                  {t('report.totalOrders')}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 300px', textAlign: 'center', p: UI.SIZES.SPACING.MD, bgcolor: 'success.light', borderRadius: UI.SIZES.BORDER.RADIUS.SMALL }}>
                <Typography variant="h4" color="success.contrastText">
                  {formatNumber(ordersReport.total_number_sold_products)}
                </Typography>
                <Typography variant="body2" color="success.contrastText">
                  {t('report.totalProducts')}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 300px', textAlign: 'center', p: UI.SIZES.SPACING.MD, bgcolor: 'warning.light', borderRadius: UI.SIZES.BORDER.RADIUS.SMALL }}>
                <Typography variant="h4" color="warning.contrastText">
                  {formatPrice(ordersReport.average_bill)}
                </Typography>
                <Typography variant="body2" color="warning.contrastText">
                  {t('report.averageBill')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Debit False Section */}
        <Typography variant="h5" gutterBottom sx={{ mt: UI.SIZES.SPACING.XL, mb: UI.SIZES.SPACING.MD }}>
          {t('report.debitFalse')}
        </Typography>
        <Divider sx={{ mb: UI.SIZES.SPACING.LG }} />
        
        {renderComposedProductsChart(ordersReport.debit_false_products_sum_json, t('report.debitFalseProducts'))}
        {renderCategoriesChart(ordersReport.debit_false_categories_sum_json, t('report.debitFalseCategories'))}
        
        {/* Payment Method and Order Type Charts in one row */}
        <Box sx={{ display: 'flex', gap: UI.SIZES.SPACING.MD, mb: UI.SIZES.SPACING.LG }}>
          {renderPaymentMethodChart(ordersReport.debit_false_unique_orders_json)}
          {renderOrderTypeChart(ordersReport.debit_false_unique_orders_json)}
        </Box>
        
        {/* Order Density Chart */}
        {renderOrderDensityChart(ordersReport.debit_false_unique_orders_json)}
        
        {renderOrdersTable(ordersReport.debit_false_unique_orders_json, t('report.debitFalseOrders'))}

        {/* Debit True Section */}
        {ordersReport.debit_true_unique_orders_json && ordersReport.debit_true_unique_orders_json.length > 0 && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mt: UI.SIZES.SPACING.XL, mb: UI.SIZES.SPACING.MD }}>
              {t('report.debitTrue')}
            </Typography>
            <Divider sx={{ mb: UI.SIZES.SPACING.LG }} />
            
            {renderOrdersTable(ordersReport.debit_true_unique_orders_json, t('report.debitTrueOrders'))}
          </>
        )}
      </>
    );
  };

  return (
    <Container maxWidth={false} sx={{
      width: '100%',
      padding: UI.SIZES.SPACING.LG, 
      backgroundColor: UI.COLORS.background.default,
      borderRadius: UI.SIZES.BORDER.RADIUS.LARGE,
      minHeight: '80vh',
    }}>
      <Typography variant="h4" gutterBottom>
          {t('navigation.report')}
        </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: UI.SIZES.SPACING.MD }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <FilterToggle
        value={reportType}
        onChange={(value) => setReportType(value as 'shift' | 'period')}
        options={[
          { value: 'shift', label: t('report.shiftReport') },
          { value: 'period', label: t('report.periodReport') }
        ]}
      />

      {reportType === 'period' && (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="60vh"
        >
          <Typography variant="h5" color="text.secondary">
            {t('images.inDevelopment')}
          </Typography>
        </Box>
      )}

      {reportType === 'shift' && (
        <>
          {/* Shift Selection */}
          <Card sx={{ mb: UI.SIZES.SPACING.LG }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('report.selectShift')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: UI.SIZES.SPACING.MD }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>{t('report.shift')}</InputLabel>
                  <Select
                    value={selectedShiftId}
                    onChange={(e) => setSelectedShiftId(e.target.value)}
                    label={t('report.shift')}
                    disabled={shiftsLoading}
                  >
                                  {shifts.map((shift) => (
                                     <MenuItem key={shift.id} value={shift.id}>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: UI.SIZES.SPACING.SM }}>
                         {shift.start_time ? formatDateOnly(shift.start_time) : 'No date'}
                         {shift.active && (
                           <Typography sx={{ 
                             color: 'success.main', 
            fontWeight: UI.SIZES.FONT.WEIGHTS.BOLD, 
                             fontSize: UI.SIZES.FONT.MEDIUM
                           }}>
                             {t('common.active')}
                           </Typography>
                         )}
                       </Box>
                     </MenuItem>
                  ))}
                  </Select>
                </FormControl>
                <IconButton
                  onClick={loadShifts}
                  disabled={shiftsLoading}
                  color="primary"
                  title={t('report.refreshShifts')}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          )}

          {/* Orders Report */}
          {!loading && selectedShiftId && renderOrdersReport()}
        </>
      )}
    </Container>
  );
};

export default ReportView; 