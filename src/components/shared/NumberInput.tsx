import React from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

interface NumberInputProps extends Omit<TextFieldProps, 'type' | 'onChange' | 'value'> {
  value: string | number;
  onChange: (value: string) => void;
  maxDecimals?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  maxDecimals = 2,
  ...textFieldProps
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace('.', ',');
    // Создаем регулярное выражение динамически на основе maxDecimals
    const regex = new RegExp(`^\\d*(,?\\d{0,${maxDecimals}})?$`);
    
    if (regex.test(val) || val === '') {
      onChange(val);
    }
  };

  return (
    <TextField
      {...textFieldProps}
      type="text"
      value={value}
      onChange={handleChange}
    />
  );
}; 