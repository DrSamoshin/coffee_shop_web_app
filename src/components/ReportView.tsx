import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import { logger } from '../services/logger';
import type { ActiveShiftReport } from '../types/api';
import colors from '../config/colors.json';

const ReportView: React.FC = () => {
  const { t } = useTranslation();
  const [report, setReport] = useState<ActiveShiftReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('ReportView', 'Загрузка отчета активной смены');
      
      const data = await apiService.getActiveShiftReport();
      setReport(data);
      
      logger.info('ReportView', 'Отчет активной смены загружен');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('report.error');
      setError(errorMessage);
      logger.error('ReportView', 'Ошибка загрузки отчета активной смены', err instanceof Error ? err : undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px',
        color: colors.text.primary 
      }}>
        {t('report.loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        color: colors.error.main,
        textAlign: 'center' 
      }}>
        <h3>{t('report.error')}</h3>
        <p>{error}</p>
        <button 
          onClick={handleRefresh}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: colors.error.main,
            color: 'white',
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
        color: colors.text.secondary 
      }}>
        {t('report.noData')}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: colors.background.default }}>
      {/* Заголовок с кнопкой обновления */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <h2 style={{ 
          margin: 0, 
          color: colors.text.primary,
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          {t('report.title')}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: colors.primary.main,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? t('report.refreshing') : t('report.refresh')}
        </button>
      </div>

      {/* Основные метрики */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: colors.background.paper,
          borderRadius: '8px',
          border: `1px solid ${colors.divider}`,
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            color: colors.text.secondary,
            fontSize: '14px',
            fontWeight: 'normal',
            textTransform: 'uppercase'
          }}>
            {t('report.shiftIncome')}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: colors.success.main 
          }}>
            {formatNumber(report.shift_income)}
          </p>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: colors.background.paper,
          borderRadius: '8px',
          border: `1px solid ${colors.divider}`,
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            color: colors.text.secondary,
            fontSize: '14px',
            fontWeight: 'normal',
            textTransform: 'uppercase'
          }}>
            {t('report.totalOrders')}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: colors.text.primary 
          }}>
            {formatNumber(report.order_amount)}
          </p>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: colors.background.paper,
          borderRadius: '8px',
          border: `1px solid ${colors.divider}`,
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            color: colors.text.secondary,
            fontSize: '14px',
            fontWeight: 'normal',
            textTransform: 'uppercase'
          }}>
            {t('report.totalProducts')}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: colors.text.primary 
          }}>
            {formatNumber(report.total_product_amount)}
          </p>
        </div>
      </div>

      {/* Детальная информация по продуктам */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {/* Количество продуктов */}
        <div style={{
          padding: '20px',
          backgroundColor: colors.background.paper,
          borderRadius: '8px',
          border: `1px solid ${colors.divider}`
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: colors.text.primary,
            fontSize: '18px',
            fontWeight: 'bold'
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
                  padding: '12px 0',
                  borderBottom: `1px solid ${colors.divider}`
                }}
              >
                <span style={{ color: colors.text.primary, fontWeight: '500' }}>
                  {product}
                </span>
                <span style={{ 
                  color: colors.text.secondary,
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {formatNumber(amount)} {t('report.pieces')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Продажи по продуктам */}
        <div style={{
          padding: '20px',
          backgroundColor: colors.background.paper,
          borderRadius: '8px',
          border: `1px solid ${colors.divider}`
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: colors.text.primary,
            fontSize: '18px',
            fontWeight: 'bold'
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
                  padding: '12px 0',
                  borderBottom: `1px solid ${colors.divider}`
                }}
              >
                <span style={{ color: colors.text.primary, fontWeight: '500' }}>
                  {product}
                </span>
                <span style={{ 
                  color: colors.success.main,
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {formatNumber(price)}
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