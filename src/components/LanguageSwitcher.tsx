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
    { code: 'ru', name: 'Русский', short: 'RU' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <>
      <IconButton 
        onClick={handleClick}
        sx={{ 
          color: 'text.primary',
          borderRadius: UI.SIZES.BORDER.RADIUS.SMALL,
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
        size="small"
        disableRipple
        disableFocusRipple
        disableTouchRipple
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: UI.SIZES.FONT.MEDIUM }}>
          {currentLanguage.short}
        </Typography>
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
            <Typography variant="body2">{language.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher; 