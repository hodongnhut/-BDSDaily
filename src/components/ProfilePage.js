// src/components/ProfilePage.js
import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../contexts/AuthContext';
import NotificationContext from '../contexts/NotificationContext';
import { colors } from '../styles/colors';
import ChangePasswordModal from './ChangePasswordModal';
import EditProfileModal from './EditProfileModal';

const ProfilePage = ({ navigation }) => {
    const { currentUser, setIsLoggedIn } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [isChangePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
    const [isEditProfileModalVisible, setEditProfileModalVisible] = useState(false);

    const handleChangePassword = () => {
        setChangePasswordModalVisible(true);
    };

    const handleEditProfile = () => {
        setEditProfileModalVisible(true);
    };

    const handleListingFavorites = () => {
        navigation.navigate('Favorites');
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            setIsLoggedIn(false);
            showNotification('👋 Đã đăng xuất.', 'success');
        } catch (error) {
            console.error('Error during logout:', error);
            showNotification('Lỗi khi đăng xuất!', 'error');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thông tin Cá nhân</Text>
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <Text style={styles.username}>{currentUser?.username || 'Người dùng'}</Text>
                <Text style={styles.role}>Nhân viên kinh doanh bất động sản</Text>
            </View>
            <View style={styles.settingsCard}>
                <Text style={styles.sectionTitle}>Cài đặt tài khoản</Text>
                <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
                    <Text style={styles.settingText}>Đổi mật khẩu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
                    <Text style={styles.settingText}>Chỉnh sửa hồ sơ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem} onPress={handleListingFavorites}>
                    <Text style={styles.settingText}>Yêu Thích</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.aboutCard}>
                <Text style={styles.sectionTitle}>Về ứng dụng</Text>
                <Text style={styles.aboutText}>Phiên bản: 1.0.0</Text>
                <Text style={styles.aboutText}>Phát triển bởi: StoneNetwork</Text>
            </View>
            <ChangePasswordModal
                visible={isChangePasswordModalVisible}
                onClose={() => setChangePasswordModalVisible(false)}
            />
            <EditProfileModal
                visible={isEditProfileModalVisible}
                onClose={() => setEditProfileModalVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: colors.white,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textDark,
        textAlign: 'center',
        marginBottom: 16,
    },
    profileCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.info,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: colors.white,
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 4,
    },
    role: {
        fontSize: 14,
        color: colors.textLight,
    },
    settingsCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 12,
    },
    settingItem: {
        backgroundColor: colors.inputBackground,
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    settingText: {
        fontSize: 16,
        color: colors.textMedium,
    },
    logoutButton: {
        backgroundColor: colors.error,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    aboutCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    aboutText: {
        fontSize: 14,
        color: colors.textMedium,
        marginBottom: 4,
    },
});

export default ProfilePage;
