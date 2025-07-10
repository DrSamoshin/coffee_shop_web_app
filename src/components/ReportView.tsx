import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import { logger } from '../services/logger';
import type { ActiveShiftReport } from '../types/api';
import { UI } from '../config/constants';
import { Typography, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const ReportView: React.FC = () => {
  const { t } = useTranslation();
  const [report, setReport] = useState<ActiveShiftReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('ReportView', 'Loading active shift report');
      
      const data = await apiService.getActiveShiftReport();
      setReport(data);
      
      logger.info('ReportView', 'Active shift report loaded');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('report.error');
      setError(errorMessage);
      logger.error('ReportView', 'Error loading active shift report', err instanceof Error ? err : undefined);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleRefresh = () => {
    fetchReport();
  };

  const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      useGrouping: true,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPrice = (amount: number): string => {
    if (isNaN(amount)) return '0,00';
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount).replace('.', ',');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px',
        color: UI.COLORS.text.primary 
      }}>
        {t('report.loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        color: UI.COLORS.error.main,
        textAlign: 'center' 
      }}>
        <h3>{t('report.error')}</h3>
        <p>{error}</p>
        <button 
          onClick={handleRefresh}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: UI.COLORS.error.main,
            color: UI.COLORS.background.paper,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {t('report.retry')}
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: UI.COLORS.text.secondary 
      }}>
        {t('report.noData')}
      </div>
    );
  }

  return (
    <div style={{ 
      padding: UI.SIZES.SPACING.LG, 
      backgroundColor: UI.COLORS.background.default,
      borderRadius: UI.SIZES.BORDER.RADIUS.LARGE,
      minHeight: '80vh',
      width: '100%',
    }}>
      {/* Header with refresh button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: UI.SIZES.SPACING.LG 
      }}>
        <Typography variant="h4" gutterBottom sx={{ color: UI.COLORS.text.primary, fontWeight: UI.SIZES.FONT.WEIGHTS.BOLD, fontFamily: 'Helvetica, Arial, sans-serif', m: 0 }}>
          {t('report.title')}
        </Typography>
        <Tooltip title={t('report.refresh')}>
          <span>
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                border: `1.5px solid ${UI.COLORS.primary.main}`,
                borderRadius: '50%',
                backgroundColor: UI.COLORS.background.paper,
                color: UI.COLORS.primary.main,
                width: 40,
                height: 40,
                transition: 'all 0.2s',
                '&:focus, &:active, &:hover': {
                  outline: 'none',
                  boxShadow: 'none',
                  borderColor: 'transparent',
                  backgroundColor: UI.COLORS.action.hover,
                },
                opacity: loading ? 0.6 : 1,
              }}
            >
              <RefreshIcon fontSize="medium" />
            </IconButton>
          </span>
        </Tooltip>
      </div>
      {/* Main metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: UI.SIZES.SPACING.MD, 
        marginBottom: UI.SIZES.SPACING.XL 
      }}>
        <div style={{
          padding: UI.SIZES.SPACING.LG,
          backgroundColor: UI.COLORS.background.paper,
          borderRadius: UI.SIZES.BORDER.RADIUS.MEDIUM,
          border: `1px solid ${UI.COLORS.divider}`,
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: `0 0 ${UI.SIZES.SPACING.SM} 0`, 
            color: UI.COLORS.text.secondary,
            fontSize: UI.SIZES.FONT.MEDIUM,
            fontWeight: UI.SIZES.FONT.WEIGHTS.NORMAL,
            textTransform: 'uppercase'
          }}>
            {t('report.shiftIncome')}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: UI.SIZES.FONT.LARGE,
            fontWeight: UI.SIZES.FONT.WEIGHTS.BOLD, 
            color: UI.COLORS.success.main 
          }}>
            {formatPrice(report.shift_income)}
          </p>
        </div>
        <div style={{
          padding: UI.SIZES.SPACING.LG,
          backgroundColor: UI.COLORS.background.paper,
          borderRadius: UI.SIZES.BORDER.RADIUS.MEDIUM,
          border: `1px solid ${UI.COLORS.divider}`,
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: `0 0 ${UI.SIZES.SPACING.SM} 0`, 
            color: UI.COLORS.text.secondary,
            fontSize: UI.SIZES.FONT.MEDIUM,
            fontWeight: UI.SIZES.FONT.WEIGHTS.NORMAL,
            textTransform: 'uppercase'
          }}>
            {t('report.totalOrders')}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: UI.SIZES.FONT.LARGE,
            fontWeight: UI.SIZES.FONT.WEIGHTS.BOLD, 
            color: UI.COLORS.text.primary 
          }}>
            {formatNumber(report.order_amount)}
          </p>
        </div>
        <div style={{
          padding: UI.SIZES.SPACING.LG,
          backgroundColor: UI.COLORS.background.paper,
          borderRadius: UI.SIZES.BORDER.RADIUS.MEDIUM,
          border: `1px solid ${UI.COLORS.divider}`,
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: `0 0 ${UI.SIZES.SPACING.SM} 0`, 
            color: UI.COLORS.text.secondary,
            fontSize: UI.SIZES.FONT.MEDIUM,
            fontWeight: UI.SIZES.FONT.WEIGHTS.NORMAL,
            textTransform: 'uppercase'
          }}>
            {t('report.totalProducts')}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: UI.SIZES.FONT.LARGE,
            fontWeight: UI.SIZES.FONT.WEIGHTS.BOLD, 
            color: UI.COLORS.text.primary 
          }}>
            {formatNumber(report.total_product_amount)}
          </p>
        </div>
      </div>
      {/* Product details */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: UI.SIZES.SPACING.XL 
      }}>
        {/* Product count */}
        <div style={{
          padding: UI.SIZES.SPACING.LG,
          backgroundColor: UI.COLORS.background.paper,
          borderRadius: UI.SIZES.BORDER.RADIUS.MEDIUM,
          border: `1px solid ${UI.COLORS.divider}`
        }}>
          <h3 style={{ 
            margin: `0 0 ${UI.SIZES.SPACING.MD} 0`, 
            color: UI.COLORS.text.primary,
            fontSize: UI.SIZES.FONT.XLARGE,
            fontWeight: UI.SIZES.FONT.WEIGHTS.BOLD
          }}>
            {t('report.productSales')}
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {Object.entries(report.products_amount).map(([product, amount]) => (
              <div 
                key={product}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: `${UI.SIZES.SPACING.SM} 0`,
                  borderBottom: `1px solid ${UI.COLORS.divider}`
                }}
              >
                <span style={{ color: UI.COLORS.text.primary, fontWeight: UI.SIZES.FONT.WEIGHTS.MEDIUM }}>
                  {product}
                </span>
                <span style={{ 
                  color: UI.COLORS.text.secondary,
                  fontSize: UI.SIZES.FONT.LARGE,
                  fontWeight: UI.SIZES.FONT.WEIGHTS.BOLD
                }}>
                  {formatNumber(amount)} {t('report.pieces')}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Product sales */}
        <div style={{
          padding: UI.SIZES.SPACING.LG,
          backgroundColor: UI.COLORS.background.paper,
          borderRadius: UI.SIZES.BORDER.RADIUS.MEDIUM,
          border: `1px solid ${UI.COLORS.divider}`
        }}>
          <h3 style={{ 
            margin: `0 0 ${UI.SIZES.SPACING.MD} 0`, 
            color: UI.COLORS.text.primary,
            fontSize: UI.SIZES.FONT.XLARGE,
            fontWeight: UI.SIZES.FONT.WEIGHTS.BOLD
          }}>
            {t('report.productRevenue')}
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {Object.entries(report.product_price).map(([product, price]) => (
              <div 
                key={product}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: `${UI.SIZES.SPACING.SM} 0`,
                  borderBottom: `1px solid ${UI.COLORS.divider}`
                }}
              >
                <span style={{ color: UI.COLORS.text.primary, fontWeight: UI.SIZES.FONT.WEIGHTS.MEDIUM }}>
                  {product}
                </span>
                <span style={{ 
                  color: UI.COLORS.success.main,
                  fontSize: UI.SIZES.FONT.LARGE,
                  fontWeight: UI.SIZES.FONT.WEIGHTS.BOLD
                }}>
                  {formatPrice(price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView; 