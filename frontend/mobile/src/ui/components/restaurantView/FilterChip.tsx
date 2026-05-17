import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Pressable, Text, View } from 'react-native';

import { theme } from '@/ui/theme/theme';

export const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: 16,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 10,
    maxWidth: '100%',
  },
  text: {
    flexShrink: 1,
    color: 'white',
    fontWeight: '600',
    marginRight: 4,
  },
  iconContainer: {
    flexShrink: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

interface Props {
  label: string;
  onRemove: () => void;
}

export function FilterChip({
  label,
  onRemove,
}: Props) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>
        {label}
      </Text>

      <Pressable onPress={onRemove} style={styles.iconContainer}>
        <Ionicons
          name="close"
          size={16}
          color="white"
        />
      </Pressable>
    </View>
  );
}