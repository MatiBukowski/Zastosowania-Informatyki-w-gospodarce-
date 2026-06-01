import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import StyledButton from '@/ui/components/buttons/StyledButton';
import { theme } from '@/ui/theme/theme';

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  primaryLabel = 'OK',
  secondaryLabel = 'Cancel',
  onPrimary,
  onSecondary,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actionsRow}>
            <View style={styles.buttonWrapper}>
              <StyledButton
                variant="secondary"
                onPress={onSecondary}
                accessibilityLabel={secondaryLabel}
              >
                <Text style={styles.secondaryText}>{secondaryLabel}</Text>
              </StyledButton>
            </View>

            <View style={styles.buttonWrapper}>
              <StyledButton
                variant="primary"
                onPress={onPrimary}
                accessibilityLabel={primaryLabel}
              >
                <Text style={styles.primaryText}>{primaryLabel}</Text>
              </StyledButton>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(34, 34, 23, 0.12)',
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800',
  },
  secondaryText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
});
