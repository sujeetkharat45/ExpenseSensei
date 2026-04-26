import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';

export default function ErrorModal({ visible, title, message, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Ionicons name="close-circle" size={60} color="#F43F5E" />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.msg}>{message}</Text>
          <TouchableOpacity style={styles.btn} onPress={onConfirm}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', backgroundColor: COLORS.card, borderRadius: 20, padding: 25, alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  msg: { color: COLORS.subtext, textAlign: 'center', marginBottom: 20 },
  btn: { backgroundColor: '#F43F5E', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' }
});