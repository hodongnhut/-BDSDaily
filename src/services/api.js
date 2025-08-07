
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (username, password) => {
    try {
        const response = await fetch('https://app.bdsdaily.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.status) {
            return data.data;
        } else {
            throw new Error(data.msg || 'Đăng nhập thất bại!');
        }
    } catch (error) {
        const errorMessage = error.message || 'Đã xảy ra lỗi khi đăng nhập.';
        throw new Error(errorMessage);
    }
};

export const saveLocation = async (latitude, longitude, sessionId) => {
    try {

        const response = await fetch('https://app.bdsdaily.com/api/auth/save-location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({
                latitude,
                longitude,
                device_type: 'mobile',
                os: Platform.OS === 'ios' ? 'iOS' : 'Android',
                browser: 'Mobile App',
                session_id: sessionId,
            }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
            return data.message;
        } else {
            throw new Error(data.message || 'Lưu vị trí thất bại!');
        }
    } catch (error) {
        const errorMessage = error.message || 'Đã xảy ra lỗi khi lưu vị trí.';
        throw new Error(errorMessage);
    }
};

export const fetchProperties = async (page = 1, perPage = 20, keyword = null) => {
    try {
        let accessToken = await AsyncStorage.getItem('accessToken');
        let url = `https://app.bdsdaily.com/api/property/index?page=${page}&per-page=${perPage}`;

        if (keyword && keyword.trim()) {
            url += `&PropertiesSearch[keyword]=${encodeURIComponent(keyword.trim())}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        if (response.ok && data.status) {
            return {
                properties: data.data.properties,
                pagination: data.data.pagination,
            };
        } else {
            throw new Error(data.message || 'Lấy danh sách bất động sản thất bại! Vui lòng đăng nhập lại');
        }
    } catch (error) {
        const errorMessage = error.message || 'Lấy danh sách bất động sản thất bại! Vui lòng đăng nhập lại.';
        throw new Error(errorMessage);
    }
};


export const addFavorite = async (listingId, accessToken) => {
    try {
        console.log(listingId, accessToken)
        const response = await fetch('https://app.bdsdaily.com/api/property/add-favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ property_id: listingId }),
        });
        if (!response.ok) throw new Error('Failed to add favorite');
        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
};

export const removeFavorite = async (listingId, accessToken) => {
    try {
        const response = await fetch('https://app.bdsdaily.com/api/property/remove-favorite', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ property_id: listingId }),
        });
        if (!response.ok) throw new Error('Failed to remove favorite');
        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
};

export const fetchFavorites = async (accessToken) => {
    try {
        console.log(accessToken);
        const response = await fetch('https://app.bdsdaily.com/api/property/favorites', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) throw new Error('Failed to fetch favorites');
        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
};

export const changePassword = async (oldPassword, newPassword, accessToken) => {
    try {
        const response = await fetch('https://app.bdsdaily.com/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword,
            }),
        });
        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
};

export const updateProfile = async (profileData, accessToken) => {
    try {
        const response = await fetch('https://app.bdsdaily.com/api/auth/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(profileData),
        });
        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
};


export const fetchWards = async (district) => {
    try {
        console.log(district)
        const accessToken = await AsyncStorage.getItem('accessToken');
        const url = `https://app.bdsdaily.com/api/property/address?address=${encodeURIComponent(district)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        if (response.ok && data.status) {
            return {
                wards: data.data.wards,
                streets: data.data.streets,
            };
        } else {
            throw new Error(data.msg || 'Lấy danh sách phường/xã thất bại!');
        }
    } catch (error) {
        const errorMessage = error.message || 'Đã xảy ra lỗi khi lấy danh sách phường/xã.';
        throw new Error(errorMessage);
    }
};


export const createProperty = async (propertyData) => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const response = await fetch('https://app.bdsdaily.com/api/property/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(propertyData),
        });
        const data = await response.json();
        if (response.ok && data.status) {
            return data.data;
        } else {
            throw new Error(data.msg || 'Tạo bất động sản thất bại!');
        }
    } catch (error) {
        const errorMessage = error.message || 'Đã xảy ra lỗi khi tạo bất động sản.';
        throw new Error(errorMessage);
    }
};