import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import { logger } from '../services/logger';
import LanguageSwitcher from './LanguageSwitcher';

interface LoginProps {
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logger.info('Login', 'Form submitted', { tokenLength: token.trim().length });
    
    if (!token.trim()) {
      setError(t('auth.enterToken'));
      logger.warn('Login', 'Empty token provided');
      return;
    }

    setLoading(true);
    setError('');

    logger.userAction('login_attempt', 'Login', { tokenLength: token.trim().length });

    try {
      // Сохраняем токен
      apiService.setToken(token.trim());
      
      // Проверяем валидность токена
      const result = await apiService.checkToken();
      
      if (result.isValid) {
        logger.userAction('login_success', 'Login');
        onSuccess();
      } else {
        logger.warn('Login', 'Invalid token provided', { error: result.error });
        
        // Показываем конкретную ошибку от API
        if (result.error === 'Not enough segments') {
          setError('Invalid token format. Please check that you entered a valid JWT token.');
        } else if (result.error === 'Not authenticated') {
          setError('Authentication required. Please provide a valid token.');
        } else {
          setError(t('auth.invalidToken') + (result.error ? ` (${result.error})` : ''));
        }
        
        apiService.clearToken();
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Login', 'Login failed', error);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('auth.loginError');
      
      setError(errorMessage);
      apiService.clearToken();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Language Switcher - Fixed to top right corner */}
      <Box sx={{ 
        position: 'fixed', 
        top: 20, 
        right: 20, 
        zIndex: 1000,
        background: 'rgba(0,0,0,0.1)',
        borderRadius: 1,
        padding: 0.5
      }}>
        <LanguageSwitcher />
      </Box>

      <Box 
        sx={{ 
          width: '100vw',
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: { xs: 1, sm: 2 }
        }}
      >
                <Box sx={{ width: '100%', maxWidth: 400, px: 2 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('auth.token')}
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={t('auth.tokenPlaceholder')}
              disabled={loading}
              sx={{ 
                mb: 2,
                '& .MuiInputLabel-root': {
                  color: 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: 'rgba(0, 0, 0, 0.6)',
                  },
                  '&.MuiInputLabel-shrink': {
                    color: 'rgba(0, 0, 0, 0.6)',
                  }
                },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'transparent',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    }
                  },
                  '&.MuiInputBase-formControl': {
                    backgroundColor: 'transparent',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  }
                },
                '& .MuiInputBase-input': {
                  '&:focus': {
                    outline: 'none',
                    boxShadow: 'none',
                  }
                }
              }}
                              InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowToken(!showToken)}
                        edge="end"
                        sx={{
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
                        disableRipple
                        disableFocusRipple
                        disableTouchRipple
                      >
                        {showToken ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
            />

            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !token.trim()}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #6f4e37 30%, #8b6f47 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a3d2a 30%, #6f5535 90%)',
                },
                '&:disabled': {
                  background: '#ccc',
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  {t('auth.checkingToken')}
                </Box>
                              ) : (
                  t('auth.loginButton')
                )}
            </Button>
          </form>
        </Box>
      </Box>
    </>
  );
};

export default Login; 