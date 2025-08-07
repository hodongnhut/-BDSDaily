import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert // Using Alert for simple confirmation, as per React Native common practice
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../styles/colors';

// Mock Notification Data
const initialNotifications = [
    {
        id: '1',
        title: 'Nhà Phố Mới Đăng Bán!',
        message: 'Có nhà phố hiện đại tại Quận 7 vừa được đăng bán với giá 7.5 Tỷ VNĐ. Đừng bỏ lỡ!',
        type: 'info', // info, success, warning, error
        timestamp: '2024-07-23 10:30 AM',
        read: false,
    },
    {
        id: '2',
        title: 'Cập Nhật Giá Căn Hộ',
        message: 'Giá căn hộ Midtown Quận 7 đã được điều chỉnh xuống còn 5.0 Tỷ VNĐ.',
        type: 'success',
        timestamp: '2024-07-22 03:15 PM',
        read: false,
    },
    {
        id: '3',
        title: 'Ưu Đãi Đặc Biệt!',
        message: 'Nhận ngay chiết khấu 5% khi mua đất nền Bình Chánh trong tuần này.',
        type: 'warning',
        timestamp: '2024-07-21 09:00 AM',
        read: true,
    },
    {
        id: '4',
        title: 'Hệ Thống Bảo Trì',
        message: 'Hệ thống sẽ tạm dừng hoạt động để bảo trì vào lúc 11:00 PM hôm nay.',
        type: 'error',
        timestamp: '2024-07-20 05:00 PM',
        read: true,
    },
    {
        id: '5',
        title: 'Lời Nhắc Xem Nhà',
        message: 'Bạn có lịch xem nhà biệt thự Thủ Đức vào 2:00 PM ngày mai.',
        type: 'info',
        timestamp: '2024-07-19 08:45 AM',
        read: false,
    },
    {
        id: '6',
        title: 'Tin Tức Thị Trường',
        message: 'Thị trường bất động sản quý 3 dự kiến sẽ có nhiều biến động tích cực.',
        type: 'info',
        timestamp: '2024-07-18 11:00 AM',
        read: true,
    },
];

// Helper to get icon name based on notification type
const getNotificationIcon = (type) => {
    switch (type) {
        case 'info':
            return 'information';
        case 'success':
            return 'check-circle';
        case 'warning':
            return 'alert';
        case 'error':
            return 'close-circle';
        default:
            return 'bell';
    }
};

// Helper to get color based on notification type
const getNotificationColor = (type) => {
    switch (type) {
        case 'info':
            return colors.info;
        case 'success':
            return colors.success;
        case 'warning':
            return colors.accent; // Using accent for warning
        case 'error':
            return '#DC3545'; // A distinct red for error
        default:
            return colors.textPrimary;
    }
};

const NotificationCard = ({ notification, onMarkAsRead }) => (
    <TouchableOpacity
        style={[
            styles.notificationCard,
            !notification.read && styles.unreadNotificationCard
        ]}
        onPress={() => onMarkAsRead(notification.id)}
    >
        <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(notification.type) }]}>
            <Icon name={getNotificationIcon(notification.type)} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationMessage}>{notification.message}</Text>
            <Text style={styles.notificationTimestamp}>{notification.timestamp}</Text>
        </View>
        {!notification.read && (
            <View style={styles.unreadDot} />
        )}
    </TouchableOpacity>
);

const NotificationPage = ({ onClose }) => {
    const [notifications, setNotifications] = useState(initialNotifications);

    const handleMarkAsRead = (id) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const handleMarkAllAsRead = () => {
        Alert.alert(
            "Đánh dấu tất cả đã đọc?",
            "Bạn có chắc chắn muốn đánh dấu tất cả thông báo là đã đọc?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý",
                    onPress: () => {
                        setNotifications(prevNotifications =>
                            prevNotifications.map(notif => ({ ...notif, read: true }))
                        );
                    }
                }
            ]
        );
    };

    const handleClearAllNotifications = () => {
        Alert.alert(
            "Xóa tất cả thông báo?",
            "Bạn có chắc chắn muốn xóa tất cả thông báo? Hành động này không thể hoàn tác.",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng ý",
                    onPress: () => {
                        setNotifications([]);
                    }
                }
            ]
        );
    };

    const unreadCount = notifications.filter(notif => !notif.read).length;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Icon name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thông Báo ({unreadCount > 0 ? unreadCount : '0'})</Text>
                <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerAction}>
                    <Text style={styles.headerActionText}>Đọc Tất Cả</Text>
                </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                    <Icon name="bell-off-outline" size={80} color={colors.textSecondary} />
                    <Text style={styles.emptyStateText}>Không có thông báo nào.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <NotificationCard notification={item} onMarkAsRead={handleMarkAsRead} />
                    )}
                    contentContainerStyle={styles.notificationList}
                />
            )}

            {notifications.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.clearAllButton} onPress={handleClearAllNotifications}>
                        <Text style={styles.clearAllButtonText}>Xóa Tất Cả Thông Báo</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F3F5',
    },
    header: {
        backgroundColor: colors.secondary,
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 3,
    },
    closeButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerAction: {
        padding: 5,
    },
    headerActionText: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    notificationList: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    unreadNotificationCard: {
        borderColor: colors.secondary,
        borderLeftWidth: 4,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 3,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 5,
    },
    notificationTimestamp: {
        fontSize: 12,
        color: '#777777',
        alignSelf: 'flex-end',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.accent,
        position: 'absolute',
        top: 15,
        right: 15,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 10,
    },
    footer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
    },
    clearAllButton: {
        backgroundColor: '#DC3545',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    clearAllButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
    },
});

export default NotificationPage;
