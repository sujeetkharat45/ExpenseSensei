import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";
import { authService } from "../../services/api";
import { AuthContext } from "../../Context/AuthContext";
import { AppContext } from "../../Context/AppContext";
import SuccessModal from "../../components/SuccessModal"; 
import ErrorModal from "../../components/ErrorModal";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); 
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); // 🔥 Visibility state
  
  const { login } = useContext(AuthContext);
  const { fetchTransactions } = useContext(AppContext);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      setShowError(true);
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        await fetchTransactions(); 
        setShowSuccess(true); 
      } else {
        setErrorMsg(response.error || "Invalid email or password.");
        setShowError(true);
      }
    } catch (error) {
      setErrorMsg("Connection failed. Check your internet.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput 
        placeholder="Email" 
        placeholderTextColor="#aaa" 
        style={styles.input} 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={styles.passwordWrapper}>
        <TextInput 
          placeholder="Password" 
          placeholderTextColor="#aaa" 
          secureTextEntry={!passwordVisible} // 🔥 Toggles based on state
          style={styles.passwordInput} 
          value={password} 
          onChangeText={setPassword} 
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setPasswordVisible(!passwordVisible)}>
          <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={22} color="#aaa" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Don't have an account? Create one</Text>
      </TouchableOpacity>

      <SuccessModal 
        visible={showSuccess} 
        title="Login Successful!" 
        message="Welcome back to ExpenseSensei! 🤖" 
        onConfirm={() => { setShowSuccess(false); login(); }} 
      />

      <ErrorModal 
        visible={showError} 
        title="Login Failed" 
        message={errorMsg} 
        onConfirm={() => setShowError(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: "center", padding: 20 },
  title: { color: COLORS.text, fontSize: 28, marginBottom: 30, textAlign: "center", fontWeight: "bold" },
  input: { backgroundColor: COLORS.card, padding: 15, borderRadius: 10, marginBottom: 15, color: "#fff" },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 10, marginBottom: 20 },
  passwordInput: { flex: 1, padding: 15, color: "#fff" },
  eyeIcon: { paddingHorizontal: 15 },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, marginBottom: 10 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  link: { color: COLORS.primary, textAlign: "center", marginTop: 15, textDecorationLine: "underline" },
});