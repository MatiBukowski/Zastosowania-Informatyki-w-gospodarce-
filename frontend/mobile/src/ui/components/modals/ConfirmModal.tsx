import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
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
            <Pressable
              style={[styles.btn, styles.secondaryBtn]}
              onPress={onSecondary}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryText}>{secondaryLabel}</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.primaryBtn]}
              onPress={onPrimary}
              accessibilityRole="button"
            >
              <Text style={styles.primaryText}>{primaryLabel}</Text>
            </Pressable>
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
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: '#eee',
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
