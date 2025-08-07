import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { colors } from '../styles/colors';
import { updateProfile } from '../services/api';
import NotificationContext from '../contexts/NotificationContext';
import AuthContext from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileModal = ({ visible, onClose }) => {
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.username || '');
        }
    }, [currentUser]);

    const handleSave = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken) {
                showNotification('Vui lòng đăng nhập lại.', 'error');
                return;
            }
            const response = await updateProfile({ username }, accessToken);
            if (response.status) {
                showNotification('Cập nhật hồ sơ thành công!', 'success');
                setCurrentUser({ ...currentUser, username });
                onClose();
            } else {
                throw new Error(response.msg || 'Cập nhật hồ sơ thất bại.');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Tên người dùng"
                        value={username}
                        onChangeText={setUsername}
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

export default EditProfileModal;
