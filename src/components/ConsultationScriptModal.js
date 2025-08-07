// src/components/ConsultationScriptModal.js
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../styles/colors';

const ConsultationScriptModal = ({ townhouse, onClose, showNotification }) => {
    const [script, setScript] = useState('');
    const [isLoadingScript, setIsLoadingScript] = useState(false);

    useEffect(() => {
        const fetchScript = async () => {
            setIsLoadingScript(true);
            setScript('');
            try {
                // Mock script since Gemini API key is empty
                const mockScript = `
- Chào khách hàng, giới thiệu bản thân và mục đích cuộc gọi.
- Nhấn mạnh vị trí đắc địa của ${townhouse.title} tại ${townhouse.address}.
- Đề cập đến diện tích ${townhouse.area}, phù hợp cho ${townhouse.excerpt}.
- Nêu bật tiện ích xung quanh: ${townhouse.amenities}.
- Đề xuất giá ${townhouse.price} là cơ hội đầu tư tốt.
- Mời khách hàng tham quan thực tế và đặt lịch hẹn.
- Hỏi về nhu cầu cụ thể để cá nhân hóa tư vấn.`;
                setScript(mockScript);
            } catch (error) {
                console.error('Error fetching consultation script:', error);
                setScript('Đã xảy ra lỗi khi lấy kịch bản tư vấn.');
                showNotification('Lỗi khi lấy kịch bản tư vấn!', 'error');
            } finally {
                setIsLoadingScript(false);
            }
        };
        fetchScript();
    }, [townhouse, showNotification]);

    return (
        <Modal visible={!!townhouse} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Kịch bản tư vấn cho: {townhouse.title}</Text>
                    {isLoadingScript ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.buttonPrimary} />
                            <Text style={styles.loadingText}>Đang tải kịch bản...</Text>
                        </View>
                    ) : (
                        <ScrollView style={styles.scriptContainer}>
                            {script.split('\n').map((item, index) => (
                                <Text key={index} style={styles.scriptText}>{item}</Text>
                            ))}
                        </ScrollView>
                    )}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.buttonText}>Đóng</Text>
                    </TouchableOpacity>
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
    scriptContainer: {
        maxHeight: 320,
        marginBottom: 16,
    },
    scriptText: {
        fontSize: 16,
        color: colors.textMedium,
        marginBottom: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
    },
    loadingText: {
        fontSize: 16,
        color: colors.textMedium,
        marginLeft: 12,
    },
    closeButton: {
        backgroundColor: colors.buttonPrimary,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ConsultationScriptModal;