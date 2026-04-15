import { StyleSheet } from 'react-native';
import { colors } from './palette';

export const theme = {
  // color base
  colors: {
    primary: colors.strawberryRed,
    secondary: colors.fern,
    background: colors.seashell,
    surface: '#ffffff',
    text: colors.carbonBlack,
    accent: colors.tangerineDream,
    white: '#ffffff',
    gray: '#666666',
  },
  spacing: 16,
  borderRadius: 16,

  // styles
  typography: {
    h4: {
      fontSize: 24,
      fontWeight: '800' as const,
      color: colors.strawberryRed,
    },
    h5: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: colors.strawberryRed,
    },
    h6: {
      fontSize: 18,
      fontWeight: '500' as const,
      color: colors.strawberryRed,
    },
    body: {
      fontSize: 16,
      color: colors.carbonBlack,
    },
    caption: {
      fontSize: 14,
      color: '#666666',
    }
  },

  // StyleSheet

  common: StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: colors.seashell,
      paddingHorizontal: 16,
      paddingTop: 60,
      gap: 20,
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(34, 34, 23, 0.08)',
      elevation: 1,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
    },
    button: {
      backgroundColor: colors.strawberryRed,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
    }
  })
};