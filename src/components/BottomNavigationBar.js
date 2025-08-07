import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../styles/colors';

export const BottomNavigationBar = ({ state, descriptors, navigation }) => {
    const tabItems = [
        {
            id: 'Listings',
            label: 'Danh sách',
            icon: 'home',
        },
        {
            id: 'MapPage',
            label: 'BĐ Quy Hoạch',
            icon: 'map',
        },
        {
            id: 'Favorites',
            label: 'Yêu Thích',
            icon: 'people',
        },
        {
            id: 'Profile',
            label: 'Cá nhân',
            icon: 'person',
        },
    ];

    return (
        <View style={styles.container}>
            {tabItems.map((item, index) => {
                const isFocused = state.index === index;
                const { options } = descriptors[state.routes[index].key];

                return (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.tabButton, isFocused && styles.tabButtonFocused]}
                        onPress={() => navigation.navigate(item.id)}
                    >
                        <Icon
                            name={item.icon}
                            size={24}
                            color={isFocused ? '#FF4800' : '#FFFFFF'}
                            style={styles.tabIcon}
                            onError={(error) => console.log(`Icon ${item.icon} failed to load:`, error)}
                        />
                        <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.secondary,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        elevation: 4,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    tabButtonFocused: {
        backgroundColor: 'rgba(24, 25, 27, 0.1)',

    },
    tabIcon: {
        marginBottom: 4,
    },
    tabLabel: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    tabLabelFocused: {
        color: '#FF4800',
        fontWeight: 'bold',
    },
});

export default BottomNavigationBar;