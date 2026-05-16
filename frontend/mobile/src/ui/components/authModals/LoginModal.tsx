import { Pressable, TextInput, View, Text, Modal, Button } from "react-native";
import { useState } from "react";

import { useAuth } from "@/services/providers/AuthProvider";
import { ILoginRequest } from "@/services/interfaces/user";
import StyledButton from "@/ui/components/buttons/StyledButton";
import { theme } from "@/ui/theme/theme";

type LoginModalProps = {
  visible: boolean;
  description?: string;
  onClose: () => void;
};

export default function LoginModal({ visible, description = "Please enter your credentials", onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
              Welcome Back!
            </Text>
            <Text style={{ color: "gray", marginBottom: 12 }}>
              {description}
            </Text>
          </View>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ borderWidth: 1, borderColor: theme.colors.light_gray,backgroundColor: theme.colors.giga_light_gray, borderRadius: 8, padding: 16, marginBottom: 16 }}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ borderWidth: 1, borderColor: theme.colors.light_gray, backgroundColor: theme.colors.giga_light_gray, borderRadius: 8, padding: 16, marginBottom: 16 }}
          />
          
          <StyledButton
            onPress={async () => {
              const loginRequest: ILoginRequest = {
                email: email,
                password: password
              };
              await login(loginRequest);
              onClose();
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Login</Text>
          </StyledButton>
          <Pressable onPress={onClose} style={{ marginTop: 16, alignSelf: 'center' }}>
            <Text style={{ color: "gray", fontSize: 14 }}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}