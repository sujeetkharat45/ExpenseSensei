import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet, ActivityIndicator, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../Context/AuthContext";
import { COLORS } from "../utils/colors";

import DashboardScreen from "../screens/DashboardScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import TransactionsScreen from "../screens/TransactionScreen";
import ChatbotScreen from "../screens/ChatBotScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import OTPScreen from "../screens/Auth/OTPScreen"; // ✅ NEW
import GoalTrackerScreen from "../screens/GoalTrackerScreen";
import InsightsScreen from "../screens/InsightScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade_from_bottom" }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
    </Stack.Navigator>
  );
}

// 🔥 Symmetrical 4-Tab Layout with Central Add Button
function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: styles.tabBar }}>
      <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarIcon: ({ focused }) => (
        <View style={styles.iconContainer}>
          <Ionicons name={focused ? "home" : "home-outline"} size={24} color={focused ? COLORS.primary : "#94A3B8"} />
          {focused && <View style={styles.activeDot} />}
        </View>
      )}} />

      <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ tabBarIcon: ({ focused }) => (
        <View style={styles.iconContainer}>
          <Ionicons name={focused ? "receipt" : "receipt-outline"} size={24} color={focused ? COLORS.primary : "#94A3B8"} />
          {focused && <View style={styles.activeDot} />}
        </View>
      )}} />

      <Tab.Screen name="Add" component={AddExpenseScreen} options={{ tabBarIcon: () => (
        <LinearGradient colors={[COLORS.primary, "#4F46E5"]} style={styles.fab}>
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      )}} />

      <Tab.Screen name="AI" component={ChatbotScreen} options={{ tabBarIcon: ({ focused }) => (
        <View style={styles.iconContainer}>
          <Ionicons name={focused ? "sparkles" : "sparkles-outline"} size={24} color={focused ? COLORS.primary : "#94A3B8"} />
          {focused && <View style={styles.activeDot} />}
        </View>
      )}} />

      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ focused }) => (
        <View style={styles.iconContainer}>
          <Ionicons name={focused ? "person" : "person-outline"} size={24} color={focused ? COLORS.primary : "#94A3B8"} />
          {focused && <View style={styles.activeDot} />}
        </View>
      )}} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoggedIn, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>ExpenseSensei 🤖</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="App" component={TabNavigator} />
            <Stack.Screen name="GoalTracker" component={GoalTrackerScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Insights" component={InsightsScreen} options={{ animation: 'slide_from_bottom' }} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: "rgba(20, 20, 20, 0.95)",
    borderRadius: 30,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    paddingBottom: 0,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    top: 5
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
    marginTop: 4
  },
  fab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: "center",
    alignItems: "center",
    top: -20,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background
  },
  loadingText: {
    color: "#fff",
    marginTop: 15,
    fontSize: 18,
    fontWeight: "bold"
  },
});