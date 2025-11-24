/**
 * Global Theme Configuration
 * Centralized styling system for easy theming and customization
 */

export const theme = {
  // Color Palette
  colors: {
    // Base colors
    background: {
      primary: '#f5f5f5',      // Main app background
      secondary: '#ffffff',     // Cards, panels, modals
      tertiary: '#fafafa',      // Subtle backgrounds
      hover: '#f0f0f0',         // Hover states
    },

    // Text colors
    text: {
      primary: '#212121',       // Main text
      secondary: '#757575',     // Secondary text, labels
      disabled: '#bdbdbd',      // Disabled text
      inverse: '#ffffff',       // White text
    },

    // Border colors
    border: {
      default: '#e0e0e0',       // Standard borders
      light: '#f0f0f0',         // Lighter borders
      dark: '#cbd5e0',          // Darker borders (inputs)
    },

    // Brand/Accent colors
    accent: {
      primary: '#2196F3',       // Main blue
      hover: '#1976D2',         // Darker blue for hover
      light: '#E3F2FD',         // Light blue backgrounds
      dark: '#1565C0',          // Dark blue text
    },

    // Semantic colors
    success: {
      main: '#22C55E',
      light: '#dcfce7',
      dark: '#16a34a',
    },

    warning: {
      main: '#F59E0B',
      light: '#fef3c7',
      dark: '#d97706',
    },

    error: {
      main: '#EF4444',
      light: '#fee2e2',
      dark: '#dc2626',
    },

    info: {
      main: '#3B82F6',
      light: '#dbeafe',
      dark: '#2563eb',
    },

    // Priority colors
    priority: {
      default: '#888888',
      critical: '#EF4444',
      high: '#F97316',
      medium: '#EAB308',
      low: '#22C55E',
      red: '#EF4444',
      orange: '#F97316',
      yellow: '#EAB308',
      green: '#22C55E',
      blue: '#3B82F6',
      purple: '#A855F7',
      white: '#E5E7EB',
      black: '#1F2937',
    },

    // Component-specific colors
    badge: {
      category: {
        bg: '#E3F2FD',
        text: '#1565C0',
      },
      assignee: {
        bg: '#F3E5F5',
        text: '#6A1B9A',
      },
      tag: {
        bg: '#FFF3E0',
        text: '#E65100',
      },
    },
  },

  // Shadows
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.25)',
  },

  // Border radius
  radius: {
    sm: '3px',
    md: '4px',
    default: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },

  // Spacing scale
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },

  // Typography
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",

    fontSize: {
      xs: '0.7rem',
      sm: '0.75rem',
      base: '0.85rem',
      md: '0.9rem',
      lg: '1rem',
      xl: '1.1rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    lineHeight: {
      tight: '1.2',
      normal: '1.6',
      relaxed: '1.8',
    },
  },

  // Transitions
  transitions: {
    fast: '0.1s',
    normal: '0.2s',
    slow: '0.3s',
  },

  // Z-index scale
  zIndex: {
    dropdown: 50,
    sticky: 100,
    modal: 1000,
    tooltip: 2000,
  },
};

/**
 * Helper function to get theme values
 * Usage: getThemeValue('colors.accent.primary') => '#2196F3'
 */
export function getThemeValue(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], theme);
}

/**
 * CSS Variables generator
 * Generates CSS custom properties from theme
 */
export function generateCSSVariables() {
  return `
    :root {
      /* Colors */
      --bg-primary: ${theme.colors.background.primary};
      --bg-secondary: ${theme.colors.background.secondary};
      --bg-tertiary: ${theme.colors.background.tertiary};
      --bg-hover: ${theme.colors.background.hover};

      --text-primary: ${theme.colors.text.primary};
      --text-secondary: ${theme.colors.text.secondary};
      --text-disabled: ${theme.colors.text.disabled};
      --text-inverse: ${theme.colors.text.inverse};

      --border-default: ${theme.colors.border.default};
      --border-light: ${theme.colors.border.light};
      --border-dark: ${theme.colors.border.dark};

      --accent: ${theme.colors.accent.primary};
      --accent-hover: ${theme.colors.accent.hover};
      --accent-light: ${theme.colors.accent.light};
      --accent-dark: ${theme.colors.accent.dark};

      --success: ${theme.colors.success.main};
      --warning: ${theme.colors.warning.main};
      --error: ${theme.colors.error.main};
      --info: ${theme.colors.info.main};

      /* Priority colors */
      --priority-default: ${theme.colors.priority.default};
      --priority-critical: ${theme.colors.priority.critical};
      --priority-high: ${theme.colors.priority.high};
      --priority-medium: ${theme.colors.priority.medium};
      --priority-low: ${theme.colors.priority.low};
      --priority-red: ${theme.colors.priority.red};
      --priority-orange: ${theme.colors.priority.orange};
      --priority-yellow: ${theme.colors.priority.yellow};
      --priority-green: ${theme.colors.priority.green};
      --priority-blue: ${theme.colors.priority.blue};
      --priority-purple: ${theme.colors.priority.purple};
      --priority-white: ${theme.colors.priority.white};
      --priority-black: ${theme.colors.priority.black};

      /* Shadows */
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
      --shadow-xl: ${theme.shadows.xl};

      /* Radius */
      --radius-sm: ${theme.radius.sm};
      --radius-md: ${theme.radius.md};
      --radius: ${theme.radius.default};
      --radius-lg: ${theme.radius.lg};
      --radius-xl: ${theme.radius.xl};

      /* Typography */
      --font-family: ${theme.typography.fontFamily};

      /* Transitions */
      --transition-fast: ${theme.transitions.fast};
      --transition: ${theme.transitions.normal};
      --transition-slow: ${theme.transitions.slow};
    }
  `;
}

export default theme;
