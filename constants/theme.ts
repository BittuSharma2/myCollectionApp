import { Platform } from 'react-native';

// 1. Define our app's core brand colors
const brandPrimary = '#4A00E0'; // The main purple
const brandLight = '#78D1E8';  // The light blue icon color

// 2. Define colors for Light Mode
const tintColorLight = brandPrimary;
const light = {
  text: '#000',
  textSecondary: '#666',
  background: '#FFFFFF', // Pure white page background
  tint: tintColorLight,
  tabIconDefault: '#ccc',
  tabIconSelected: tintColorLight,
  tabBar: '#FFFFFF', // White tab bar
  card: '#f9f9f9', // Light grey for list items
  input: '#f0f0f0', // Light grey for inputs
  formBackground: '#f0f0f0', // Light grey for form pages
  header: '#FFFFFF', // White header
  borderColor: '#e0e0e0',
  buttonDefault: '#f0f0f0',
  buttonDefaultText: tintColorLight,
  buttonPrimary: tintColorLight,
  buttonPrimaryText: '#FFFFFF',
  danger: '#D9534F',
  icon: brandLight,
};

// 3. Define colors for Dark Mode
const tintColorDark = '#FFFFFF';
const dark = {
  text: '#FFFFFF',
  textSecondary: '#999',
  background: '#121212', // Dark background
  tint: tintColorDark,
  tabIconDefault: '#777',
  tabIconSelected: tintColorDark,
  tabBar: '#1A1A1A', // Dark tab bar
  card: '#272727', // Dark grey for list items
  input: '#333333', // Darker grey for inputs
  formBackground: '#121212', // Dark background for form pages
  header: '#1A1A1A', // Dark header
  borderColor: '#444444',
  buttonDefault: '#333333',
  buttonDefaultText: '#FFFFFF',
  buttonPrimary: '#FFFFFF',
  buttonPrimaryText: '#121212',
  danger: '#E57373',
  icon: brandLight,
};

// 4. Export the final Colors object
export const Colors = {
  light: light,
  dark: dark,
};

// 5. Export Fonts (if it's not already in a separate file)
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});