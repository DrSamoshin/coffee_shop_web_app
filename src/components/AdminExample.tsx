import React from 'react';
import { Button, Box, Alert } from '@mui/material';
import { useAdminMode, useAdminOnly } from '../hooks/useAdminMode';

/**
 * Example component showing how to use admin mode
 */
const AdminExample: React.FC = () => {
  const isAdmin = useAdminMode();
  
  // Method 1: Conditional rendering with hook
  const adminButton = useAdminOnly(
    <Button variant="contained" color="error">
      Admin Only Button
    </Button>
  );
  
  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        Admin Mode: {isAdmin ? 'Enabled' : 'Disabled'}
      </Alert>
      
      {/* Method 1: Using useAdminOnly hook */}
      {adminButton}
      
      {/* Method 2: Direct conditional rendering */}
      {isAdmin && (
        <Button variant="outlined" color="warning" sx={{ ml: 1 }}>
          Another Admin Button
        </Button>
      )}
      
      {/* Regular button always visible */}
      <Button variant="text" sx={{ ml: 1 }}>
        Regular Button
      </Button>
    </Box>
  );
};

export default AdminExample; 