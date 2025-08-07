import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchFavorites, addFavoriteToBackend, removeFavoriteFromBackend } from '../services/api';
import { NotificationContext } from '../contexts/NotificationContext';
import { AuthContext } from '../contexts/AuthContext';

export const FavoriteContext = createContext({
  favorites: [],
  addFavorite: () => { },
  removeFavorite: () => { },
  isFavorite: () => false,
  loading: false,
  error: null,
});

export const FavoriteProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadFavorites = async () => {
      setLoading(true);
      setError(null);

      let token = currentUser?.accessToken; // Try to get token from AuthContext first
      if (!token) {
        // If not available from AuthContext, try fetching from AsyncStorage
        try {
          token = await AsyncStorage.getItem('accessToken');
          if (!token) {
            console.log('No access token found in currentUser or AsyncStorage. Clearing favorites.');
            setFavorites([]); // Clear favorites if no token is found
            setLoading(false);
            return;
          }
        } catch (asyncStorageError) {
          console.error('Failed to retrieve access token from AsyncStorage:', asyncStorageError);
          setError(asyncStorageError.message);
          showNotification('Không thể tải token truy cập: ' + asyncStorageError.message, 'error');
          setLoading(false);
          return;
        }
      }

      try {
        const favoriteData = await fetchFavorites(token);
        if (isMounted) {
          const mappedFavorites = favoriteData.map(item => ({
            id: item.property_id ? item.property_id.toString() : '',
            type: item.property_type || '',
            title: item.title || '',
            listing_type: item.listing || '',
            price: item.price ? `${(parseFloat(item.price) / 1e9).toFixed(1)} Tỷ VNĐ` : '',
            area: item.area_total ? `${parseFloat(item.area_total).toFixed(2)} m²` : '',
            beds: null,
            baths: null,
            location: item.district_county && item.city ? `${item.district_county}, ${item.city}` : '',
            houseNumber: item.street_name || '',
            ward: item.ward_commune || '',
            detailedArea: item.area_width && item.area_length ? `(${item.area_width}m x ${item.area_length}m)` : null,
            status: item.transaction_status || '',
            image: item.images && item.images.length > 0 ? item.images[0].image_path : 'https://placehold.co/600x400/6F42C1/FFFFFF?text=Th%E1%BA%A3o+%C4%90i%E1%BB%81n',
            direction: item.direction || '',
            images: item.images || [],
            redBook: item.red_book ? 1 : 0,
          }));
          setFavorites(mappedFavorites);
          // Cache favorites in AsyncStorage for offline support
          await AsyncStorage.setItem('favorites', JSON.stringify(mappedFavorites));
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load favorites:', error);
          setError(error.message);
          showNotification('Không thể tải danh sách yêu thích: ' + error.message, 'error');
          // Fallback to cached favorites
          const cachedFavorites = await AsyncStorage.getItem('favorites');
          if (cachedFavorites) {
            setFavorites(JSON.parse(cachedFavorites));
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadFavorites();
    return () => { isMounted = false; };
  }, [currentUser, showNotification]);

  const addFavorite = async (listing) => {
    let token = currentUser?.accessToken;
    if (!token) {
      try {
        token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          showNotification('Vui lòng đăng nhập để thêm vào danh sách yêu thích', 'warning');
          return;
        }
      } catch (asyncStorageError) {
        showNotification('Không thể thêm vào danh sách yêu thích: ' + asyncStorageError.message, 'error');
        return;
      }
    }

    try {
      await addFavoriteToBackend(listing.id, token);
      setFavorites(prev => {
        if (!prev.some(fav => fav.id === listing.id)) {
          const updatedFavorites = [...prev, listing];
          // Update cache
          AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
          return updatedFavorites;
        }
        return prev;
      });
      showNotification('Đã thêm vào danh sách yêu thích', 'info');
    } catch (error) {
      console.error('Failed to add favorite:', error);
      showNotification('Không thể thêm vào danh sách yêu thích: ' + error.message, 'error');
    }
  };

  const removeFavorite = async (listingId) => {
    let token = currentUser?.accessToken;
    if (!token) {
      try {
        token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          showNotification('Vui lòng đăng nhập để xóa khỏi danh sách yêu thích', 'warning');
          return;
        }
      } catch (asyncStorageError) {
        showNotification('Không thể xóa khỏi danh sách yêu thích: ' + asyncStorageError.message, 'error');
        return;
      }
    }

    try {
      await removeFavoriteFromBackend(listingId, token);
      setFavorites(prev => {
        const updatedFavorites = prev.filter(fav => fav.id !== listingId);
        // Update cache
        AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        return updatedFavorites;
      });
      showNotification('Đã xóa khỏi danh sách yêu thích', 'info');
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      showNotification('Không thể xóa khỏi danh sách yêu thích: ' + error.message, 'error');
    }
  };

  const isFavorite = (listingId) => {
    return favorites.some(fav => fav.id === listingId);
  };

  return (
    <FavoriteContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, loading, error }}>
      {children}
    </FavoriteContext.Provider>
  );
};
