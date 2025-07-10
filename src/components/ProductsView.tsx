import React, { useState, useEffect, useCallback } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Link,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { logger } from '../services/logger';
import { apiService } from '../services/api';
import { UI } from '../config/constants';
import type { Product, Category } from '../types/api';
import { FilterToggle, NumberInput } from './shared';
import { parseNumberInput } from '../utils/numberFormatting';

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

  // 1. Функция форматирования цены
  const formatPrice = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value.toString().replace(',', '.')) : value;
    if (isNaN(num)) return '0,00';
    // Форматируем с запятой как разделителем
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num).replace('.', ',');
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = showOnlineShopOnly ? 
        await apiService.getOnlineShopProducts() : 
        await apiService.getProducts();
      setProducts(data);
      setError(null);
      logger.info('ProductsView', 'Products loaded successfully', { count: data.length, onlineShopOnly: showOnlineShopOnly });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('ProductsView', 'Failed to load products', err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [showOnlineShopOnly]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
      logger.info('ProductsView', 'Categories loaded successfully', { count: data.length });
    } catch (err) {
      logger.error('ProductsView', 'Failed to load categories', err instanceof Error ? err : new Error('Unknown error'));
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

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
        price: parseNumberInput(newProductPrice),
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
        price: parseNumberInput(editProductPrice),
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
    <Container maxWidth={false} sx={{
      width: '100%',
      padding: UI.SIZES.SPACING.LG,
      backgroundColor: UI.COLORS.background.default,
      borderRadius: UI.SIZES.BORDER.RADIUS.LARGE,
      minHeight: '80vh',
    }}>
      <Typography variant="h4" gutterBottom>
        {t('products.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <FilterToggle
        value={showOnlineShopOnly ? 'online' : 'all'}
        onChange={(value) => setShowOnlineShopOnly(value === 'online')}
        options={[
          { value: 'all', label: t('products.allProducts') },
          { value: 'online', label: t('products.onlineShopProducts') }
        ]}
      />

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
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>{t('products.name')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>{t('products.category')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>{t('products.price')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'left' }}>{t('products.image')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', width: '150px', minWidth: '150px', maxWidth: '150px', whiteSpace: 'nowrap' }}>{t('products.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} sx={{ height: 48 }}>
                      <TableCell sx={{ py: 1, textAlign: 'left' }}>{product.name}</TableCell>
                      <TableCell sx={{ py: 1, textAlign: 'left' }}>{product.category?.name || '-'}</TableCell>
                      <TableCell sx={{ py: 1, textAlign: 'left' }}>{formatPrice(product.price)}</TableCell>
                      <TableCell sx={{ py: 1, textAlign: 'left' }}>
                        {product.image_url ? (
                          <Link href={product.image_url} target="_blank" rel="noopener noreferrer" sx={{ cursor: 'pointer' }}>
                            {t('products.image')}
                          </Link>
                        ) : (
                          t('products.noImage')
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1, width: '150px', minWidth: '150px', maxWidth: '150px', whiteSpace: 'nowrap' }}>
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
          <NumberInput
            margin="dense"
            label={t('products.price')}
            fullWidth
            variant="outlined"
            value={newProductPrice}
            onChange={setNewProductPrice}
            maxDecimals={2}
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
              sx={{ mb: 1, mr: 1, color: UI.COLORS.text.primary, '&:hover, &:active, &:focus': { color: UI.COLORS.text.primary } }}
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
                  style={{ 
                    maxWidth: UI.SIZES.IMAGE_PREVIEW.SMALL.width, 
                    maxHeight: UI.SIZES.IMAGE_PREVIEW.SMALL.height, 
                    objectFit: 'cover' 
                  }}
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
          <Button onClick={() => setAddDialogOpen(false)} sx={{ color: UI.COLORS.text.secondary, '&:hover, &:active, &:focus': { color: UI.COLORS.text.secondary } }}>
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
          <NumberInput
            margin="dense"
            label={t('products.price')}
            fullWidth
            variant="outlined"
            value={editProductPrice}
            onChange={setEditProductPrice}
            maxDecimals={2}
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
              sx={{ mb: 1, mr: 1, color: UI.COLORS.text.primary, '&:hover, &:active, &:focus': { color: UI.COLORS.text.primary } }}
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
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: UI.COLORS.text.secondary, '&:hover, &:active, &:focus': { color: UI.COLORS.text.secondary } }}>
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
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: UI.COLORS.text.secondary, '&:hover, &:active, &:focus': { color: UI.COLORS.text.secondary } }}>
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
          <Button onClick={() => setImageSelectDialogOpen(false)} sx={{ color: UI.COLORS.text.secondary, '&:hover, &:active, &:focus': { color: UI.COLORS.text.secondary } }}>
            {t('categories.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductsView; 