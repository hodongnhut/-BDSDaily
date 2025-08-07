// src/components/ContactSalesModal.js
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/colors';

const ContactSalesModal = ({ townhouse, onClose, showNotification }) => {
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');

    const handleSubmit = async () => {
        if (!clientName || !clientPhone) {
            showNotification('Vui lòng nhập tên và số điện thoại!', 'error');
            return;
        }
        const leadData = {
            id: `L${Date.now()}`,
            name: clientName,
            phone: clientPhone,
            email: clientEmail,
            propertyInterest: townhouse.title,
            status: 'Mới',
            date: new Date().toISOString().split('T')[0],
        };
        try {
            const existingLeads = await AsyncStorage.getItem('leads');
            const leads = existingLeads ? JSON.parse(existingLeads) : [];
            leads.push(leadData);
            await AsyncStorage.setItem('leads', JSON.stringify(leads));
            showNotification(`Đã ghi nhận lead cho ${townhouse.title} từ ${clientName}!`, 'success');
            onClose();
        } catch (error) {
            console.error('Error saving lead:', error);
            showNotification('Lỗi khi lưu thông tin lead!', 'error');
        }
    };

    return (
        <Modal visible={!!townhouse} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Liên hệ tư vấn cho: {townhouse.title}</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Tên khách hàng</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập tên khách hàng"
                            value={clientName}
                            onChangeText={setClientName}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Số điện thoại</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập số điện thoại"
                            value={clientPhone}
                            onChangeText={setClientPhone}
                            keyboardType="phone-pad"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email (Tùy chọn)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập email"
                            value={clientEmail}
                            onChangeText={setClientEmail}
                            keyboardType="email-address"
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Gửi Lead</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textMedium,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.inputBackground,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        backgroundColor: colors.buttonCancel,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginRight: 8,
    },
    submitButton: {
        backgroundColor: colors.buttonContact,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ContactSalesModal;