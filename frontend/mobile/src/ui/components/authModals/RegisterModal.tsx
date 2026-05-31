import { Pressable, TextInput, View, Text, Modal, Button } from "react-native";

import { useAuth } from "@/services/providers/AuthProvider";
import { IRegisterRequest } from "@/services/interfaces/user";
import StyledButton from "@/ui/components/buttons/StyledButton";
import { theme } from "@/ui/theme/theme";

type RegisterModalProps = {
  visible: boolean;
  description?: string;
  onClose: () => void;
};

export default function RegisterModal({ visible, description = "Please enter your details", onClose }: RegisterModalProps) {
  const { register } = useAuth();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 24}}>
          <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginBottom: 8 }}>
            <Text style={{ ...theme.typography.h4, marginBottom: 8 }}>
              Create an Account
            </Text>
            <Text style={{ color: "gray", marginBottom: 12 }}>
              {description}
            </Text>
          </View>

          <TextInput
            placeholder="Email"
            style={{ borderWidth: 1, borderColor: theme.colors.light_gray,backgroundColor: theme.colors.giga_light_gray, borderRadius: 8, padding: 16, marginBottom: 16 }}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            style={{ borderWidth: 1, borderColor: theme.colors.light_gray, backgroundColor: theme.colors.giga_light_gray, borderRadius: 8, padding: 16, marginBottom: 16 }}
          />
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
            style={{ borderWidth: 1, borderColor: theme.colors.light_gray, backgroundColor: theme.colors.giga_light_gray, borderRadius: 8, padding: 16, marginBottom: 16 }}
          />
          
          <StyledButton
            onPress={async () => {
              const registerRequest: IRegisterRequest = {
                email: "email",
                password: "password"
              };
              await register(registerRequest);
              onClose();
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Register</Text>
          </StyledButton>
          
          <StyledButton variant="secondary" onPress={onClose} accessibilityLabel="Cancel">
            Cancel
          </StyledButton>
        </View>
      </View>
    </Modal>
  );
}