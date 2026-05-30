import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '@/ui/theme/theme';

interface StyledButtonProps {
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  accessibilityLabel?: string;
}

export default function StyledButton({
                                       onPress,
                                       children,
                                       variant = 'primary',
                                       disabled = false,
                                       accessibilityLabel,
                                     }: StyledButtonProps) {
  return (
      <Pressable
          style={[
            styles.base,
            variant === 'primary' ? styles.primary : styles.secondary,
            disabled && styles.disabled,
          ]}
          onPress={onPress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled }}
      >
        {typeof children === 'string' ? (
            <Text style={[styles.text, variant === 'secondary' && styles.textSecondary, disabled && styles.textDisabled]}>
              {children}
            </Text>
        ) : (
            children
        )}
      </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  disabled: {
    backgroundColor: '#E0E0E0',
    borderWidth: 0,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  textSecondary: {
    color: theme.colors.primary,
  },
  textDisabled: {
    color: '#aaa',
  },
});