import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationContext = React.createContext(null);

export const LocationProvider = ({ children }) => {
    const [locationGranted, setLocationGranted] = useState(false);

    useEffect(() => {
        const checkLocationPermission = async () => {
            try {
                const storedPermission = await AsyncStorage.getItem('locationGranted');
                if (storedPermission === 'true') {
                    setLocationGranted(true);
                }
            } catch (error) {
                console.error('Error checking location permission:', error);
            }
        };
        checkLocationPermission();
    }, []);

    return (
        <LocationContext.Provider value={{ locationGranted, setLocationGranted }}>
            {children}
        </LocationContext.Provider>
    );
};

export default LocationContext;