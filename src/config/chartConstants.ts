// Chart-specific constants for better organization and reusability

export const CHART_COLORS = {
  PRIMARY: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'],
  ORDER_TYPES: {
    DINE_IN: '#00C49F',
    TAKEAWAY: '#FFBB28', 
    DELIVERY: '#FF8042'
  },
  CATEGORIES: ['#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'],
  AREA_CHART: '#8884d8'
} as const;

export const CHART_DIMENSIONS = {
  HEIGHT: {
    SMALL: 300,
    MEDIUM: 400,
    LARGE: 500,
  },
  PIE: {
    OUTER_RADIUS: {
      SMALL: 80,
      LARGE: 180,
    },
  },
  MARGIN: {
    DEFAULT: 16,
    LARGE: 24,
  },
} as const;

export const CHART_SETTINGS = {
  ANIMATION_DISABLED: {
    isAnimationActive: false,
    activeDot: false,
  },
  INTERACTION_DISABLED: {
    onMouseDown: () => {},
    onClick: () => {},
  },
  PIE_INTERACTION_DISABLED: {
    isAnimationActive: false,
    onMouseDown: () => {},
    onClick: () => {},
  },
  COMMON_PROPS: {
    strokeWidth: 2,
    dot: false,
  }
} as const;

export const TIME_INTERVALS = {
  MINUTES_PER_INTERVAL: 20,
  INTERVALS_PER_HOUR: 3,
  HOURS_PER_DAY: 24,
  TOTAL_INTERVALS: 72, // 24 * 3
} as const;

// Order type filter options
export const ORDER_TYPE_FILTER_OPTIONS = [
  { key: 'dine_in', color: CHART_COLORS.ORDER_TYPES.DINE_IN, labelKey: 'report.dine_in' },
  { key: 'takeaway', color: CHART_COLORS.ORDER_TYPES.TAKEAWAY, labelKey: 'report.takeaway' },
  { key: 'delivery', color: CHART_COLORS.ORDER_TYPES.DELIVERY, labelKey: 'report.delivery' },
] as const; 