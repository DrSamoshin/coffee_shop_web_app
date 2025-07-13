import React from 'react';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface FilterOption {
  key: string;
  color: string;
  labelKey?: string;
  label?: string;
}

interface ChartFiltersProps {
  filters: Record<string, boolean>;
  options: FilterOption[];
  onFilterChange: (key: string) => void;
  sx?: object;
}

export const ChartFilters: React.FC<ChartFiltersProps> = ({
  filters,
  options,
  onFilterChange,
  sx = {}
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', ...sx }}>
      {options.map((option) => (
        <FormControlLabel
          key={option.key}
          control={
            <Checkbox
              checked={filters[option.key] ?? false}
              onChange={() => onFilterChange(option.key)}
              sx={{ 
                color: option.color, 
                '&.Mui-checked': { color: option.color } 
              }}
            />
          }
          label={
            option.labelKey 
              ? t(option.labelKey) 
              : option.label || option.key.replace(/_/g, ' ')
          }
        />
      ))}
    </Box>
  );
}; 