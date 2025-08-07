import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { colors } from '../styles/colors';
import { changePassword } from '../services/api';
import NotificationContext from '../contexts/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChangePasswordModal = ({ visible, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { showNotification } = useContext(NotificationContext);

    const handleSave = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới không khớp.');
            return;
        }
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken) {
                showNotification('Vui lòng đăng nhập lại.', 'error');
                return;
            }
            const response = await changePassword(oldPassword, newPassword, accessToken);
            if (response.status) {
                showNotification('Đổi mật khẩu thành công!', 'success');
                onClose();
            } else {
                throw new Error(response.msg || 'Đổi mật khẩu thất bại.');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Đổi mật khẩu</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu cũ"
                        secureTextEntry
                        value={oldPassword}
                        onChangeText={setOldPassword}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu mới"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Xác nhận mật khẩu mới"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                            <Text style={styles.buttonText}>Lưu</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    input: {
        backgroundColor: colors.inputBackground,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.error,
        marginRight: 8,
    },
    saveButton: {
        backgroundColor: colors.success,
        marginLeft: 8,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ChangePasswordModal;
