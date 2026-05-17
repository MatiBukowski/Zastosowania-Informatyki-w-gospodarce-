import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Pressable, TextInput, View } from 'react-native';

import { theme } from '@/ui/theme/theme';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  serach_icon: {
    marginRight: 8,
  },
  filter_icon: {
    marginLeft: 8,
  },
});

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  onFilterPress: () => void;
}

export function SearchBar({
  search,
  onSearchChange,
  onFilterPress,
}: Props) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={20}
        color={theme.colors.text}
        style={styles.serach_icon}
      />

      <TextInput
        style={styles.input}
        placeholder="Search restaurants..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={onSearchChange}
      />

      <Pressable onPress={onFilterPress}>
        <Ionicons
          name="filter"
          size={20}
          color={theme.colors.text}
          style={styles.filter_icon}
        />
      </Pressable>
    </View>
  );
}