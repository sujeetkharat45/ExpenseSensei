import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Modal,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/colors";
import { AuthContext } from "../Context/AuthContext";
import { AppContext } from "../Context/AppContext";
import { authService } from "../services/api";

export default function ProfileScreen() {
  const { logout, user } = useContext(AuthContext);
  const { transactions } = useContext(AppContext);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 🔥 State for Beautiful Modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordUpdate = () => {
    Alert.alert("Security", "Redirecting to secure password reset flow...");
  };

  // 🔥 CUSTOM DELETE LOGIC
  const confirmDeletion = async () => {
    setIsDeleting(true);
    try {
      const res = await authService.deleteAccount();
      if (res.success) {
        setDeleteModalVisible(false);
        Alert.alert("Account Deleted", "All your data has been purged.");
        logout();
      }
    } catch (err) {
      Alert.alert("Error", "Could not complete deletion. Try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  const MenuItem = ({ icon, title, color = "#fff", onPress, rightElement }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.menuText}>{title}</Text>
      </View>
      {rightElement ? rightElement : <Ionicons name="chevron-forward" size={18} color="#555" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        <View style={styles.header}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || "Buddy"}</Text>
          <Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
          <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
            <Text style={{ color: COLORS.subtext, fontSize: 13 }}>{user?.gender || "Gender"}</Text>
            <Text style={{ color: COLORS.subtext, fontSize: 13, marginHorizontal: 8 }}>•</Text>
            <Text style={{ color: COLORS.subtext, fontSize: 13 }}>{user?.mobile || "Mobile"}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statVal}>PRO</Text>
            <Text style={styles.statLabel}>Plan</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>Active</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Preferences</Text>

          <MenuItem
            icon="shield-checkmark-outline"
            title="Update Password"
            color="#22C55E"
            onPress={handlePasswordUpdate}
          />

          <MenuItem
            icon="color-palette-outline"
            title="Dark Mode"
            color="#06B6D4"
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: "#3e3e3e", true: COLORS.primary + "80" }}
                thumbColor={isDarkMode ? COLORS.primary : "#f4f3f4"}
              />
            }
          />

          {/* 🔥 Trigger Custom Modal */}
          <MenuItem
            icon="trash-outline"
            title="Delete Account"
            color="#F43F5E"
            onPress={() => setDeleteModalVisible(true)}
          />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#F43F5E" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>ExpenseSensei v1.0.5</Text>

        {/* 🔥 BEAUTIFUL CUSTOM MODAL */}
        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.warningIconBox}>
                <Ionicons name="warning" size={40} color="#F43F5E" />
              </View>

              <Text style={styles.modalTitle}>Extreme Caution!</Text>
              <Text style={styles.modalSub}>
                Deleting your account will wipe all <Text style={styles.bold}>Transactions</Text>,
                <Text style={styles.bold}> Goals</Text>, and profile data forever. This cannot be undone.
              </Text>

              <TouchableOpacity
                style={[styles.confirmDeleteBtn, isDeleting && { opacity: 0.7 }]}
                onPress={confirmDeletion}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmBtnText}>Yes, Delete Everything</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelBtnText}>Keep My Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: "center", marginTop: 20, marginBottom: 30 },
  profileCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 15,
  },
  profileInitial: { color: "#fff", fontSize: 40, fontWeight: "bold" },
  userName: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  userEmail: { color: COLORS.subtext, fontSize: 14, marginTop: 5 },
  statsRow: { flexDirection: "row", backgroundColor: COLORS.card, marginHorizontal: 20, paddingVertical: 20, borderRadius: 20, marginBottom: 30 },
  statBox: { flex: 1, alignItems: "center" },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  statVal: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  statLabel: { color: COLORS.subtext, fontSize: 12, marginTop: 4 },
  section: { marginHorizontal: 20, marginBottom: 25 },
  sectionTitle: { color: COLORS.subtext, fontSize: 13, fontWeight: "bold", textTransform: "uppercase", marginBottom: 15, marginLeft: 5 },
  menuItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", padding: 15, borderRadius: 15, marginBottom: 10 },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 15 },
  menuText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(244, 63, 94, 0.1)", marginHorizontal: 20, padding: 18, borderRadius: 15, marginTop: 10, borderWidth: 1, borderColor: "rgba(244, 63, 94, 0.2)" },
  logoutText: { color: "#F43F5E", fontSize: 16, fontWeight: "bold", marginLeft: 10 },
  versionText: { color: "#444", textAlign: "center", marginTop: 30, fontSize: 12 },

  // 🔥 CUSTOM MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)'
  },
  warningIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  modalSub: { color: COLORS.subtext, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  bold: { color: '#fff', fontWeight: 'bold' },
  confirmDeleteBtn: {
    width: '100%',
    backgroundColor: '#F43F5E',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10
  },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { width: '100%', padding: 15, alignItems: 'center' },
  cancelBtnText: { color: COLORS.subtext, fontWeight: '600', fontSize: 14 }
});