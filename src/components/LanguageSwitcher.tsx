import React from 'react';
import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UI } from '../config/constants';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    handleClose();
  };

  const languages = [
    { code: 'en', name: 'English', short: 'EN' },
    { code: 'ru', name: 'Русский', short: 'RU' },
    { code: 'es', name: 'Español', short: 'ES' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <>
      <IconButton 
        onClick={handleClick}
        sx={{ 
          color: UI.COLORS.text.primary,
          border: 'none',
          borderRadius: 0,
          backgroundColor: 'transparent',
          width: 36,
          height: 36,
          minWidth: 36,
          minHeight: 36,
          p: 0,
          fontWeight: 700,
          fontSize: UI.SIZES.FONT.MEDIUM,
          transition: 'color 0.2s',
          '&:hover': {
            backgroundColor: 'transparent',
            color: UI.COLORS.primary.dark,
          },
          '&:focus': {
            outline: 'none',
            backgroundColor: 'transparent',
            color: UI.COLORS.primary.dark,
          },
        }}
        size="small"
        disableRipple
        disableFocusRipple
        disableTouchRipple
        aria-label="Change language"
      >
        <span style={{ fontWeight: 700, fontSize: UI.SIZES.FONT.MEDIUM, color: UI.COLORS.text.primary }}>{currentLanguage.short}</span>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={language.code === i18n.language}
            sx={{ minWidth: 120 }}
          >
            <Typography variant="body2" sx={{ fontWeight: language.code === i18n.language ? 700 : 400 }}>
              {language.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher; 