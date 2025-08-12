import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';
import LocationContext from '../contexts/LocationContext';
import NotificationContext from '../contexts/NotificationContext';
import { saveLocation } from '../services/api';
import { colors } from '../styles/colors';

const LocationPermissionPage = () => {
    const { setLocationGranted } = useContext(LocationContext);
    const { showNotification } = useContext(NotificationContext);
    const navigation = useNavigation();
    const [permissionStatus, setPermissionStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkPermission = async () => {
            const permission = Platform.OS === 'ios'
                ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

            const status = await check(permission);
            setPermissionStatus(status);

            if (status === RESULTS.GRANTED) {
                handleLocationFetch();
            }
        };
        checkPermission();
    }, []);

    const handleLocationFetch = async () => {
        setIsLoading(true);
        try {
            const sessionId = await AsyncStorage.getItem('accessToken');
            if (!sessionId) {
                throw new Error('Không tìm thấy access token.');
            }
            Geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const message = await saveLocation(latitude, longitude, sessionId);
                        setLocationGranted(true);
                        await AsyncStorage.setItem('locationGranted', 'true');
                        showNotification(message, 'success');
                        navigation.navigate('Main');
                    } catch (error) {
                        showNotification(error.message, 'error');
                        setIsLoading(false);
                    }
                },
                (error) => {
                    showNotification('Không thể lấy vị trí. Vui lòng thử lại.', 'error');
                    setIsLoading(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } catch (error) {
            showNotification('Đã xảy ra lỗi khi lấy vị trí hoặc access token.', 'error');
            setIsLoading(false);
        }
    };

    const handleGrantLocation = async () => {
        setIsLoading(true);
        try {
            const permission = Platform.OS === 'ios'
                ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

            const status = await request(permission);
            setPermissionStatus(status);

            if (status === RESULTS.GRANTED) {
                handleLocationFetch();
            } else {
                showNotification('Quyền vị trí bị từ chối! Vui lòng cấp quyền để tiếp tục.', 'error');
                setIsLoading(false);
            }
        } catch (error) {
            showNotification('Đã xảy ra lỗi khi yêu cầu quyền vị trí.', 'error');
            setIsLoading(false);
        }
    };
    const handleSkip = () => {
        setLocationGranted(true);
        navigation.navigate('Main');
    };
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Cần quyền truy cập vị trí</Text>
                <Text style={styles.text}>
                    Để hiển thị các căn nhà phố phù hợp nhất với bạn, ứng dụng cần quyền truy cập vị trí của bạn.
                </Text>
                <TouchableOpacity
                    style={[styles.button, permissionStatus === RESULTS.GRANTED && !isLoading ? styles.buttonDisabled : null]}
                    onPress={handleGrantLocation}
                    disabled={permissionStatus === RESULTS.GRANTED && !isLoading}
                >
                    <Text style={styles.buttonText}>
                        {permissionStatus === RESULTS.GRANTED && !isLoading ? 'Quyền vị trí đã được cấp' : 'Cấp quyền vị trí'}
                    </Text>
                </TouchableOpacity>
                {isLoading && (
                    <Text style={styles.loadingText}>Đang xử lý...</Text>
                )}
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Bỏ qua</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        padding: 20,
    },
    card: {
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 16,
    },
    text: {
        fontSize: 16,
        color: colors.textMedium,
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: colors.buttonPrimary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: colors.buttonDisabled || '#cccccc',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    loadingText: {
        fontSize: 14,
        color: colors.textMedium,
        marginTop: 10,
        textAlign: 'center',
    },
    loading: {
        marginTop: 10,
    },
    skipButton: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipText: {
        color: colors.buttonPrimary,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default LocationPermissionPage;