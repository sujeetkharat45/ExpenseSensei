import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/colors";
import { AppContext } from "../Context/AppContext";
import { AuthContext } from "../Context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const { balance, expense, income, limit, savings, activeGoal } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const percent = limit ? Math.min((expense / limit) * 100, 100) : 0;
  const goalPercent = activeGoal ? Math.min((activeGoal.current / activeGoal.target) * 100, 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>

        {/* Header & Balance Card */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back,</Text>
            <Text style={styles.userName}>{user?.name || "Buddy"} ✨</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate("Profile")}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient colors={["#1e1e1e", "#2d2d2d"]} style={styles.visaCard}>
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>Current Balance</Text>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
          </View>
          <Text style={styles.balanceBig}>₹{balance.toLocaleString()}</Text>
          <View style={styles.cardBottom}>
            <Text style={styles.cardNum}>**** **** **** 2026</Text>
            <View style={styles.cardCircles}>
              <View style={[styles.circle, { backgroundColor: "#7C3AED" }]} />
              <View style={[styles.circle, { backgroundColor: "#4F46E5", marginLeft: -10 }]} />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statLabel}>Income</Text><Text style={[styles.statAmt, { color: '#22C55E' }]}>₹{income}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>Expense</Text><Text style={[styles.statAmt, { color: '#F43F5E' }]}>₹{expense}</Text></View>
          <View style={[styles.statBox, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}><Text style={styles.statLabel}>Saved</Text><Text style={[styles.statAmt, { color: COLORS.primary }]}>₹{savings || 0}</Text></View>
        </View>

        {/* Savings Goals Section */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Savings Goals 🚀</Text>
          <TouchableOpacity onPress={() => navigation.navigate("GoalTracker")}>
            <Text style={styles.sectionLink}>{activeGoal ? "Edit" : "Plan New"}</Text>
          </TouchableOpacity>
        </View>

        {activeGoal ? (
          <View style={styles.activeGoalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalNameText}>{activeGoal.title} 🎯</Text>
              <Text style={styles.goalValueText}>₹{activeGoal.current} / ₹{activeGoal.target}</Text>
            </View>
            <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${goalPercent}%` }]} /></View>
            <Text style={styles.goalFooter}>Next Reverse EMI: ₹{activeGoal.installment} due soon</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.goalCard} onPress={() => navigation.navigate("GoalTracker")}>
            <LinearGradient colors={["rgba(34, 197, 94, 0.12)", "rgba(34, 197, 94, 0.05)"]} style={styles.goalGradient}>
              <View style={styles.goalIconBox}><Ionicons name="rocket-outline" size={24} color="#22C55E" /></View>
              <View style={styles.goalInfo}><Text style={styles.goalTitle}>Goal Planning</Text><Text style={styles.goalSub}>Tap to calculate your Reverse EMI</Text></View>
              <Ionicons name="chevron-forward" size={18} color="#555" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Budget Tracker Section */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Budget Tracker</Text>
          <Text style={[styles.sectionLink, { color: expense > limit ? "#F43F5E" : COLORS.secondary }]}>{percent.toFixed(0)}% Used</Text>
        </View>
        <View style={styles.glassContainer}>
          <View style={styles.budgetInfo}>
            <Text style={styles.budgetText}>Limit: ₹{limit}</Text>
            <Text style={styles.budgetText}>Cycle: 30 Days</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: expense > limit ? "#F43F5E" : COLORS.primary }]} />
          </View>
        </View>

        {/* Financial Analysis Section - Fixed Layout */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Financial Analysis</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Insights")}>
            <Text style={styles.sectionLink}>Full Report 📊</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.insightCard} onPress={() => navigation.navigate("Insights")}>
          <View style={styles.insightContent}>
            <View style={styles.insightIconBox}>
              <Ionicons name="analytics" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.insightMain}>Spending Intelligence</Text>
              <Text style={styles.insightSub}>Review daily velocity and top leaks</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>

      </ScrollView>
      {/* Redundant FAB removed to fix Navigation overlap */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 120 }, // Ensures space for the bottom tab bar
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 },
  welcomeText: { color: COLORS.subtext, fontSize: 13 },
  userName: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  avatarContainer: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.card, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  avatarText: { color: COLORS.primary, fontWeight: "bold", fontSize: 16 },
  visaCard: { marginHorizontal: 20, padding: 25, borderRadius: 25, height: 180, justifyContent: "space-between", elevation: 10 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  balanceBig: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardNum: { color: "rgba(255,255,255,0.3)", fontSize: 16, letterSpacing: 2 },
  cardCircles: { flexDirection: "row" },
  circle: { width: 24, height: 24, borderRadius: 12, opacity: 0.8 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 20 },
  statBox: { flex: 1, backgroundColor: COLORS.card, padding: 12, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statLabel: { color: COLORS.subtext, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  statAmt: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 28, marginBottom: 15 },
  sectionTitle: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  sectionLink: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
  activeGoalCard: { backgroundColor: COLORS.card, marginHorizontal: 20, padding: 20, borderRadius: 25, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)' },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  goalNameText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  goalValueText: { color: COLORS.secondary, fontSize: 14, fontWeight: 'bold' },
  progressBarBg: { height: 10, backgroundColor: '#121212', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.secondary, borderRadius: 5 },
  goalFooter: { color: COLORS.subtext, fontSize: 11, marginTop: 10, fontStyle: 'italic' },
  goalCard: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)' },
  goalGradient: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  goalIconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(34, 197, 94, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  goalInfo: { flex: 1 },
  goalTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  goalSub: { color: COLORS.subtext, fontSize: 12, marginTop: 2 },
  glassContainer: { backgroundColor: COLORS.card, marginHorizontal: 20, padding: 20, borderRadius: 20 },
  budgetInfo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  budgetText: { color: COLORS.subtext, fontSize: 12 },
  progressTrack: { height: 8, backgroundColor: "#121212", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  
  // 🔥 INSIGHT CARD FIXED STYLES
  insightCard: { 
    backgroundColor: COLORS.card, 
    marginHorizontal: 20, 
    padding: 20, 
    borderRadius: 25, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20 
  },
  insightContent: { flexDirection: 'row', alignItems: 'center' },
  insightIconBox: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    backgroundColor: 'rgba(124, 58, 237, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  insightMain: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  insightSub: { color: COLORS.subtext, fontSize: 12, marginTop: 2 }
});