import React from 'react';
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material';

interface FilterToggleProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  size?: 'small' | 'medium' | 'large';
}

export const FilterToggle: React.FC<FilterToggleProps> = ({
  value,
  onChange,
  options,
  size = 'small'
}) => {
  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, newValue) => {
          if (newValue !== null) {
            onChange(newValue);
          }
        }}
        size={size}
        sx={{
          '& .MuiToggleButton-root': {
            px: 2,
            py: 0.5,
            fontSize: '0.875rem',
            textTransform: 'none',
            '&.Mui-focusVisible, &:focus, &:active, &:hover': {
              outline: 'none',
              boxShadow: 'none',
              borderColor: 'transparent',
            },
          },
        }}
      >
        {options.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}; 