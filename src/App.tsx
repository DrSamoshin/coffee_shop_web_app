import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { apiService } from './services/api';
import { getAppBackground, UI } from './config/constants';
import './i18n';

// Создаем тему для приложения
const theme = createTheme({
  palette: {
    primary: {
      main: UI.COLORS.primary.main,
      light: UI.COLORS.primary.light,
      dark: UI.COLORS.primary.dark,
    },
    secondary: {
      main: UI.COLORS.secondary.main,
      light: UI.COLORS.secondary.light,
      dark: UI.COLORS.secondary.dark,
    },
    background: {
      default: UI.COLORS.background.default,
      paper: UI.COLORS.background.paper,
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
          backgroundColor: UI.COLORS.background.card,
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
            <            Box sx={{ 
              fontSize: '48px',
              marginBottom: '16px',
              color: UI.COLORS.primary.main,
              fontWeight: 'bold'
            }}>
              Coffee
            </Box>
            <Box sx={{ 
              fontSize: '18px',
              color: UI.COLORS.primary.main,
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
