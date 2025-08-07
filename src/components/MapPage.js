import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../styles/colors';

const MapPage = () => {
    return (
        <WebView source={{ uri: 'https://kinglandgroup.vn/mobile-map' }} style={{ flex: 1 }} />
    );
};

const styles = StyleSheet.create({
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
        zIndex: 1000,
        flex: 1,
        alignItems: 'flex-end'
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.textMedium,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: colors.buttonPrimary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MapPage;