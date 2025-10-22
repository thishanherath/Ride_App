// Design System Tokens
// These tokens can be used programmatically in JavaScript/React components

export const colors = {
  primary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#FF6B35', // Main brand color
    600: '#E55722', // Darker variant
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  }
};

export const typography = {
  fontFamily: {
    primary: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
};

export const spacing = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
};

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
};

export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }
};

// Utility functions for accessing tokens
export const getColor = (path) => {
  const keys = path.split('.');
  let value = colors;
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return null;
  }
  return value;
};

export const getSpacing = (size) => spacing[size] || size;

export const getBorderRadius = (size) => borderRadius[size] || size;

export const getShadow = (size) => shadows[size] || size;

// Component variants
export const buttonVariants = {
  primary: {
    backgroundColor: colors.primary[500],
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: colors.primary[600],
    },
    '&:focus': {
      boxShadow: `0 0 0 3px ${colors.primary[500]}33`,
    }
  },
  secondary: {
    backgroundColor: colors.gray[100],
    color: colors.gray[900],
    '&:hover': {
      backgroundColor: colors.gray[200],
    },
    '&:focus': {
      boxShadow: `0 0 0 3px ${colors.gray[500]}33`,
    }
  },
  outline: {
    backgroundColor: 'transparent',
    color: colors.primary[500],
    border: `2px solid ${colors.primary[500]}`,
    '&:hover': {
      backgroundColor: colors.primary[50],
    },
    '&:focus': {
      boxShadow: `0 0 0 3px ${colors.primary[500]}33`,
    }
  }
};

export const inputVariants = {
  default: {
    backgroundColor: colors.gray[50],
    border: 'none',
    borderRadius: borderRadius.xl,
    padding: `${spacing[3]} ${spacing[4]}`,
    '&:focus': {
      backgroundColor: '#FFFFFF',
      boxShadow: `0 0 0 2px ${colors.primary[500]}`,
    }
  },
  error: {
    boxShadow: `0 0 0 2px ${colors.semantic.error}`,
    '&:focus': {
      boxShadow: `0 0 0 2px ${colors.semantic.error}`,
    }
  }
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  zIndex,
  animations,
  buttonVariants,
  inputVariants,
  getColor,
  getSpacing,
  getBorderRadius,
  getShadow,
};