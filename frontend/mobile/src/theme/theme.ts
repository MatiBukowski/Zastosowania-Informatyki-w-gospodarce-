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
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    button: {
      backgroundColor: colors.strawberryRed,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
    }
  })
};