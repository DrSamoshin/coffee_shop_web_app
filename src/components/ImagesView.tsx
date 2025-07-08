import React from 'react';
import { useTranslation } from 'react-i18next';

const ImagesView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '60vh',
      fontSize: '1.5rem',
      color: '#888'
    }}>
      {t('images.inDevelopment')}
    </div>
  );
};

export default ImagesView; 