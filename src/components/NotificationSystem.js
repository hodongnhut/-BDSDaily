import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import NotificationContext from '../contexts/NotificationContext';
import { colors } from '../styles/colors';

const NotificationSystem = () => {
    const { notifications, removeNotification } = useContext(NotificationContext);

    return (
        <View style={styles.container}>
            {notifications.map(notification => (
                <Animatable.View
                    key={notification.id}
                    animation="fadeInUp"
                    duration={500}
                    style={[
                        styles.notification,
                        {
                            backgroundColor:
                                notification.type === 'success' ? colors.success :
                                    notification.type === 'error' ? colors.error :
                                        colors.info,
                        },
                    ]}
                >
                    <Text style={styles.notificationText}>{notification.message}</Text>
                    <TouchableOpacity
                        onPress={() => removeNotification(notification.id)}
                        style={styles.closeButton}
                    >
                        <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>
                </Animatable.View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    notification: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    notificationText: {
        color: colors.white,
        fontSize: 16,
        flex: 1,
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default NotificationSystem;