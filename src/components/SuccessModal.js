import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';

export default function SuccessModal({ visible, title, message, onConfirm }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.secondary} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onConfirm}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: COLORS.card, borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  message: { color: COLORS.subtext, fontSize: 16, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 15, paddingHorizontal: 50, borderRadius: 15, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});