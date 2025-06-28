import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { apiService } from './services/api';
import { getAppBackground } from './config/constants';
import './i18n';

// Создаем тему для приложения
const theme = createTheme({
  palette: {
    primary: {
      main: '#6f4e37', // Кофейный цвет
      light: '#8b6f47',
      dark: '#5a3d2a',
    },
    secondary: {
      main: '#ff6f00',
      light: '#ff8f00',
      dark: '#e65100',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = apiService.getToken();
      if (token) {
        const result = await apiService.checkToken();
        setIsAuthenticated(result.isValid);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    apiService.clearToken();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: getAppBackground(),
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ 
              fontSize: '48px',
              marginBottom: '16px',
              color: '#6f4e37',
              fontWeight: 'bold'
            }}>
              Coffee
            </Box>
            <Box sx={{ 
              fontSize: '18px',
              color: '#6f4e37',
              fontWeight: 'bold'
            }}>
              Загрузка приложения...
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: getAppBackground(),
          position: 'relative',
        }}
      >
        {isAuthenticated ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          <Login onSuccess={handleLoginSuccess} />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
