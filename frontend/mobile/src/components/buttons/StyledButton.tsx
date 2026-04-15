import { Pressable, Text, View } from 'react-native';
import { theme } from '../../theme/theme';

interface StyledButtonProps {
  children?: React.ReactNode;
  onPress?: () => void;
}

export default function StyledButton({ onPress, children }: StyledButtonProps) {
  return (
    <Pressable 
      style={[theme.common.button]} 
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}
