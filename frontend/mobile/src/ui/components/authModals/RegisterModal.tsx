import { Pressable, TextInput, View, Text, Modal } from "react-native";
import { useState } from "react";

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
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const namePattern = /^[\p{L}]+(?:\s[\p{L}]+)*$/u;

  const validateName = (value: string, label: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return `Please enter your ${label.toLowerCase()}.`;
    }

    if (!namePattern.test(trimmedValue)) {
      return `${label} can contain letters only.`;
    }

    return null;
  };

  const validateRegistration = () => {
    const firstNameError = validateName(firstName, "First name");
    if (firstNameError) return firstNameError;

    const surnameError = validateName(surname, "Surname");
    if (surnameError) return surnameError;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return "Please enter your email address.";
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (password !== confirmPassword) return "Passwords do not match.";

    return null;
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
              Create an Account
            </Text>
            <Text style={{ color: "gray", marginBottom: 12 }}>
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
            placeholder="First name"
            value={firstName}
            onChangeText={(value) => {
              setFirstName(value);
              setErrorMessage(null);
            }}
            autoCapitalize="words"
            style={{ borderWidth: 1, borderColor: theme.colors.light_gray, backgroundColor: theme.colors.giga_light_gray, borderRadius: 8, padding: 16, marginBottom: 16 }}
          />

          <TextInput
            placeholder="Surname"
            value={surname}
            onChangeText={(value) => {
              setSurname(value);
              setErrorMessage(null);
            }}
            autoCapitalize="words"
            style={{ borderWidth: 1, borderColor: theme.colors.light_gray, backgroundColor: theme.colors.giga_light_gray, borderRadius: 8, padding: 16, marginBottom: 16 }}
          />

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrorMessage(null);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ borderWidth: 1, borderColor: theme.colors.light_gray,backgroundColor: theme.colors.giga_light_gray, borderRadius: 8, padding: 16, marginBottom: 16 }}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setErrorMessage(null);
            }}
            secureTextEntry
            style={{ borderWidth: 1, borderColor: theme.colors.light_gray, backgroundColor: theme.colors.giga_light_gray, borderRadius: 8, padding: 16, marginBottom: 16 }}
          />
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setErrorMessage(null);
            }}
            secureTextEntry
            style={{ borderWidth: 1, borderColor: theme.colors.light_gray, backgroundColor: theme.colors.giga_light_gray, borderRadius: 8, padding: 16, marginBottom: 16 }}
          />
          
          <StyledButton
            onPress={async () => {
              try {
                const validationError = validateRegistration();
                if (validationError) {
                  setErrorMessage(validationError);
                  return;
                }

                const registerRequest: IRegisterRequest = {
                  first_name: firstName.trim(),
                  surname: surname.trim(),
                  email: email.trim(),
                  password: password,
                };

                await register(registerRequest);
                onClose();
              } catch (error) {
                setErrorMessage("We could not create your account. Please check your details and try again.");
              }
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