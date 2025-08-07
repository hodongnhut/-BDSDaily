import AsyncStorage from '@react-native-async-storage/async-storage';

export const setLoginState = async (isLoggedIn, user) => {
    await AsyncStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false');
    if (user) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        await AsyncStorage.removeItem('currentUser');
    }
};

export const getLoginState = async () => {
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn') === 'true';
    const user = await AsyncStorage.getItem('currentUser');
    return { isLoggedIn, user: user ? JSON.parse(user) : null };
};

export const setLocationPermission = async (granted) => {
    await AsyncStorage.setItem('locationGranted', granted ? 'true' : 'false');
};

export const getLocationPermission = async () => {
    return (await AsyncStorage.getItem('locationGranted')) === 'true';
};

export const saveLead = async (townhouseId, leadData) => {
    await AsyncStorage.setItem(`lead_${townhouseId}`, JSON.stringify(leadData));
};