import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton
} from '@mui/material';
import {
  ExitToApp,
  AttachMoney,
  TrendingUp,
  ShoppingCart,
  People,
  Settings
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import { logger } from '../services/logger';
import { OrderStatus } from '../types/api';
import { getAppBackground, UI } from '../config/constants';
import CategoriesView from './CategoriesView';
import EmployeesView from './EmployeesView';
import ProductsView from './ProductsView';
import ImagesView from './ImagesView';
import SuppliersView from './SuppliersView';
import SuppliesView from './SuppliesView';
import ReportingPeriodsView from './ReportingPeriodsView';

const drawerWidth = 240;

interface DashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeShifts: number;
  pendingOrders: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { t, i18n } = useTranslation();
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeShifts: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const menuItems = [
    { id: 'dashboard', label: t('navigation.dashboard') },
    { id: 'analytics', label: t('navigation.analytics') },
    { id: 'categories', label: t('navigation.categories') },
    { id: 'products', label: t('navigation.products') },
    { id: 'images', label: t('navigation.images') },
    { id: 'employees', label: t('navigation.employees') },
    { id: 'suppliers', label: t('navigation.suppliers') },
    { id: 'supplies', label: t('navigation.supplies') },
    { id: 'reportingPeriods', label: t('navigation.reportingPeriods') },
  ];

  useEffect(() => {
    logger.componentState('Dashboard', 'mounted');
    logger.navigation('Login', 'Dashboard');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      logger.debug('Dashboard', 'Loading dashboard data started');

      const [orders, shifts] = await Promise.all([
        apiService.getOrders().catch(() => []),
        apiService.getActiveShifts().catch(() => [])
      ]);

      const completedOrders = orders.filter(order => order.status === OrderStatus.COMPLETED);
      const pendingOrders = orders.filter(order => order.status === OrderStatus.WAITING);
      const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.price || '0'), 0);

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        activeShifts: shifts.length,
        pendingOrders: pendingOrders.length
      });
      
      logger.info('Dashboard', 'Dashboard data loaded successfully', {
        ordersCount: orders.length,
        shiftsCount: shifts.length,
        totalRevenue,
        pendingOrders: pendingOrders.length
      });

    } catch (err) {
      logger.error('Dashboard', 'Failed to load dashboard data', err instanceof Error ? err : undefined);
      console.error('Error loading dashboard data:', err);
      setError(t('dashboard.loadingError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    logger.userAction('language_change', 'Settings', { language });
  };

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
    logger.userAction('open_settings', 'Dashboard');
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={activeView === item.id}
              onClick={() => {
                logger.userAction('navigate', 'Dashboard', { from: activeView, to: item.id });
                setActiveView(item.id);
                setMobileOpen(false);
              }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: UI.COLORS.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: UI.COLORS.primary.dark,
                  },
                },
              }}
            >
              <ListItemText 
                primary={item.label}
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: '1rem',
                    fontWeight: activeView === item.id ? 'bold' : 'normal'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleSettingsOpen}
            sx={{ 
              color: UI.COLORS.primary.main,
              '&:hover': {
                backgroundColor: UI.COLORS.action.hover,
              }
            }}
          >
            <ListItemText primary={t('navigation.settings')} />
            <Settings />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
              {t('dashboard.title')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
              {t('dashboard.welcome')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Stats Cards */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
                gap: 3 
              }}>
                <Card elevation={3} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom>
                          {t('dashboard.totalRevenue')}
                        </Typography>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(stats.totalRevenue)}
                        </Typography>
                      </Box>
                      <AttachMoney sx={{ fontSize: 40, color: UI.COLORS.success.main }} />
                    </Box>
                  </CardContent>
                </Card>

                <Card elevation={3} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom>
                          {t('dashboard.totalOrders')}
                        </Typography>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                          {stats.totalOrders}
                        </Typography>
                      </Box>
                      <ShoppingCart sx={{ fontSize: 40, color: UI.COLORS.info.main }} />
                    </Box>
                  </CardContent>
                </Card>

                <Card elevation={3} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom>
                          {t('dashboard.activeShifts')}
                        </Typography>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                          {stats.activeShifts}
                        </Typography>
                      </Box>
                      <People sx={{ fontSize: 40, color: UI.COLORS.warning.main }} />
                    </Box>
                  </CardContent>
                </Card>

                <Card elevation={3} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom>
                          {t('dashboard.pendingOrders')}
                        </Typography>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                          {stats.pendingOrders}
                        </Typography>
                      </Box>
                      <TrendingUp sx={{ fontSize: 40, color: UI.COLORS.error.main }} />
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Quick Actions */}
              <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {t('dashboard.quickActions')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    <Chip
                      label={t('dashboard.newOrder')}
                      onClick={() => setActiveView('orders')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label={t('dashboard.manageProducts')}
                      onClick={() => setActiveView('products')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label={t('dashboard.viewAnalytics')}
                      onClick={() => setActiveView('analytics')}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );

      case 'categories':
        return <CategoriesView />;

      case 'products':
        return <ProductsView />;

      case 'images':
        return <ImagesView />;

      case 'employees':
        return <EmployeesView />;

      case 'suppliers':
        return <SuppliersView />;

      case 'supplies':
        return <SuppliesView />;

      case 'reportingPeriods':
        return <ReportingPeriodsView />;

      default:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              {menuItems.find(item => item.id === activeView)?.label}
            </Typography>
            <Typography color="text.secondary">
              {t('common.inDevelopment')}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile Header Bar */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: UI.COLORS.background.paper,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${UI.COLORS.divider}`,
        display: { xs: 'flex', sm: 'none' },
        alignItems: 'center',
        justifyContent: 'flex-start',
        px: 2,
        zIndex: 1300
      }}>
        {/* Mobile Menu Button */}
        <Box sx={{
          background: UI.COLORS.action.hover,
          borderRadius: 1,
          padding: 0.5
        }}>
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{ 
              color: 'text.primary',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'transparent',
              },
              '&:focus': {
                outline: 'none',
                backgroundColor: 'transparent',
                boxShadow: 'none',
              },
              '&:focus-visible': {
                outline: 'none',
                boxShadow: 'none',
              }
            }}
            size="small"
            disableRipple
            disableFocusRipple
            disableTouchRipple
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
              {t('navigation.menu')}
            </Typography>
          </IconButton>
        </Box>
      </Box>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              top: 60,
              height: 'calc(100% - 60px)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: getAppBackground(),
          pt: { xs: '60px', sm: 0 }, // Add top padding on mobile for header
        }}
      >
        {renderContent()}
      </Box>

      {/* Settings Dialog */}
      <Dialog 
        open={settingsOpen} 
        onClose={handleSettingsClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('settings.title')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>{t('settings.language')}</InputLabel>
              <Select
                value={i18n.language}
                label={t('settings.language')}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ru">Русский</MenuItem>
              </Select>
            </FormControl>
            
            <Divider sx={{ my: 2 }} />
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ExitToApp />}
              onClick={() => {
                handleSettingsClose();
                onLogout();
              }}
              sx={{ 
                                  color: UI.COLORS.primary.main,
                  borderColor: UI.COLORS.primary.main,
                  '&:hover': {
                    backgroundColor: UI.COLORS.action.hover,
                    borderColor: UI.COLORS.primary.main,
                }
              }}
            >
              {t('settings.logout')}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettingsClose}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 