import React, { useState, useContext } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { COLORS } from "../../utils/colors";
import { authService } from "../../services/api";
import { AuthContext } from "../../Context/AuthContext";

export default function OTPScreen({ navigation, route }) {
  const { email, type } = route.params; // type = "register" or "login"
  const { login } = useContext(AuthContext);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6)
      return Alert.alert("Error", "Please enter a valid 6-digit OTP");

    setLoading(true);
    const res = type === "register"
      ? await authService.verifyRegisterOtp(email, otp)
      : await authService.verifyLoginOtp(email, otp);
    setLoading(false);

    if (res.success) {
      login(res.token, res.user);
    } else {
      Alert.alert("Error", res.error || "OTP verification failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP 🔐</Text>
      <Text style={styles.subtitle}>We sent a 6-digit OTP to</Text>
      <Text style={styles.email}>{email}</Text>

      <TextInput
        style={styles.input}
        placeholder="• • • • • •"
        placeholderTextColor="#555"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Verify & Continue</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: "center"
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10
  },
  subtitle: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 14
  },
  email: {
    color: COLORS.primary,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 30,
    fontSize: 15
  },
  input: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 10,
    color: "#fff",
    fontSize: 28,
    textAlign: "center",
    letterSpacing: 12,
    marginBottom: 20
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
  backText: {
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 10,
    fontSize: 14
  }
});