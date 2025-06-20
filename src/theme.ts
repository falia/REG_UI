// theme.ts - Enhanced for Regulatory Finance
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0D47A1', // Navy Blue - trust & authority
      light: '#5472D3',
      dark: '#002171',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#607D8B', // Muted Blue Grey - professional
      light: '#8EACBB',
      dark: '#34515E',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F7F9FC', // Very light gray/blue - easy on eyes
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A', // Near black for maximum readability
      secondary: '#4F4F4F', // Medium gray for secondary info
    },
    error: {
      main: '#C62828', // Strong red for alerts/errors
      light: '#EF5350',
      dark: '#8E0000',
    },
    warning: {
      main: '#F9A825', // Amber for warnings
      light: '#FFD54F',
      dark: '#F57F17',
    },
    info: {
      main: '#0288D1', // Clear blue for information
      light: '#03A9F4',
      dark: '#01579B',
    },
    success: {
      main: '#2E7D32', // Professional green for success states
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    // Additional colors for regulatory context
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      color: '#0D47A1',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#0D47A1',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6, // Better for reading long regulatory text
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01071em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.03333em',
      color: '#757575',
    },
    button: {
      textTransform: 'none', // Professional, avoid all caps
      fontWeight: 500,
      letterSpacing: '0.02857em',
    },
    // Custom variants for regulatory content
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.00714em',
    },
  },
  shape: {
    borderRadius: 6, // Subtle, professional rounded corners
  },
  spacing: 8, // Standard 8px spacing unit
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 2px 4px rgba(13, 71, 161, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #E0E0E0',
          borderRadius: 6,
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
        },
        elevation2: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E0E0E0',
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: '#FAFAFA',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0D47A1',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0D47A1',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          border: '1px solid #E0E0E0',
          borderRadius: 6,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5F5F5',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#1A1A1A',
            borderBottom: '2px solid #E0E0E0',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 500,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        standardInfo: {
          backgroundColor: '#E3F2FD',
          color: '#01579B',
          '& .MuiAlert-icon': {
            color: '#0288D1',
          },
        },
        standardWarning: {
          backgroundColor: '#FFF8E1',
          color: '#F57F17',
          '& .MuiAlert-icon': {
            color: '#F9A825',
          },
        },
        standardError: {
          backgroundColor: '#FFEBEE',
          color: '#8E0000',
          '& .MuiAlert-icon': {
            color: '#C62828',
          },
        },
        standardSuccess: {
          backgroundColor: '#E8F5E8',
          color: '#1B5E20',
          '& .MuiAlert-icon': {
            color: '#2E7D32',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #E0E0E0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E0E0E0',
          boxShadow: 'none',
        },
      },
    },
    // Custom styling for code/regulation blocks
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.regulation-text': {
            fontFamily: '"Roboto Mono", monospace',
            backgroundColor: '#F7F9FC',
            padding: '12px 16px',
            borderLeft: '4px solid #0D47A1',
            borderRadius: '0 6px 6px 0',
            fontSize: '0.875rem',
            lineHeight: 1.6,
          },
          '&.article-reference': {
            fontWeight: 600,
            color: '#0D47A1',
            textDecoration: 'underline',
            cursor: 'pointer',
          },
        },
      },
    },
  },
  // Custom theme extensions for regulatory content
  customColors: {
    regulatory: {
      primary: '#0D47A1',
      secondary: '#607D8B',
      accent: '#0288D1',
      highlight: '#FFF3E0', // Light orange for highlighting
      citation: '#E8F5E8', // Light green for citations
      warning: '#FFF8E1', // Light amber for regulatory warnings
    },
  },
});

// Extend the theme interface
declare module '@mui/material/styles' {
  interface Theme {
    customColors: {
      regulatory: {
        primary: string;
        secondary: string;
        accent: string;
        highlight: string;
        citation: string;
        warning: string;
      };
    };
  }
  interface ThemeOptions {
    customColors?: {
      regulatory?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        highlight?: string;
        citation?: string;
        warning?: string;
      };
    };
  }
}

export default theme;