import React, { useState, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/colors";
import { AppContext } from "../Context/AppContext";

const { width } = Dimensions.get("window");

export default function TransactionScreen() {
  const { transactions } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("History");
  const [viewReceipt, setViewReceipt] = useState(null);

  // Filter only expenses for the receipt tab
  const receiptData = transactions.filter(t => t.type === 'expense');

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={[styles.iconBox, { backgroundColor: item.type === 'income' ? COLORS.secondary + '20' : COLORS.danger + '20' }]}>
        <Ionicons 
          name={item.type === 'income' ? "arrow-up" : "arrow-down"} 
          size={20} 
          color={item.type === 'income' ? COLORS.secondary : COLORS.danger} 
        />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.txnCategory}>{item.category}</Text>
        <Text style={styles.txnDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <Text style={[styles.txnAmount, { color: item.type === 'income' ? COLORS.secondary : COLORS.danger }]}>
        {item.type === 'income' ? "+" : "-"}₹{item.amount}
      </Text>
    </View>
  );

  const renderReceiptCard = ({ item }) => (
    <TouchableOpacity style={styles.receiptCard} onPress={() => setViewReceipt(item)}>
      <View style={styles.receiptHeader}>
        <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
        <Text style={styles.receiptTitle} numberOfLines={1}>{item.note || "Digital Receipt"}</Text>
      </View>
      <Text style={styles.receiptAmount}>₹{item.amount}</Text>
      <Text style={styles.receiptDate}>{new Date(item.date).toDateString()}</Text>
      <View style={styles.receiptBadge}>
        <Text style={styles.badgeText}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Tab Switcher --- */}
      <View style={styles.tabContainer}>
        {["History", "Receipts"].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]} 
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- Conditional Rendering with Dynamic Keys to fix numColumns Error --- */}
      {activeTab === "History" ? (
        <FlatList 
          key="history-list" // 🔥 Forces fresh render for 1-column
          data={transactions} 
          renderItem={renderHistoryItem} 
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 20 }}
          numColumns={1}
        />
      ) : (
        <FlatList 
          key="receipt-grid" // 🔥 Forces fresh render for 2-columns
          data={receiptData} 
          renderItem={renderReceiptCard} 
          numColumns={2}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 10 }}
        />
      )}

      {/* --- Digital Receipt Detail Modal --- */}
      <Modal visible={!!viewReceipt} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.receiptDetailsCard}>
            <View style={styles.notch} />
            <Text style={styles.detailMerchant}>{viewReceipt?.note || "Receipt Detail"}</Text>
            <Text style={styles.detailDate}>{new Date(viewReceipt?.date).toLocaleString()}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailVal}>{viewReceipt?.category}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Record Type</Text>
              <Text style={styles.detailVal}>Smart OCR Scan</Text>
            </View>

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.totalVal}>₹{viewReceipt?.amount}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setViewReceipt(null)}>
              <Text style={styles.closeBtnText}>Close Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.card, 
    margin: 20, 
    borderRadius: 15, 
    padding: 5 
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.subtext, fontWeight: 'bold' },
  activeTabText: { color: '#fff' },
  
  // History Styles
  historyCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 12 
  },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txnCategory: { color: '#fff', fontSize: 16, fontWeight: '600' },
  txnDate: { color: COLORS.subtext, fontSize: 12 },
  txnAmount: { fontSize: 16, fontWeight: 'bold' },

  // Receipt Grid Styles
  receiptCard: { 
    width: (width - 40) / 2, 
    margin: 5, 
    backgroundColor: COLORS.card, 
    borderRadius: 15, 
    padding: 15, 
    borderLeftWidth: 4, 
    borderLeftColor: COLORS.primary 
  },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  receiptTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginLeft: 5, flex: 1 },
  receiptAmount: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginVertical: 5 },
  receiptDate: { color: COLORS.subtext, fontSize: 10 },
  receiptBadge: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 5, 
    marginTop: 10 
  },
  badgeText: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold' },

  // Modal Styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  receiptDetailsCard: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 30, 
    alignItems: 'center' 
  },
  notch: { width: 40, height: 5, backgroundColor: '#ddd', borderRadius: 10, marginBottom: 20 },
  detailMerchant: { color: '#000', fontSize: 22, fontWeight: 'bold' },
  detailDate: { color: '#666', fontSize: 12, marginBottom: 20 },
  divider: { width: '100%', height: 1, backgroundColor: '#eee', marginVertical: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
  detailLabel: { color: '#888', fontSize: 14 },
  detailVal: { color: '#000', fontWeight: '600' },
  totalSection: { 
    backgroundColor: '#f8f8f8', 
    width: '100%', 
    padding: 20, 
    borderRadius: 15, 
    marginTop: 10, 
    alignItems: 'center' 
  },
  totalLabel: { color: '#888', fontSize: 12, fontWeight: 'bold' },
  totalVal: { color: COLORS.primary, fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  closeBtn: { 
    marginTop: 30, 
    backgroundColor: '#000', 
    width: '100%', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center' 
  },
  closeBtnText: { color: '#fff', fontWeight: 'bold' }
});