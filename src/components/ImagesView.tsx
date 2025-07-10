import React from 'react';
import { Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageContainer } from './shared';

const ImagesView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <PageContainer title={t('images.title')}>
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="60vh"
      >
        <Typography variant="h5" color="text.secondary">
          {t('images.inDevelopment')}
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default ImagesView; 