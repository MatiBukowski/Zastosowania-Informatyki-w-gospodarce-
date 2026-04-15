import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import StyledButton from './StyledButton';

export default function ScanQrButton() {
  return (
    <StyledButton>
      <View style={{ flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        <MaterialIcons name="qr-code-scanner" size={40} color="white" />
        <Text style={{ color: 'white', marginLeft: 8 }}>Scan QR Code</Text>
      </View>
    </StyledButton>
  );
}
