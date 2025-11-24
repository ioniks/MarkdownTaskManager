/**
 * COMPREHENSIVE THEME SYSTEM
 * Central configuration for all UI components
 * Ensures consistency and easy theming
 */

export const theme = {
  // ========================================
  // COLORS
  // ========================================
  colors: {
    // Background colors
    background: {
      primary: '#f5f5f5',        // Main app background
      secondary: '#ffffff',       // Cards, panels
      tertiary: '#fafafa',        // Hover states
      filterBar: '#ffffff',       // Filter bar background
      kanbanColumn: '#ffffff',    // Kanban columns
    },

    // Text colors
    text: {
      primary: '#212121',         // Main text
      secondary: '#757575',       // Labels, secondary text
      tertiary: '#9e9e9e',        // Disabled, very light text
      inverse: '#ffffff',         // White text on colored backgrounds
      link: '#2196F3',            // Links
    },

    // Border colors
    border: {
      light: '#f0f0f0',           // Very light borders
      default: '#e0e0e0',         // Standard borders
      medium: '#cbd5e0',          // Form inputs
      dark: '#bdbdbd',            // Darker borders
    },

    // Brand colors (Blue theme)
    primary: {
      main: '#2196F3',            // Main blue
      hover: '#1976D2',           // Darker blue
      light: '#E3F2FD',           // Very light blue
      dark: '#1565C0',            // Dark blue text
      pressed: '#1565C0',         // Pressed state
    },

    // Secondary colors (Gray)
    secondary: {
      main: '#f5f5f5',            // Light gray
      hover: '#eeeeee',           // Slightly darker
      border: '#e0e0e0',          // Border
      text: '#212121',            // Text on secondary
    },

    // Semantic colors
    success: {
      main: '#22C55E',
      light: '#dcfce7',
      dark: '#16a34a',
      text: '#166534',
    },

    warning: {
      main: '#F59E0B',            // Orange for warnings
      light: '#fef3c7',
      dark: '#d97706',
      text: '#92400e',
    },

    error: {
      main: '#EF4444',            // Red
      light: '#fee2e2',
      dark: '#dc2626',
      text: '#991b1b',
    },

    info: {
      main: '#3B82F6',
      light: '#dbeafe',
      dark: '#1e40af',
      text: '#1e3a8a',
    },

    // Priority colors (EXACT matches from original)
    priority: {
      critical: '#EF4444',        // Red
      high: '#F97316',            // Orange
      medium: '#EAB308',          // Gold/Yellow (THIS IS KEY - not too yellow)
      low: '#22C55E',             // Green
      default: '#888888',         // Gray

      // Color name variants
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
      priority: {
        // Priority badges - colored backgrounds with white text
        critical: { bg: '#EF4444', text: '#ffffff' },
        high: { bg: '#F97316', text: '#ffffff' },
        medium: { bg: '#EAB308', text: '#ffffff' },  // GOLD/AMBER
        low: { bg: '#22C55E', text: '#ffffff' },
        default: { bg: '#888888', text: '#ffffff' },
      },
      category: {
        // Light blue background, dark blue text
        bg: '#E3F2FD',
        text: '#1565C0',
      },
      assignee: {
        // Light purple background, dark purple text
        bg: '#F3E5F5',
        text: '#6A1B9A',
      },
      columnCount: {
        // Light blue/gray badge for column counts
        bg: '#E3F2FD',
        text: '#1565C0',
      },
    },

    tag: {
      // Orange-tinted tags
      bg: '#FFF3E0',
      text: '#E65100',
    },

    progress: {
      // Progress bar colors
      bg: '#e0e0e0',              // Background track
      fill: '#2196F3',            // Blue fill
    },

    icon: {
      default: '#757575',         // Default icon color
      hover: '#212121',           // Hover state
      active: '#2196F3',          // Active/selected
    },
  },

  // ========================================
  // TYPOGRAPHY
  // ========================================
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",

    // Font sizes - more compact than before
    fontSize: {
      xs: '0.7rem',               // 11.2px - very small
      sm: '0.75rem',              // 12px - small
      base: '0.85rem',            // 13.6px - base
      md: '0.875rem',             // 14px - medium
      lg: '0.95rem',              // 15.2px - large
      xl: '1rem',                 // 16px - extra large
      '2xl': '1.25rem',           // 20px - headings
      '3xl': '1.5rem',            // 24px - large headings
      '4xl': '2rem',              // 32px - page titles
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
    },
  },

  // ========================================
  // SPACING
  // ========================================
  spacing: {
    xs: '0.25rem',                // 4px
    sm: '0.5rem',                 // 8px
    md: '0.75rem',                // 12px
    lg: '1rem',                   // 16px
    xl: '1.25rem',                // 20px
    '2xl': '1.5rem',              // 24px
    '3xl': '2rem',                // 32px

    // Component-specific spacing
    card: {
      padding: '1rem',            // Card inner padding
      gap: '0.5rem',              // Gap between cards
    },
    badge: {
      padding: '0.25rem 0.6rem',  // Badge padding
      gap: '0.5rem',              // Gap between badges
    },
  },

  // ========================================
  // BORDER RADIUS
  // ========================================
  radius: {
    none: '0',
    sm: '3px',
    md: '4px',
    default: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',               // Circular

    // Component-specific
    button: '6px',
    card: '6px',
    badge: '4px',
    input: '4px',
    modal: '8px',
  },

  // ========================================
  // SHADOWS
  // ========================================
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    default: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.25)',

    // Component-specific
    card: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cardHover: '0 4px 8px rgba(0, 0, 0, 0.15)',
    modal: '0 8px 16px rgba(0, 0, 0, 0.2)',
    dropdown: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },

  // ========================================
  // TRANSITIONS
  // ========================================
  transitions: {
    fast: '0.1s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',

    // Property-specific
    colors: '0.2s ease',
    transform: '0.2s ease',
    shadow: '0.2s ease',
    opacity: '0.2s ease',
  },

  // ========================================
  // Z-INDEX
  // ========================================
  zIndex: {
    base: 0,
    dropdown: 50,
    sticky: 100,
    fixed: 200,
    modalBackdrop: 1000,
    modal: 1001,
    popover: 1100,
    tooltip: 1200,
  },

  // ========================================
  // COMPONENTS
  // ========================================
  components: {
    button: {
      // Primary button (blue)
      primary: {
        bg: '#2196F3',
        bgHover: '#1976D2',
        bgActive: '#1565C0',
        text: '#ffffff',
        border: 'none',
        padding: '0.6rem 1.2rem',
        fontSize: '0.9rem',
        fontWeight: 500,
        radius: '6px',
        shadow: 'none',
        shadowHover: '0 4px 8px rgba(0, 0, 0, 0.15)',
      },
      // Secondary button (gray)
      secondary: {
        bg: '#f5f5f5',
        bgHover: '#eeeeee',
        bgActive: '#e0e0e0',
        text: '#212121',
        border: '1px solid #e0e0e0',
        padding: '0.6rem 1.2rem',
        fontSize: '0.9rem',
        fontWeight: 500,
        radius: '6px',
      },
      // Icon button
      icon: {
        size: '2rem',               // 32px
        padding: '0.5rem',
        radius: '4px',
        bg: 'transparent',
        bgHover: 'rgba(0, 0, 0, 0.05)',
        color: '#757575',
        colorHover: '#212121',
      },
      // Small blue circular + button
      addFilter: {
        size: '1.75rem',            // Smaller circular button
        bg: '#2196F3',
        bgHover: '#1976D2',
        text: '#ffffff',
        radius: '4px',
        fontSize: '1rem',
        padding: '0.25rem 0.5rem',
      },
    },

    card: {
      bg: '#ffffff',
      border: '1px solid #e0e0e0',
      borderHover: '1px solid #e0e0e0',
      radius: '6px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      shadowHover: '0 4px 8px rgba(0, 0, 0, 0.15)',
      padding: '1rem',
      gap: '0.5rem',
    },

    input: {
      bg: '#ffffff',
      border: '1px solid #cbd5e0',
      borderFocus: '1px solid #2196F3',
      radius: '4px',
      padding: '0.5rem',
      fontSize: '0.875rem',
      focusShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)',
    },

    select: {
      bg: '#ffffff',
      border: '1px solid #cbd5e0',
      borderFocus: '1px solid #2196F3',
      radius: '4px',
      padding: '0.5rem',
      fontSize: '0.875rem',
    },

    modal: {
      backdrop: 'rgba(0, 0, 0, 0.5)',
      bg: '#ffffff',
      radius: '8px',
      shadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      padding: '2rem',
      maxWidth: '80%',
    },
  },
};

// Helper to get nested theme values
export const getThemeValue = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme);
};

// Generate CSS custom properties
export const generateCSSVariables = () => {
  const vars = [];

  // Flatten theme object into CSS variables
  const flatten = (obj, prefix = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const varName = prefix ? `${prefix}-${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flatten(value, varName);
      } else {
        vars.push(`--${varName}: ${value};`);
      }
    });
  };

  flatten(theme);

  return `:root {\n  ${vars.join('\n  ')}\n}`;
};

export default theme;
