import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Input,
  IconButton
} from '@mui/material';
import { Add as AddIcon, CloudUpload as UploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { logger } from '../services/logger';
import { apiService } from '../services/api';
import { UI } from '../config/constants';



const ImagesView: React.FC = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getFiles();
      const urlsArray = (data && 'urls' in data && Array.isArray(data.urls)) ? data.urls : [];
      setFiles(urlsArray);
      logger.info('Files loaded successfully', 'COMPONENT_STATE', { count: urlsArray.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to load files', err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async () => {
    if (!uploadFile) return;
    
    try {
      setUploading(true);
      await apiService.uploadFile(uploadFile);
      setUploadFile(null);
      setUploadDialogOpen(false);
      await loadFiles();
      logger.info('File uploaded', 'USER_ACTION', { name: uploadFile.name });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to upload file', err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFileUrl) return;
    
    try {
      await apiService.deleteFile(selectedFileUrl);
      setDeleteDialogOpen(false);
      setSelectedFileUrl(null);
      await loadFiles();
      logger.info('File deleted', 'USER_ACTION', { url: selectedFileUrl });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to delete file', err instanceof Error ? err : new Error(errorMessage));
    }
  };



  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('images.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {files.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {t('images.noImages')}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 2,
            mt: 2
          }}
        >
          {files.map((url, index) => (
            <Box
              key={index}
              sx={{
                border: `1px solid ${UI.COLORS.divider}`,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 1,
                position: 'relative',
                '&:hover': {
                  boxShadow: 3,
                  '& .delete-button': {
                    opacity: 1
                  }
                }
              }}
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <IconButton
                className="delete-button"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: UI.COLORS.background.paper,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '&:hover': {
                    backgroundColor: UI.COLORS.background.paper
                  }
                }}
                onClick={() => {
                  setSelectedFileUrl(url);
                  setDeleteDialogOpen(true);
                }}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {/* Upload FAB */}
      <Fab
        color="primary"
        aria-label="upload image"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setUploadDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('images.uploadImage')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Input
              type="file"
              onChange={handleFileSelect}
              inputProps={{ accept: 'image/*' }}
              sx={{ width: '100%' }}
            />
          </Box>
          {uploadFile && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t('images.selectedFile')}: {uploadFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button 
            onClick={handleUploadFile} 
            variant="contained" 
            color="success"
            disabled={!uploadFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {uploading ? t('images.uploading') : t('images.upload')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('images.deleteImage')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('images.confirmDelete')}
          </Typography>
          {selectedFileUrl && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, wordBreak: 'break-all' }}>
              {selectedFileUrl}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleDeleteFile} color="error" variant="contained">
            {t('categories.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ImagesView; 