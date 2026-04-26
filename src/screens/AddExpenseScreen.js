import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { COLORS } from "../utils/colors";
import { AppContext } from "../Context/AppContext";
import SuccessModal from "../components/SuccessModal";

const OCR_API_KEY = "helloworld"; 

export default function AddExpenseScreen() {
  const { addTransaction, updateBudgetLimit } = useContext(AppContext);
  const navigation = useNavigation();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [merchant, setMerchant] = useState(""); // 🔥 State for Receipt Name
  const [note, setNote] = useState("");
  const [type, setType] = useState("expense");
  const [limitInput, setLimitInput] = useState("");

  const [image, setImage] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState({ title: "", msg: "", isOCR: false });

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === "granted" && libraryStatus === "granted";
  };

  const pickImage = async () => {
    const hasPerm = await requestPermissions();
    if (!hasPerm) return Alert.alert("Permission denied", "Gallery access required.");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const hasPerm = await requestPermissions();
    if (!hasPerm) return Alert.alert("Permission denied", "Camera access required.");
    let result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleOCR = async () => {
    if (!image) return Alert.alert("No Image", "Select a receipt first.");
    setOcrLoading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(image, { encoding: FileSystem.EncodingType.Base64 });
      const formData = new FormData();
      formData.append("base64Image", `data:image/jpg;base64,${base64}`);
      formData.append("apikey", OCR_API_KEY);
      formData.append("isTable", "true");
      formData.append("scale", "true");

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data?.ParsedResults?.length > 0) {
        const fullText = data.ParsedResults[0].ParsedText;
        const lowText = fullText.toLowerCase();
        const lines = fullText.split('\r\n');

        // 🔥 1. Extract Merchant Name: Usually the first line
        const detectedMerchant = lines[0].trim() || "Retail Store";
        setMerchant(detectedMerchant);

        // 2. Smart Amount Logic: Largest value
        const moneyRegex = /(\d+[\.,]\d{2})/g;
        const matches = fullText.match(moneyRegex);

        if (matches) {
          const numericValues = matches.map(val => parseFloat(val.replace(',', '.')));
          const grandTotal = Math.max(...numericValues.filter(v => v < 100000));
          setAmount(grandTotal.toFixed(2).toString());
        }

        // 3. Expanded Category Logic
        if (lowText.match(/dmart|retail|store|mart|shop|grocery|supermarket|mall/)) {
          setCategory("Shopping");
        } else if (lowText.match(/food|restaurant|cafe|hotel|swiggy|zomato|bake|kitchen/)) {
          setCategory("Dining");
        } else if (lowText.match(/fuel|petrol|diesel|gas|uber|ola|transport|garage/)) {
          setCategory("Transport");
        } else if (lowText.match(/medicine|pharmacy|health|clinic|hospital/)) {
          setCategory("Health");
        } else {
          setCategory("General");
        }

        setNote(`Scanned at ${new Date().toLocaleTimeString()}`);
        setSuccessData({ 
          title: "Data Extracted!", 
          msg: `Identified: ${detectedMerchant}. Verify fields and save. 🧠`,
          isOCR: true 
        });
        setShowSuccess(true);
      }
    } catch (err) {
      Alert.alert("OCR Error", "Could not process receipt.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSave = async () => {
    if (!amount) return Alert.alert("Error", "Amount is required.");

    const finalCategory = type === "income" ? "Income" : category || "Other";
    
    // 🔥 Pass the merchant name to your context
    const isSaved = await addTransaction(amount, finalCategory, merchant || note, type);

    if (isSaved) {
      if (type === "income" && limitInput) await updateBudgetLimit(Number(limitInput));
      
      setSuccessData({ 
        title: type === "income" ? "Income Added!" : "Expense Logged!", 
        msg: "Digital receipt generated and saved. 💰",
        isOCR: false 
      });
      setShowSuccess(true);

      setAmount("");
      setCategory("");
      setMerchant("");
      setNote("");
      setLimitInput("");
      setImage(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.title}>Add Transaction</Text>

          <View style={styles.ocrContainer}>
            <Text style={styles.label}>Scan Receipt</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.smallBtn} onPress={pickImage}><Text style={styles.btnText}>Gallery</Text></TouchableOpacity>
              <TouchableOpacity style={styles.smallBtn} onPress={takePhoto}><Text style={styles.btnText}>Camera</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, {backgroundColor: COLORS.primary}]} onPress={handleOCR} disabled={ocrLoading}>
                {ocrLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Extract</Text>}
              </TouchableOpacity>
            </View>
            {image && <Image source={{ uri: image }} style={styles.previewImage} />}
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity style={[styles.toggleBtn, type === "expense" && styles.activeExpense]} onPress={() => setType("expense")}><Text style={styles.toggleText}>Expense</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.toggleBtn, type === "income" && styles.activeIncome]} onPress={() => setType("income")}><Text style={styles.toggleText}>Income</Text></TouchableOpacity>
          </View>

          <Text style={styles.label}>Merchant / Receipt Name</Text>
          <TextInput style={styles.input} value={merchant} onChangeText={setMerchant} placeholder="e.g. D-Mart" placeholderTextColor="#777" />

          <Text style={styles.label}>Amount</Text>
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#777" />

          <Text style={styles.label}>Category</Text>
          <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Category" placeholderTextColor="#777" />

          {type === "income" && (
            <>
              <Text style={styles.label}>Set Spending Limit</Text>
              <TextInput style={styles.input} value={limitInput} onChangeText={setLimitInput} keyboardType="numeric" placeholder="Limit" placeholderTextColor="#777" />
            </>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Transaction</Text>
          </TouchableOpacity>
        </ScrollView>

        <SuccessModal 
          visible={showSuccess} 
          title={successData.title} 
          message={successData.msg} 
          onConfirm={() => {
            setShowSuccess(false);
            if (!successData.isOCR) {
              navigation.navigate("Home");
            }
          }} 
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20 },
  title: { color: COLORS.text, fontSize: 26, fontWeight: "bold", marginVertical: 15 },
  label: { color: COLORS.subtext, marginBottom: 8, fontSize: 14 },
  input: { backgroundColor: COLORS.card, padding: 15, borderRadius: 12, marginBottom: 20, color: "#fff" },
  ocrContainer: { marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 15 },
  row: { flexDirection: "row", gap: 8, marginBottom: 10 },
  smallBtn: { flex: 1, backgroundColor: "#444", padding: 12, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  previewImage: { width: '100%', height: 150, borderRadius: 10, marginTop: 5 },
  toggleContainer: { flexDirection: "row", marginBottom: 25 },
  toggleBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.card, marginHorizontal: 5, alignItems: "center" },
  activeExpense: { backgroundColor: COLORS.danger },
  activeIncome: { backgroundColor: COLORS.secondary },
  toggleText: { color: "#fff", fontWeight: "bold" },
  saveButton: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 15, alignItems: "center" },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});