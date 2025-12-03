/**
 * Spooky Theme Tokens
 * 
 * Centralized theme configuration for programmatic access to colors,
 * animations, and other design tokens.
 */

export const spookyTheme = {
  colors: {
    background: {
      primary: '#0b0c0d',
      secondary: '#1a1a2e',
      tertiary: '#16213e',
    },
    accent: {
      orange: '#ff6b35',
      purple: '#6a1b9a',
      green: '#388e3c',
      neon: '#abbc04',
    },
    text: {
      primary: '#f8f9fa',
      secondary: '#cbd5e1',
      muted: '#94a3b8',
    },
    border: {
      subtle: '#2d3748',
      accent: '#4a5568',
    },
  },
  
  animations: {
    pulseGlow: {
      duration: '2s',
      timing: 'ease-in-out',
      iteration: 'infinite',
    },
    flicker: {
      duration: '3s',
      timing: 'ease-in-out',
      iteration: 'infinite',
    },
    float: {
      duration: '6s',
      timing: 'ease-in-out',
      iteration: 'infinite',
    },
    spinSlow: {
      duration: '3s',
      timing: 'linear',
      iteration: 'infinite',
    },
  },
  
  shadows: {
    purple: '0 0 20px rgba(106, 27, 154, 0.4)',
    green: '0 0 20px rgba(56, 142, 60, 0.4)',
    neon: '0 0 20px rgba(171, 188, 4, 0.5)',
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  },
  
  fonts: {
    gothic: 'var(--font-gothic)',
    sans: 'var(--font-sans)',
  },
  
  spacing: {
    section: {
      py: '4rem',
      px: {
        mobile: '1rem',
        tablet: '2rem',
        desktop: '4rem',
      },
    },
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

export type SpookyTheme = typeof spookyTheme;

/**
 * Helper function to get color with opacity
 * 
 * @example
 * ```tsx
 * const color = getColorWithOpacity('accent.purple', 0.5);
 * // Returns: rgba(106, 27, 154, 0.5)
 * ```
 */
export function getColorWithOpacity(
  colorPath: string,
  opacity: number
): string {
  const paths = colorPath.split('.');
  let color: any = spookyTheme.colors;
  
  for (const path of paths) {
    color = color[path];
  }
  
  if (typeof color !== 'string') {
    throw new Error(`Invalid color path: ${colorPath}`);
  }
  
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Helper function to create gradient strings
 * 
 * @example
 * ```tsx
 * const gradient = createGradient(['accent.purple', 'accent.green'], '135deg');
 * // Returns: linear-gradient(135deg, #6a1b9a, #388e3c)
 * ```
 */
export function createGradient(
  colorPaths: string[],
  direction: string = '135deg'
): string {
  const colors = colorPaths.map(path => {
    const paths = path.split('.');
    let color: any = spookyTheme.colors;
    
    for (const p of paths) {
      color = color[p];
    }
    
    return color;
  });
  
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
}

/**
 * Helper to check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * CSS-in-JS style object for programmatic styling
 */
export const spookyStyles = {
  card: {
    backgroundColor: spookyTheme.colors.background.secondary,
    borderColor: spookyTheme.colors.border.subtle,
    borderWidth: '1px',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: spookyTheme.shadows.card,
  },
  
  button: {
    backgroundColor: 'transparent',
    color: spookyTheme.colors.text.primary,
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.25rem',
    border: '2px solid transparent',
  },
  
  heading: {
    fontFamily: spookyTheme.fonts.gothic,
    color: spookyTheme.colors.text.primary,
    letterSpacing: '0.02em',
  },
  
  body: {
    fontFamily: spookyTheme.fonts.sans,
    color: spookyTheme.colors.text.secondary,
    lineHeight: '1.75',
  },
} as const;
