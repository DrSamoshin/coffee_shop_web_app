import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge,
  Stack,
} from '@mui/material';
import {
  BugReport as BugReportIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { logger, LogLevel } from '../services/logger';
import type { LogEntry } from '../services/logger';

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Подписываемся на обновления логов
    const unsubscribe = logger.subscribe((newLogs) => {
      setLogs(newLogs);
      
      // Обновляем список категорий
      const uniqueCategories = Array.from(new Set(newLogs.map(log => log.category)));
      setCategories(uniqueCategories.sort());
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Фильтруем логи
    let filtered = logs;

    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.category.toLowerCase().includes(searchLower) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(searchLower))
      );
    }

    setFilteredLogs(filtered);
  }, [logs, selectedLevel, selectedCategory, searchText]);

  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG: return '#9e9e9e';
      case LogLevel.INFO: return '#2196f3';
      case LogLevel.WARN: return '#ff9800';
      case LogLevel.ERROR: return '#f44336';
      default: return '#9e9e9e';
    }
  };



  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const handleClearLogs = (): void => {
    logger.clearLogs();
  };

  const handleExportLogs = (): void => {
    const logsJson = logger.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coffee-shop-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogStats = () => {
    const stats = {
      total: logs.length,
      debug: logs.filter(log => log.level === LogLevel.DEBUG).length,
      info: logs.filter(log => log.level === LogLevel.INFO).length,
      warn: logs.filter(log => log.level === LogLevel.WARN).length,
      error: logs.filter(log => log.level === LogLevel.ERROR).length,
    };
    return stats;
  };

  const stats = getLogStats();

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <BugReportIcon color="primary" />
            <Typography variant="h6">
              Логи приложения
            </Typography>
            <Badge badgeContent={stats.total} color="primary">
              <Chip label="Всего" size="small" />
            </Badge>
            {stats.error > 0 && (
              <Badge badgeContent={stats.error} color="error">
                <Chip label="Ошибки" size="small" color="error" />
              </Badge>
            )}
            {stats.warn > 0 && (
              <Badge badgeContent={stats.warn} color="warning">
                <Chip label="Предупреждения" size="small" color="warning" />
              </Badge>
            )}
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Фильтры */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>Level</InputLabel>
              <Select
                value={selectedLevel}
                label="Level"
                onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'ALL')}
              >
                <MenuItem value="ALL">All levels</MenuItem>
                <MenuItem value={LogLevel.DEBUG}>Debug</MenuItem>
                <MenuItem value={LogLevel.INFO}>Info</MenuItem>
                <MenuItem value={LogLevel.WARN}>Warning</MenuItem>
                <MenuItem value={LogLevel.ERROR}>Error</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="ALL">All categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ flexGrow: 1 }}
            />

            <Box>
              <Tooltip title="Clear logs">
                <IconButton onClick={handleClearLogs} size="small">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export logs">
                <IconButton onClick={handleExportLogs} size="small">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </Paper>

        {/* Список логов */}
        <Box sx={{ height: 'calc(90vh - 300px)', overflow: 'auto' }}>
          {filteredLogs.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No logs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {logs.length === 0 
                  ? 'Start using the application to see logs here'
                  : 'Try changing the filters'
                }
              </Typography>
            </Paper>
          ) : (
            <List>
              {filteredLogs.map((log) => (
                <ListItem key={log.id} sx={{ px: 0 }}>
                  <Paper sx={{ width: '100%', p: 1 }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" gap={2} width="100%">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', minWidth: 80 }}>
                            {formatTimestamp(log.timestamp)}
                          </Typography>
                          
                          <Chip
                            size="small"
                            label={LogLevel[log.level]}
                            sx={{
                              backgroundColor: getLevelColor(log.level),
                              color: 'white',
                              fontWeight: 'bold',
                              minWidth: 80
                            }}
                          />
                          
                          <Chip
                            size="small"
                            label={log.category}
                            variant="outlined"
                            sx={{ minWidth: 120 }}
                          />
                          
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {log.message}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails>
                        {log.data && (
                          <Box mb={2}>
                            <Typography variant="subtitle2" gutterBottom>
                              Data:
                            </Typography>
                            <Paper sx={{ p: 1, backgroundColor: '#f5f5f5' }}>
                              <pre style={{ 
                                margin: 0, 
                                fontSize: '12px', 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                              }}>
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </Paper>
                          </Box>
                        )}
                        
                        {log.stack && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Stack Trace:
                            </Typography>
                            <Paper sx={{ p: 1, backgroundColor: '#ffebee' }}>
                              <pre style={{ 
                                margin: 0, 
                                fontSize: '12px', 
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                color: '#d32f2f'
                              }}>
                                {log.stack}
                              </pre>
                            </Paper>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          Shown: {filteredLogs.length} of {logs.length} logs
        </Typography>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Компонент кнопки для открытия логов
export const LogViewerFab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const unsubscribe = logger.subscribe((logs) => {
      const errors = logs.filter(log => log.level === LogLevel.ERROR).length;
      setErrorCount(errors);
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <Fab
        color={errorCount > 0 ? "error" : "primary"}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => setIsOpen(true)}
      >
        <Badge badgeContent={errorCount > 0 ? errorCount : null} color="error">
          <BugReportIcon />
        </Badge>
      </Fab>

      <LogViewer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default LogViewer; 