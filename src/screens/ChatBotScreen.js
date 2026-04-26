import React, { useState, useRef, useEffect, useContext } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/colors";
import { AppContext } from "../Context/AppContext";

export default function ChatbotScreen() {
  const { balance, expense, income, transactions } = useContext(AppContext);
  const [messages, setMessages] = useState([
    { id: "1", text: "Welcome to ExpenseSensei! How can I help with your finances today? 🤖", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const flatListRef = useRef(null);

  const suggestions = ["What's my balance?", "Total Expenses", "Latest Entry", "Saving Tips"];

  const getBotReply = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes("balance")) return `Your current balance is ₹${balance}. 💰`;
    if (text.includes("expense") || text.includes("spend")) return `Total expenses so far: ₹${expense}. 📉`;
    if (text.includes("entry") || text.includes("last")) {
      return transactions.length > 0 
        ? `Last: ₹${transactions[0].amount} for ${transactions[0].category}.` 
        : "No transactions found!";
    }
    return "I can track your balance, expenses, and suggest savings tips! Try asking 'What is my balance?'";
  };

  const handleSend = (userText) => {
    if (!userText.trim()) return;
    const newMsg = { id: Date.now().toString(), text: userText, sender: "user" };
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    setTimeout(() => {
      const botMsg = { id: (Date.now()+1).toString(), text: getBotReply(userText), sender: "bot" };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chatHeader}>
        <Ionicons name="robot-outline" size={24} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Finance Assistant</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        onContentSizeChange={() => flatListRef.current.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === "user" ? styles.userBubble : styles.botBubble]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionRow}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={i} style={styles.suggestBtn} onPress={() => handleSend(s)}>
              <Text style={styles.suggestText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend(input)}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  chatHeader: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 12 },
  bubble: { padding: 15, borderRadius: 20, marginBottom: 15, maxWidth: "85%" },
  userBubble: { backgroundColor: COLORS.primary, alignSelf: "flex-end", borderBottomRightRadius: 2 },
  botBubble: { backgroundColor: COLORS.card, alignSelf: "flex-start", borderBottomLeftRadius: 2 },
  bubbleText: { color: "#fff", fontSize: 15, lineHeight: 22 },
  footer: { padding: 15, backgroundColor: "rgba(0,0,0,0.3)" },
  suggestionRow: { marginBottom: 15 },
  suggestBtn: { backgroundColor: "rgba(124, 58, 237, 0.1)", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: "rgba(124, 58, 237, 0.3)" },
  suggestText: { color: COLORS.primary, fontSize: 12, fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: { flex: 1, backgroundColor: COLORS.card, borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, color: "#fff" },
  sendBtn: { backgroundColor: COLORS.primary, width: 45, height: 45, borderRadius: 22.5, justifyContent: "center", alignItems: "center" }
});