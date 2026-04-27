import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";
import { authService } from "../../services/api";
import { AuthContext } from "../../Context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", mobile: "", gender: "Male" });
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const suggestPassword = () => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "A1@";
    for (let i = 0; i < 7; i++) pass += charset.charAt(Math.floor(Math.random() * charset.length));
    setForm({ ...form, password: pass });
  };

  const handleRegister = async () => {
    const { name, email, password, gender, mobile } = form;
    if (!name || !email || !password || !mobile)
      return Alert.alert("Error", "All fields required");

    setLoading(true);
    const res = await authService.register(name, email, password, gender, mobile);
    setLoading(false);

    if (res.success) {
      // ✅ Go to OTP screen — do NOT call login() here
      navigation.navigate("OTPScreen", { email: form.email, type: "register" });
    } else {
      Alert.alert("Error", res.error || "Registration failed");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingVertical: 60 }}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Name" placeholderTextColor="#aaa" style={styles.input}
        value={form.name} onChangeText={(v) => setForm({ ...form, name: v })}
      />
      <TextInput
        placeholder="Email" placeholderTextColor="#aaa" style={styles.input}
        value={form.email} onChangeText={(v) => setForm({ ...form, email: v })}
        keyboardType="email-address" autoCapitalize="none"
      />
      <TextInput
        placeholder="Mobile" placeholderTextColor="#aaa" style={styles.input}
        value={form.mobile} onChangeText={(v) => setForm({ ...form, mobile: v })}
        keyboardType="phone-pad"
      />

      <View style={styles.genderRow}>
        {["Male", "Female"].map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.genderBtn, form.gender === g && styles.activeGender]}
            onPress={() => setForm({ ...form, gender: g })}
          >
            <Text style={{ color: "#fff" }}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.passwordWrapper}>
        <TextInput
          placeholder="Password" placeholderTextColor="#aaa"
          secureTextEntry={!passwordVisible} style={styles.passwordInput}
          value={form.password} onChangeText={(v) => setForm({ ...form, password: v })}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={{ padding: 10 }}>
          <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={20} color="#aaa" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={suggestPassword}>
        <Text style={styles.suggestText}>Suggest Strong Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { color: "#fff", fontSize: 28, textAlign: "center", marginBottom: 30, fontWeight: "bold" },
  input: { backgroundColor: COLORS.card, padding: 15, borderRadius: 10, marginBottom: 15, color: "#fff" },
  genderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  genderBtn: { flex: 0.48, backgroundColor: COLORS.card, padding: 12, borderRadius: 10, alignItems: "center" },
  activeGender: { backgroundColor: COLORS.primary },
  passwordWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderRadius: 10, marginBottom: 10 },
  passwordInput: { flex: 1, padding: 15, color: "#fff" },
  suggestText: { color: COLORS.primary, textAlign: "right", marginBottom: 20, fontSize: 12 },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { color: COLORS.primary, textAlign: "center", marginTop: 15, textDecorationLine: "underline" },
});