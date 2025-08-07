import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LocationProvider } from './contexts/LocationContext';
import NotificationSystem from './components/NotificationSystem';
import AppContent from './screens/AppContent';

const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang kiểm tra đăng nhập...</Text>
    </View>
);

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const storedLogin = await AsyncStorage.getItem('isLoggedIn');
                const storedUser = await AsyncStorage.getItem('currentUser');
                const loginTime = await AsyncStorage.getItem('loginTime');

                if (storedLogin === 'true' && storedUser && loginTime) {
                    const now = new Date().getTime();
                    const loginTimestamp = parseInt(loginTime, 10);
                    const diff = now - loginTimestamp;
                    const minutes = Math.floor(diff / 60000);

                    if (minutes > 30) {
                        await AsyncStorage.clear();
                        setIsLoggedIn(false);
                        setCurrentUser(null);
                    } else {
                        setIsLoggedIn(true);
                        setCurrentUser(JSON.parse(storedUser));
                    }
                } else {
                    await AsyncStorage.clear();
                    setIsLoggedIn(false);
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                await AsyncStorage.clear();
                setIsLoggedIn(false);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkLoginStatus();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {loading ? (
                <LoadingScreen />
            ) : (
                <NotificationProvider>
                    <LocationProvider>
                        <AuthProvider value={{ isLoggedIn, setIsLoggedIn, currentUser, setCurrentUser }}>
                            <View style={styles.appContainer}>
                                <AppContent />
                                <NotificationSystem />
                            </View>
                        </AuthProvider>
                    </LocationProvider>
                </NotificationProvider>
            )}
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '500',
    },
});


export default App;
