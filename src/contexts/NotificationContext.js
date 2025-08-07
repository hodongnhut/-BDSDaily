import React, { useState, useRef } from 'react';

const NotificationContext = React.createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const notificationIdCounter = useRef(0);

    const showNotification = (message, type = 'info', duration = 3000) => {
        const id = notificationIdCounter.current++;
        const newNotification = { id, message, type };
        setNotifications(prev => [...prev, newNotification]);

        setTimeout(() => {
            removeNotification(id);
        }, duration);
    };

    const removeNotification = id => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;