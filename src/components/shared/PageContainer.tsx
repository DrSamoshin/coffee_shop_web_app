import React from 'react';
import { Container, Typography, Alert, CircularProgress, Box } from '@mui/material';

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
  error?: string | null;
  loading?: boolean;
  onErrorClose?: () => void;
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  children,
  error,
  loading = false,
  onErrorClose,
  maxWidth = false
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth={maxWidth} sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={onErrorClose ? () => onErrorClose() : undefined}
        >
          {error}
        </Alert>
      )}

      {children}
    </Container>
  );
}; 