import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Settings
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { logger } from '../services/logger';
import { UI } from '../config/constants';
import { getStorageKey } from '../config';
import CategoriesView from './CategoriesView';
import EmployeesView from './EmployeesView';
import ProductsView from './ProductsView';
import ImagesView from './ImagesView';
import ItemsView from './ItemsView';
import StoreView from './StoreView';
import SuppliersView from './SuppliersView';
import SuppliesView from './SuppliesView';
import ReportView from './ReportView';
// import MetricsDashboard from './MetricsDashboard'; // Удалено

const drawerWidth = 240;

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeView, setActiveView] = useState('report');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const menuItems = [
    { id: 'report', label: t('navigation.report') },
    { id: 'categories', label: t('navigation.categories') },
    { id: 'products', label: t('navigation.products') },
    { id: 'images', label: t('navigation.images') },
    { id: 'items', label: t('navigation.items') },
    { id: 'store', label: t('navigation.store') },
    { id: 'employees', label: t('navigation.employees') },
    { id: 'suppliers', label: t('navigation.suppliers') },
    { id: 'supplies', label: t('navigation.supplies') }
    // { id: 'logs', label: t('navigation.logs') }, // Удалено
  ];

  useEffect(() => {
    logger.componentState('Dashboard', 'mounted');
    logger.navigation('Login', 'Dashboard');
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSettingsOpen = () => {
    setSettingsDialogOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsDialogOpen(false);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    logger.userAction('language_change', 'Settings', { language });
  };

  const handleLogout = () => {
    localStorage.removeItem(getStorageKey('TOKEN'));
    window.location.href = '/';
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
              color: UI.COLORS.text.primary,
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
    switch (activeView) {
      case 'categories':
        return <CategoriesView />;
      case 'products':
        return <ProductsView />;
      case 'images':
        return <ImagesView />;
      case 'items':
        return <ItemsView />;
      case 'store':
        return <StoreView />;
      case 'employees':
        return <EmployeesView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'supplies':
        return <SuppliesView />;
      case 'report':
        return <ReportView />;
      // case 'logs':
      //   return (
      //     <Box sx={{ p: 3, textAlign: 'center' }}>
      //       <Typography variant="h5" gutterBottom>
      //         {t('navigation.logs')}
      //       </Typography>
      //       <Typography color="text.secondary">
      //         {t('common.inDevelopment')}
      //       </Typography>
      //     </Box>
      //   );
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
          width: '100%',
        }}
      >
        {renderContent()}
      </Box>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={handleSettingsClose}>
        <DialogTitle>{t('navigation.settings')}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('navigation.language')}</InputLabel>
            <Select
              value={i18n.language}
              label={t('navigation.language')}
              onChange={(e) => handleLanguageChange(e.target.value as string)}
            >
              <MenuItem value="en">{t('navigation.english')}</MenuItem>
              <MenuItem value="ru">{t('navigation.russian')}</MenuItem>
              <MenuItem value="es">{t('navigation.spanish', 'Español')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogout}>{t('navigation.logout')}</Button>
          <Button onClick={handleSettingsClose}>{t('common.cancel')}</Button>
          <Button onClick={handleSettingsClose} variant="contained">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;