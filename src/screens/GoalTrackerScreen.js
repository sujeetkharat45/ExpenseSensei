import React, { useState, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  ActivityIndicator 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/colors";
import { useNavigation } from "@react-navigation/native";
import { AppContext } from "../Context/AppContext";

export default function GoalTrackerScreen() {
  const navigation = useNavigation();
  const { setMonthlyGoal } = useContext(AppContext);
  
  const [goalName, setGoalName] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [reverseEMI, setReverseEMI] = useState(0);
  const [emiComparison, setEmiComparison] = useState({ emi: 0, totalInterest: 0 });
  const [loading, setLoading] = useState(false);

  // 📈 Calculation Logic: Comparison of Traditional Loan vs Planning
  const calculateFinance = () => {
    if (amount && duration) {
      const p = parseFloat(amount);
      const n = parseInt(duration);
      
      if (isNaN(p) || isNaN(n) || n <= 0) return;

      // 1. Reverse EMI (Straight Savings Path)
      const revEMI = Math.ceil(p / n);
      setReverseEMI(revEMI);

      // 2. Traditional EMI (Assume 15% Annual Interest for Comparison)
      const annualRate = 0.15;
      const r = annualRate / 12;
      const tradEMI = Math.ceil((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
      const interest = (tradEMI * n) - p;

      setEmiComparison({ emi: tradEMI, totalInterest: interest });
    }
  };

  const handleSaveGoal = async () => {
    if (!goalName || !amount || !duration) {
      Alert.alert("Missing Info", "Please fill all fields.");
      return;
    }

    setLoading(true);
    // Persists the calculated plan to your MongoDB
    const success = await setMonthlyGoal({
      title: goalName,
      target: parseFloat(amount),
      installment: reverseEMI,
      months: parseInt(duration),
    });

    if (success) {
      Alert.alert("Goal Saved!", "Your Reverse EMI plan is now active.");
      navigation.navigate("App");
    } else {
      Alert.alert("Error", "Failed to save goal to database.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reverse EMI 🚀</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.label}>Goal Name</Text>
              <TextInput 
                style={styles.input} 
                value={goalName} 
                onChangeText={setGoalName} 
                placeholder="e.g., Macbook, Car, House" 
                placeholderTextColor="#666" 
              />
              
              <Text style={styles.label}>Target Amount (₹)</Text>
              <TextInput 
                style={styles.input} 
                value={amount} 
                onChangeText={(val) => { setAmount(val); }} 
                keyboardType="numeric" 
                placeholder="0.00" 
                placeholderTextColor="#666" 
                onBlur={calculateFinance} // Trigger comparison on blur
              />
              
              <Text style={styles.label}>Time Period (Months)</Text>
              <TextInput 
                style={styles.input} 
                value={duration} 
                onChangeText={(val) => { setDuration(val); }} 
                keyboardType="numeric" 
                placeholder="12" 
                placeholderTextColor="#666" 
                onBlur={calculateFinance} 
              />
            </View>

            {reverseEMI > 0 && (
              <>
                {/* 📊 Comparison Section */}
                <View style={styles.compareContainer}>
                  <View style={styles.compareBox}>
                    <Text style={styles.compareLabel}>Traditional EMI</Text>
                    <Text style={[styles.compareAmt, {color: '#F43F5E'}]}>₹{emiComparison.emi}</Text>
                    <Text style={styles.interestNote}>+ ₹{emiComparison.totalInterest.toLocaleString()} Interest</Text>
                  </View>
                  
                  <View style={[styles.compareBox, {backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)'}]}>
                    <Text style={styles.compareLabel}>Reverse EMI</Text>
                    <Text style={[styles.compareAmt, {color: '#22C55E'}]}>₹{reverseEMI.toLocaleString()}</Text>
                    <Text style={styles.interestNote}>₹0 Interest ✅</Text>
                  </View>
                </View>

                {/* 🎁 Savings Highlight */}
                <View style={styles.savingsBanner}>
                  <Ionicons name="gift" size={20} color="#22C55E" />
                  <Text style={styles.savingsText}>
                    You save <Text style={{fontWeight: 'bold'}}>₹{emiComparison.totalInterest.toLocaleString()}</Text> by planning ahead!
                  </Text>
                </View>
              </>
            )}

            <TouchableOpacity 
              style={[styles.saveGoalBtn, { opacity: loading ? 0.7 : 1 }]} 
              onPress={handleSaveGoal} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveGoalText}>Save Goal 🚀</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: 25, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  label: { color: COLORS.subtext, fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 15, color: '#fff', marginBottom: 20 },
  
  // Comparison Styles
  compareContainer: { flexDirection: 'row', gap: 10, marginTop: 20 },
  compareBox: { 
    flex: 1, 
    backgroundColor: COLORS.card, 
    padding: 15, 
    borderRadius: 20, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  compareLabel: { color: COLORS.subtext, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  compareAmt: { fontSize: 18, fontWeight: 'bold', marginVertical: 5 },
  interestNote: { color: COLORS.subtext, fontSize: 10 },
  
  // Savings Highlight
  savingsBanner: { 
    backgroundColor: 'rgba(34, 197, 94, 0.1)', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 15, 
    borderRadius: 20, 
    marginTop: 15, 
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)'
  },
  savingsText: { color: '#22C55E', fontSize: 14 },
  
  saveGoalBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  saveGoalText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});