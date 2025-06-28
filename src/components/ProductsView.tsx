import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Link,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { logger } from '../services/logger';
import { apiService } from '../services/api';
import type { Product, Category } from '../types/api';

const ProductsView: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlineShopOnly, setShowOnlineShopOnly] = useState(false);
  
  // Image selection states
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [imageSelectDialogOpen, setImageSelectDialogOpen] = useState(false);
  const [selectingForField, setSelectingForField] = useState<'add' | 'edit'>('add');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategoryId, setNewProductCategoryId] = useState('');
  const [newProductOnlineShop, setNewProductOnlineShop] = useState(false);
  const [newProductImageUrl, setNewProductImageUrl] = useState('');

  const [editProductName, setEditProductName] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductCategoryId, setEditProductCategoryId] = useState('');
  const [editProductOnlineShop, setEditProductOnlineShop] = useState(false);
  const [editProductImageUrl, setEditProductImageUrl] = useState('');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [showOnlineShopOnly]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = showOnlineShopOnly ? 
        await apiService.getOnlineShopProducts() : 
        await apiService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to load products', err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (err) {
      logger.error('API_ERROR', 'Failed to load categories', err instanceof Error ? err : new Error('Unknown error'));
    }
  };

  const loadAvailableImages = async () => {
    try {
      const data = await apiService.getFiles();
      const urlsArray = (data && 'urls' in data && Array.isArray(data.urls)) ? data.urls : [];
      setAvailableImages(urlsArray);
    } catch (err) {
      logger.error('API_ERROR', 'Failed to load images', err instanceof Error ? err : new Error('Unknown error'));
    }
  };

  const openImageSelector = (forField: 'add' | 'edit') => {
    setSelectingForField(forField);
    loadAvailableImages();
    setImageSelectDialogOpen(true);
  };

  const selectImage = (imageUrl: string) => {
    if (selectingForField === 'add') {
      setNewProductImageUrl(imageUrl);
    } else {
      setEditProductImageUrl(imageUrl);
    }
    setImageSelectDialogOpen(false);
  };

  const handleAddProduct = async () => {
    if (!newProductName.trim() || !newProductPrice.trim() || !newProductCategoryId) return;
    
    try {
      await apiService.createProduct({
        name: newProductName.trim(),
        price: parseFloat(newProductPrice),
        category_id: newProductCategoryId,
        online_shop: newProductOnlineShop,
        image_url: newProductImageUrl.trim() || undefined
      });
      setNewProductName('');
      setNewProductPrice('');
      setNewProductCategoryId('');
      setNewProductOnlineShop(false);
      setNewProductImageUrl('');
      setAddDialogOpen(false);
      await loadProducts();
      logger.info('Product created', 'USER_ACTION', { 
        name: newProductName, 
        price: newProductPrice, 
        category_id: newProductCategoryId,
        online_shop: newProductOnlineShop
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to create product', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleSaveProduct = async () => {
    if (!selectedProduct || !editProductName.trim() || !editProductPrice.trim() || !editProductCategoryId) return;
    
    try {
      await apiService.updateProduct(selectedProduct.id, {
        name: editProductName.trim(),
        price: parseFloat(editProductPrice),
        category_id: editProductCategoryId,
        online_shop: editProductOnlineShop,
        image_url: editProductImageUrl.trim() || undefined
      });
      setEditDialogOpen(false);
      setSelectedProduct(null);
      setEditProductName('');
      setEditProductPrice('');
      setEditProductCategoryId('');
      setEditProductOnlineShop(false);
      setEditProductImageUrl('');
      await loadProducts();
      logger.info('Product updated', 'USER_ACTION', { 
        id: selectedProduct.id, 
        name: editProductName, 
        price: editProductPrice,
        category_id: editProductCategoryId,
        online_shop: editProductOnlineShop
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to update product', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await apiService.deleteProduct(selectedProduct.id);
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      await loadProducts();
      logger.info('Product deleted', 'USER_ACTION', { 
        id: selectedProduct.id, 
        name: selectedProduct.name 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('API_ERROR', 'Failed to delete product', err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditProductName(product.name || '');
    setEditProductPrice(product.price || '');
    setEditProductCategoryId(product.category?.id || '');
    setEditProductOnlineShop(product.online_shop || false);
    setEditProductImageUrl(product.image_url || '');
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
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
        {t('products.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
        <ToggleButtonGroup
          value={showOnlineShopOnly ? 'online' : 'all'}
          exclusive
          onChange={(_, value) => {
            if (value !== null) {
              setShowOnlineShopOnly(value === 'online');
            }
          }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.5,
              fontSize: '0.875rem',
              textTransform: 'none'
            }
          }}
        >
          <ToggleButton value="all">
            {t('products.allProducts')}
          </ToggleButton>
          <ToggleButton value="online">
            {t('products.onlineShopProducts')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Card>
        <CardContent>
          {products.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {t('products.noProducts')}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('products.name')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('products.price')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('products.category')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: 120 }}>{t('products.imageUrl')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('products.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} sx={{ height: 48 }}>
                      <TableCell sx={{ py: 1 }}>{product.name || 'No name'}</TableCell>
                      <TableCell sx={{ py: 1 }}>{product.price || '0'}</TableCell>
                      <TableCell sx={{ py: 1 }}>{product.category?.name || 'No category'}</TableCell>
                      <TableCell sx={{ py: 1, width: 120 }}>
                        {product.image_url ? (
                          <Tooltip
                            title={
                              <img 
                                src={product.image_url} 
                                alt="Product preview"
                                style={{ 
                                  maxWidth: '200px', 
                                  maxHeight: '200px', 
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  border: '2px solid #ddd'
                                }}
                              />
                            }
                            placement="right"
                            componentsProps={{
                              tooltip: {
                                sx: {
                                  backgroundColor: 'transparent',
                                  boxShadow: 'none',
                                  border: 'none',
                                  padding: 0,
                                  margin: 0
                                }
                              }
                            }}
                          >
                            <Link 
                              href={product.image_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ cursor: 'pointer' }}
                            >
                              Image
                            </Link>
                          </Tooltip>
                        ) : (
                          'No image'
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1 }}>
                        <IconButton onClick={() => openEditDialog(product)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => openDeleteDialog(product)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Product FAB */}
      <Fab
        color="primary"
        aria-label="add product"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Add Product Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('products.addProduct')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('products.name')}
            fullWidth
            variant="outlined"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('products.price')}
            type="number"
            fullWidth
            variant="outlined"
            value={newProductPrice}
            onChange={(e) => setNewProductPrice(e.target.value.replace(',', '.'))}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>{t('products.category')}</InputLabel>
            <Select
              value={newProductCategoryId}
              onChange={(e) => setNewProductCategoryId(e.target.value)}
              label={t('products.category')}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => openImageSelector('add')}
              sx={{ mb: 1, mr: 1 }}
            >
              {t('products.selectImage')}
            </Button>
            {newProductImageUrl && (
              <Button
                variant="text" 
                size="small"
                onClick={() => setNewProductImageUrl('')}
                color="error"
              >
                {t('products.clearImage')}
              </Button>
            )}
            {newProductImageUrl && (
              <Box sx={{ mt: 1 }}>
                <img 
                  src={newProductImageUrl} 
                  alt="Selected" 
                  style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                />
              </Box>
            )}
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={newProductOnlineShop}
                onChange={(e) => setNewProductOnlineShop(e.target.checked)}
              />
            }
            label={t('products.availableInOnlineShop')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleAddProduct} variant="contained" color="success">
            {t('categories.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('products.editProduct')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('products.name')}
            fullWidth
            variant="outlined"
            value={editProductName}
            onChange={(e) => setEditProductName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('products.price')}
            type="number"
            fullWidth
            variant="outlined"
            value={editProductPrice}
            onChange={(e) => setEditProductPrice(e.target.value.replace(',', '.'))}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>{t('products.category')}</InputLabel>
            <Select
              value={editProductCategoryId}
              onChange={(e) => setEditProductCategoryId(e.target.value)}
              label={t('products.category')}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => openImageSelector('edit')}
              sx={{ mb: 1, mr: 1 }}
            >
              {t('products.selectImage')}
            </Button>
            {editProductImageUrl && (
              <Button
                variant="text" 
                size="small"
                onClick={() => setEditProductImageUrl('')}
                color="error"
              >
                {t('products.clearImage')}
              </Button>
            )}
            {editProductImageUrl && (
              <Box sx={{ mt: 1 }}>
                <img 
                  src={editProductImageUrl} 
                  alt="Selected" 
                  style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                />
              </Box>
            )}
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={editProductOnlineShop}
                onChange={(e) => setEditProductOnlineShop(e.target.checked)}
              />
            }
            label={t('products.availableInOnlineShop')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleSaveProduct} variant="contained" color="success">
            {t('categories.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('products.deleteProduct')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('products.confirmDelete')}
          </Typography>
          {selectedProduct && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {selectedProduct.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
          <Button onClick={handleDeleteProduct} color="error" variant="contained">
            {t('categories.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Selection Dialog */}
      <Dialog 
        open={imageSelectDialogOpen} 
        onClose={() => setImageSelectDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>{t('products.selectImage')}</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 2,
              mt: 2
            }}
          >
            {availableImages.map((imageUrl, index) => (
              <Box
                key={index}
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: 'primary.main'
                  }
                }}
                onClick={() => selectImage(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </Box>
            ))}
          </Box>
          {availableImages.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                {t('products.noImagesAvailable')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageSelectDialogOpen(false)}>
            {t('categories.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductsView; 