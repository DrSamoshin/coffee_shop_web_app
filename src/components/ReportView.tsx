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
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, Line, ComposedChart } from 'recharts';
import { apiService } from '../services/api';
import { logger } from '../services/logger';
import { UI, REPORT } from '../config/constants';
import { FilterToggle } from './shared';
import type { OrdersReport, Shift, ProductSummary, OrderSummary, CategoryOrderData } from '../types/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const CATEGORY_COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

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

  // State for order type filters in Order Density chart
  const [orderTypeFilters, setOrderTypeFilters] = useState({
    dine_in: false,
    takeaway: false,
    delivery: false
  });

  // State for category filters in Category Sales chart
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>({});

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

  // Initialize category filters when orders report changes
  useEffect(() => {
    if (ordersReport && ordersReport.product_categories.length > 0) {
      const categories = ordersReport.product_categories.reduce((acc, item) => {
        const categoryName = item.category_name;
        acc[categoryName] = false;
        return acc;
      }, {} as Record<string, boolean>);
      
      setCategoryFilters(prev => ({
        ...categories,
        ...prev // Сохраняем предыдущие настройки пользователя
      }));
    }
  }, [ordersReport]);

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



  const getLocalizedPaymentMethod = (method: string): string => {
    const methodKey = method.toLowerCase();
    const localizationKey = `report.${methodKey}`;
    const translated = t(localizationKey);
    return translated !== localizationKey ? translated : method;
  };

  const getLocalizedOrderType = (type: string): string => {
    const typeKey = type.toLowerCase().replace('-', '_');
    const localizationKey = `report.${typeKey}`;
    const translated = t(localizationKey);
    return translated !== localizationKey ? translated : type;
  };




  const renderCategoriesChart = (categoryOrderData: CategoryOrderData[], title: string) => {
    if (!categoryOrderData || categoryOrderData.length === 0) return null;

    // Группируем данные по 20-минутным интервалам и категориям
    const intervalData = categoryOrderData.reduce((acc, item) => {
      const date = new Date(item.order_date);
      const hour = date.getHours();
      const minute = date.getMinutes();
      const intervalIndex = Math.floor(minute / 20); // 0, 1, 2 for 0-19, 20-39, 40-59
      const timeKey = `${hour.toString().padStart(2, '0')}:${(intervalIndex * 20).toString().padStart(2, '0')}`;
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          total: 0,
          categories: {} as Record<string, number>
        };
      }
      
      const categoryName = item.category_name; // Используем оригинальное название
      
      acc[timeKey].total += item.count;
      if (!acc[timeKey].categories[categoryName]) {
        acc[timeKey].categories[categoryName] = 0;
      }
      acc[timeKey].categories[categoryName] += item.count;
      
      return acc;
    }, {} as Record<string, { total: number; categories: Record<string, number> }>);

    // Получаем уникальные категории (оригинальные названия)
    const categoryNames = Array.from(new Set(categoryOrderData.map(item => 
      item.category_name
    )));
    
    const handleCategoryFilterChange = (categoryName: string) => {
      setCategoryFilters(prev => ({
        ...prev,
        [categoryName]: !prev[categoryName]
      }));
    };

    // Создаем данные для всех 20-минутных интервалов в сутках (72 интервала)
    const chartData = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let interval = 0; interval < 3; interval++) {
        const timeKey = `${hour.toString().padStart(2, '0')}:${(interval * 20).toString().padStart(2, '0')}`;
        const intervalInfo = intervalData[timeKey];
        
        const dataPoint: Record<string, string | number> = {
          time: timeKey,
          total: intervalInfo ? intervalInfo.total : 0
        };
        
        // Добавляем реальное количество для каждой категории
        categoryNames.forEach(categoryName => {
          dataPoint[categoryName] = intervalInfo?.categories[categoryName] || 0;
        });
        
        chartData.push(dataPoint);
      }
    }



    return (
      <Card sx={{ mb: 3, flex: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          
          <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {categoryNames.map((categoryName: string, index: number) => (
              <FormControlLabel
                key={categoryName}
                control={
                  <Checkbox
                    checked={categoryFilters[categoryName] ?? false}
                    onChange={() => handleCategoryFilterChange(categoryName)}
                    sx={{ 
                      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length], 
                      '&.Mui-checked': { color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] } 
                    }}
                  />
                }
                label={categoryName}
              />
            ))}
          </Box>
          
          <ResponsiveContainer width="100%" height={REPORT.CHART.HEIGHT.SMALL}>
            <ComposedChart 
              data={chartData}
              onMouseDown={() => {}}
              onClick={() => {}}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: UI.SIZES.FONT.SMALL }}
                interval={2}
                angle={0}
                textAnchor="middle"
                height={60}
              />
                            <YAxis label={{ value: t('report.quantity'), angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [formatNumber(Number(value)), name === 'totalSales' ? t('report.totalSales') : String(name)]} 
                labelFormatter={(label) => `${t('report.time')}: ${label}`}
              />
                             <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.1}
                name="totalSales"
                isAnimationActive={false}
                activeDot={false}
              />
              {categoryNames.map((categoryName: string, index: number) => 
                (categoryFilters[categoryName] ?? false) && (
                  <Line 
                    key={categoryName}
                    type="monotone" 
                    dataKey={categoryName} 
                    stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                    strokeWidth={2}
                    name={categoryName}
                    dot={false}
                    isAnimationActive={false}
                    activeDot={false}
                  />
                )
              )}
            </ComposedChart>
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
      <Card sx={{ flex: 1 }}>
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
                label={({ name, percent }) => `${getLocalizedPaymentMethod(name)} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
                onMouseDown={() => {}}
                onClick={() => {}}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    style={{ outline: 'none' }}
                  />
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
      <Card sx={{ flex: 1 }}>
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
                label={({ name, percent }) => `${getLocalizedOrderType(name)} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
                onMouseDown={() => {}}
                onClick={() => {}}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    style={{ outline: 'none' }}
                  />
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

    // Группируем заказы по 20-минутным интервалам
    const intervalData = orders.reduce((acc, order) => {
      const date = new Date(order.order_date);
      const hour = date.getHours();
      const minute = date.getMinutes();
      const intervalIndex = Math.floor(minute / 20); // 0, 1, 2 for 0-19, 20-39, 40-59
      const timeKey = `${hour.toString().padStart(2, '0')}:${(intervalIndex * 20).toString().padStart(2, '0')}`;
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          total: 0,
          dine_in: 0,
          takeaway: 0,
          delivery: 0
        };
      }
      
      acc[timeKey].total += 1;
      
      // Группируем по типам заказов
      const orderType = order.order_type?.toLowerCase() || 'unknown';
      if (orderType === 'dine-in' || orderType === 'dine_in') {
        acc[timeKey].dine_in += 1;
      } else if (orderType === 'takeaway' || orderType === 'take_away') {
        acc[timeKey].takeaway += 1;
      } else if (orderType === 'delivery') {
        acc[timeKey].delivery += 1;
      }
      
      return acc;
    }, {} as Record<string, { total: number; dine_in: number; takeaway: number; delivery: number }>);

    // Создаем данные для всех 20-минутных интервалов в сутках (72 интервала)
    const chartData = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let interval = 0; interval < 3; interval++) {
        const timeKey = `${hour.toString().padStart(2, '0')}:${(interval * 20).toString().padStart(2, '0')}`;
        const data = intervalData[timeKey] || { total: 0, dine_in: 0, takeaway: 0, delivery: 0 };
        chartData.push({
          time: timeKey,
          total: data.total,
          dine_in: data.dine_in,
          takeaway: data.takeaway,
          delivery: data.delivery
        });
      }
    }

    const handleOrderTypeFilterChange = (orderType: keyof typeof orderTypeFilters) => {
      setOrderTypeFilters(prev => ({
        ...prev,
        [orderType]: !prev[orderType]
      }));
    };

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('report.orderDensity')}
          </Typography>
          
          <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={orderTypeFilters.dine_in}
                  onChange={() => handleOrderTypeFilterChange('dine_in')}
                  sx={{ color: '#00C49F', '&.Mui-checked': { color: '#00C49F' } }}
                />
              }
              label={t('report.dine_in')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={orderTypeFilters.takeaway}
                  onChange={() => handleOrderTypeFilterChange('takeaway')}
                  sx={{ color: '#FFBB28', '&.Mui-checked': { color: '#FFBB28' } }}
                />
              }
              label={t('report.takeaway')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={orderTypeFilters.delivery}
                  onChange={() => handleOrderTypeFilterChange('delivery')}
                  sx={{ color: '#FF8042', '&.Mui-checked': { color: '#FF8042' } }}
                />
              }
              label={t('report.delivery')}
            />
          </Box>
          
          <ResponsiveContainer width="100%" height={REPORT.CHART.HEIGHT.SMALL}>
            <ComposedChart 
              data={chartData}
              onMouseDown={() => {}}
              onClick={() => {}}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: UI.SIZES.FONT.SMALL }}
                interval={2}
                angle={0}
                textAnchor="middle"
                height={60}
              />
              <YAxis label={{ value: t('report.quantity'), angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [formatNumber(Number(value)), name === 'totalOrders' ? t('report.totalOrders') : t(`report.${name}`)]} 
                labelFormatter={(label) => `${t('report.time')}: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.1}
                name="totalOrders"
                isAnimationActive={false}
                activeDot={false}
              />
              {orderTypeFilters.dine_in && (
                <Line 
                  type="monotone" 
                  dataKey="dine_in" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="dine_in"
                  dot={false}
                  isAnimationActive={false}
                  activeDot={false}
                />
              )}
              {orderTypeFilters.takeaway && (
                <Line 
                  type="monotone" 
                  dataKey="takeaway" 
                  stroke="#FFBB28" 
                  strokeWidth={2}
                  name="takeaway"
                  dot={false}
                  isAnimationActive={false}
                  activeDot={false}
                />
              )}
              {orderTypeFilters.delivery && (
                <Line 
                  type="monotone" 
                  dataKey="delivery" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  name="delivery"
                  dot={false}
                  isAnimationActive={false}
                  activeDot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };



  const renderProductsTable = (products: ProductSummary[], title?: string) => {
    if (!products || products.length === 0) return null;

    return (
      <Card sx={{ mb: UI.SIZES.SPACING.LG }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title ? t(title) : t('report.productsTable')}
          </Typography>
          <TableContainer>
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>
                      {t('report.productName')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>
                      {t('report.productCategory')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                      {t('report.quantity')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                      {t('report.price')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    // Group products by category
                    const groupedProducts = products.reduce((acc, product) => {
                      const category = product.category_name;
                      if (!acc[category]) {
                        acc[category] = [];
                      }
                      acc[category].push(product);
                      return acc;
                    }, {} as Record<string, ProductSummary[]>);

                                         // Render groups with separators
                     return Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                                              <React.Fragment key={category}>
                         {/* Category separator */}
                         <TableRow sx={{ 
                           bgcolor: UI.COLORS.divider,
                           height: REPORT.TABLE.PRODUCTS.SEPARATOR_ROW_HEIGHT,
                           '& td': { 
                             borderBottom: 'none',
                             py: UI.SIZES.SPACING.XS,
                             color: UI.COLORS.text.primary,
                             fontWeight: 'bold'
                           }
                         }}>
                           <TableCell sx={{ textAlign: 'left' }}>
                             {/* Empty name field */}
                           </TableCell>
                           <TableCell sx={{ textAlign: 'left' }}>
                             {category}
                           </TableCell>
                           <TableCell sx={{ textAlign: 'right' }}>
                             {formatNumber(categoryProducts.reduce((sum, product) => sum + product.count, 0))}
                           </TableCell>
                                      <TableCell sx={{ textAlign: 'right' }}>
             {formatPrice(categoryProducts.reduce((sum, product) => sum + parseFloat(product.products_price), 0))}
           </TableCell>
                         </TableRow>
                        
                                                 {/* Products in this category */}
                         {categoryProducts.map((product, productIndex) => (
                           <TableRow key={`${product.product_name}-${productIndex}`} sx={{ height: REPORT.TABLE.PRODUCTS.ROW_HEIGHT }}>
                                                         <TableCell sx={{ py: UI.SIZES.SPACING.XS, textAlign: 'left' }}>
                               {product.product_name}
                             </TableCell>
                                          <TableCell sx={{ py: UI.SIZES.SPACING.XS, textAlign: 'left' }}>
               {product.category_name}
             </TableCell>
             <TableCell sx={{ py: UI.SIZES.SPACING.XS, textAlign: 'right' }}>
               {formatNumber(product.count)}
             </TableCell>
             <TableCell sx={{ py: UI.SIZES.SPACING.XS, textAlign: 'right' }}>
               {formatPrice(parseFloat(product.products_price))}
             </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ));
                  })()}
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
              <Box sx={{ flex: ordersReport.debited_orders_count > 0 ? '1 1 200px' : '1 1 250px', textAlign: 'center', p: UI.SIZES.SPACING.MD, bgcolor: 'success.light', borderRadius: UI.SIZES.BORDER.RADIUS.SMALL }}>
                <Typography variant="h4" color="success.contrastText">
                  {formatPrice(parseFloat(ordersReport.income))}
                </Typography>
                <Typography variant="body2" color="success.contrastText">
                  {t('report.totalIncome')}
                </Typography>
              </Box>
              
              <Box sx={{ flex: ordersReport.debited_orders_count > 0 ? '1 1 200px' : '1 1 250px', textAlign: 'center', p: UI.SIZES.SPACING.MD, bgcolor: 'info.light', borderRadius: UI.SIZES.BORDER.RADIUS.SMALL }}>
                <Typography variant="h4" color="info.contrastText">
                  {ordersReport.orders.length + ordersReport.debited_orders.length}
                </Typography>
                <Typography variant="body2" color="info.contrastText">
                  {t('report.totalOrders')}
                </Typography>
              </Box>
              
              <Box sx={{ flex: ordersReport.debited_orders_count > 0 ? '1 1 200px' : '1 1 250px', textAlign: 'center', p: UI.SIZES.SPACING.MD, bgcolor: REPORT.SUMMARY_CARDS.COLORS.YELLOW.BACKGROUND, borderRadius: UI.SIZES.BORDER.RADIUS.SMALL }}>
                <Typography variant="h4" sx={{ color: REPORT.SUMMARY_CARDS.COLORS.YELLOW.TEXT }}>
                  {ordersReport.sold_products_count}
                </Typography>
                <Typography variant="body2" sx={{ color: REPORT.SUMMARY_CARDS.COLORS.YELLOW.TEXT }}>
                  {t('report.totalProducts')}
                </Typography>
              </Box>

              <Box sx={{ flex: ordersReport.debited_orders_count > 0 ? '1 1 200px' : '1 1 250px', textAlign: 'center', p: UI.SIZES.SPACING.MD, bgcolor: 'warning.light', borderRadius: UI.SIZES.BORDER.RADIUS.SMALL }}>
                <Typography variant="h4" color="warning.contrastText">
                  {formatPrice(parseFloat(ordersReport.income) / Math.max(1, ordersReport.orders.length + ordersReport.debited_orders.length))}
                </Typography>
                <Typography variant="body2" color="warning.contrastText">
                  {t('report.averageBill')}
                </Typography>
              </Box>

              {ordersReport.debited_orders_count > 0 && (
                <Box sx={{ flex: '1 1 200px', textAlign: 'center', p: UI.SIZES.SPACING.MD, bgcolor: 'error.light', borderRadius: UI.SIZES.BORDER.RADIUS.SMALL }}>
                  <Typography variant="h4" color="error.contrastText">
                    {ordersReport.debited_orders_count}
                  </Typography>
                  <Typography variant="body2" color="error.contrastText">
                    {t('report.totalDebitedOrders')}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Products Table */}
        {renderProductsTable(ordersReport.products)}

        {/* Products (Debit) Table */}
        {renderProductsTable(ordersReport.debited_products, t('report.debitTrueProducts'))}

        {/* Order Density Chart */}
        {renderOrderDensityChart(ordersReport.orders)}

        {/* Category Sales by Time Chart */}
        {renderCategoriesChart(ordersReport.product_categories, t('report.categorySalesByTime'))}

        {/* Payment Method and Order Type Charts */}
        <Box sx={{ display: 'flex', gap: UI.SIZES.SPACING.MD }}>
          {renderPaymentMethodChart(ordersReport.orders)}
          {renderOrderTypeChart(ordersReport.orders)}
        </Box>
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
      '& .recharts-wrapper': {
        userSelect: 'none',
        '& *': {
          outline: 'none !important',
          userSelect: 'none',
        }
      }
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
          <Card sx={{ mb: UI.SIZES.SPACING.LG }}>
            <CardContent>
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
                      <MenuItem 
                        key={shift.id} 
                        value={shift.id}
                        sx={{ 
                          borderBottom: `1px solid ${UI.COLORS.divider}`,
                          '&:last-child': { borderBottom: 'none' }
                        }}
                      >
                        {shift.start_time ? formatDateOnly(shift.start_time) : t('report.activeShift')}
                        {shift.active && (
                          <span style={{ color: UI.COLORS.success.main, fontWeight: 'bold' }}>
                            {'\u00A0'}{t('common.active')}
                          </span>
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton 
                  onClick={loadShifts}
                  disabled={shiftsLoading}
                  color="primary"
                >
                  {shiftsLoading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
                </IconButton>
              </Box>
            </CardContent>
          </Card>

          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" height="40vh">
              <CircularProgress size={60} />
            </Box>
          )}

          {!loading && selectedShiftId && renderOrdersReport()}


        </>
      )}
    </Container>
  );
};

export default ReportView; 