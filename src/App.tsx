import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { apiService } from './services/api';
import { logger } from './services/logger';
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
    fontFamily: 'Helvetica, Arial, sans-serif',
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
          '&:focus, &:active, &.Mui-focusVisible': {
            outline: 'none',
            boxShadow: 'none',
            borderColor: 'transparent',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus, &:active, &.Mui-focusVisible': {
            outline: 'none',
            boxShadow: 'none',
            borderColor: 'transparent',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          '&:focus, &:active, &.Mui-focusVisible': {
            outline: 'none',
            boxShadow: 'none',
            borderColor: 'transparent',
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          '&:focus, &:active, &.Mui-focusVisible': {
            outline: 'none',
            boxShadow: 'none',
            borderColor: 'transparent',
          },
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
      logger.error('App', 'Error checking authentication', error instanceof Error ? error : new Error(String(error)));
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
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
          <Box
            sx={{
              fontSize: UI.SIZES.FONT.XLARGE,
              color: UI.COLORS.text.primary,
              fontWeight: 300,
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
          >
            Loading
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
          <Dashboard />
        ) : (
          <Login onSuccess={handleLoginSuccess} />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
