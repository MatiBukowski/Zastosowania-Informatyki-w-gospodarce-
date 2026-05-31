import { Pressable, TextInput, View, Text, Modal } from "react-native";
import { useState } from "react";
import axios from "axios";

import { useAuth } from "@/services/providers/AuthProvider";
import { ILoginRequest } from "@/services/interfaces/user";
import StyledButton from "@/ui/components/buttons/StyledButton";
import { theme } from "@/ui/theme/theme";

type LoginModalProps = {
  visible: boolean;
  description?: string;
  onClose: () => void;
  showRegisterLink?: boolean;
  onRegisterPress?: () => void;
};

export default function LoginModal({
  visible,
  description = "Please enter your credentials",
  onClose,
  showRegisterLink = false,
  onRegisterPress,
}: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getLoginErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail) && detail.length > 0) {
        const firstError = detail[0];
        const field = firstError?.loc?.[1];

        if (field === "email") return "Please enter a valid email address.";
        if (field === "password") return "Please enter your password.";
      }

      if (typeof detail === "string" && detail.trim()) {
        return detail;
      }
    }

    return "We could not log you in. Check your email and password and try again.";
  };

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
            <Text style={{ color: "gray", marginBottom: 12, textAlign: "center" }}>
              {description}
            </Text>
          </View>

          {errorMessage ? (
            <View style={{ backgroundColor: "#FEE2E2", borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: "#B91C1C", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ borderWidth: 1, borderColor: theme.colors.light_gray,backgroundColor: theme.colors.giga_light_gray, borderRadius: 8, padding: 16, marginBottom: 12 }}
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
              try {
                setErrorMessage(null);

                const loginRequest: ILoginRequest = {
                  email: email.trim(),
                  password: password,
                };

                await login(loginRequest);
                onClose();
              } catch (error) {
                setErrorMessage(getLoginErrorMessage(error));
              }
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Login</Text>
          </StyledButton>
            
          <StyledButton variant="secondary" onPress={onClose} accessibilityLabel="Cancel">
            Cancel
          </StyledButton>

          {showRegisterLink && onRegisterPress ? (
            <View style={{ marginTop: 8, flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
              <Text style={{ color: "#666", fontSize: 13 }}>
                Don&apos;t have an account? {" "}
              </Text>
              <Pressable onPress={onRegisterPress} hitSlop={8}>
                <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: "700", textDecorationLine: "underline" }}>
                  Register
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}