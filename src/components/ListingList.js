import React, { useState, useEffect, useContext, useCallback, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    ActivityIndicator,
    RefreshControl,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NotificationContext from '../contexts/NotificationContext';
import AuthContext from '../contexts/AuthContext';
import FilterPage from './FilterPage';
import NotificationPage from './NotificationPage';
import ListingForm from './ListingForm';
import { fetchProperties, addFavorite, removeFavorite } from '../services/api';
import { colors } from '../styles/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ListingCard from './ListingCard';

const SearchBar = memo(({ onSearch, onOpenFilter }) => {
    const [keyword, setKeyword] = useState('');

    const handleSearch = () => {
        onSearch(keyword);
        Keyboard.dismiss();
    };

    const handleClear = () => {
        setKeyword('');
        onSearch('');
        Keyboard.dismiss();
    };

    return (
        <View style={styles.searchBarContainer}>
            <Icon name="magnify" size={24} color="#888" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Điện Thoại|Số Nhà|Đường Phố ..."
                placeholderTextColor="#888"
                value={keyword}
                onChangeText={setKeyword}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                accessibilityHint="Nhập số nhà, đường phố hoặc số điện thoại để tìm kiếm bất động sản"
                autoCorrect={false}
                autoCapitalize="none"
            />
            {keyword.length > 0 && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClear}
                    accessibilityLabel="Xóa tìm kiếm"
                    accessibilityRole="button"
                >
                    <Icon name="close" size={20} color="#888" />
                </TouchableOpacity>
            )}
            <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                accessibilityLabel="Tìm kiếm"
                accessibilityRole="button"
            >
                <Icon name="magnify" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.filterButton}
                onPress={onOpenFilter}
                accessibilityLabel="Mở bộ lọc"
                accessibilityRole="button"
            >
                <Icon name="tune-variant" size={22} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
});

const ListingList = ({ navigation }) => {

    const { currentUser, setIsLoggedIn, setCurrentUser } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
    const [isListingFormModalVisible, setListingFormModalVisible] = useState(false);
    const [filters, setFilters] = useState({});
    const [listingsData, setListingsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [favoriteIds, setFavoriteIds] = useState(new Set());

    useEffect(() => {
        const checkSession = async () => {
            const loginTime = await AsyncStorage.getItem('loginTime');
            if (loginTime) {
                const now = new Date().getTime();
                const loginTimestamp = parseInt(loginTime, 10);
                const diff = now - loginTimestamp;
                const minutes = Math.floor(diff / 60000);

                if (minutes > 30) {
                    await AsyncStorage.clear();
                    if (setIsLoggedIn && setCurrentUser) {
                        setIsLoggedIn(false);
                        setCurrentUser(null);
                    }
                    showNotification('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'warning');
                }
            }
        };

        checkSession();
    }, [setIsLoggedIn, setCurrentUser, showNotification]);

    const loadProperties = useCallback(async (pageToLoad = 1, isRefresh = false, currentKeyword) => {
        if (pageToLoad === 1) {
            setLoading(true);
            setError(null);
        } else {
            setLoadingMore(true);
        }
        try {
            const response = await fetchProperties(pageToLoad, 20, currentKeyword);
            const properties = response.properties;
            const paginationData = response.pagination;

            const mappedProperties = properties
                .filter(property => property && property.property_id && property.title)
                .map(property => ({
                    id: property.property_id.toString(),
                    type: `Loại Sản Phẩm ${property.property_type || 'N/A'}`,
                    title: `${property.title || 'Untitled'}`,
                    listing_type: property.listing || 'N/A',
                    price: property.price ? `${(parseFloat(property.price) / 1e9).toFixed(1)} Tỷ VNĐ` : 'N/A',
                    area: property.area_total ? `${parseFloat(property.area_total).toFixed(2)} m²` : 'N/A',
                    beds: property.beds || null,
                    baths: property.baths || null,
                    location: property.district_county && property.city ? `${property.district_county}, ${property.city}` : 'N/A',
                    houseNumber: property.street_name || null,
                    ward: property.ward_commune || null,
                    detailedArea: property.area_width && property.area_length ? `(${property.area_width}m x ${property.area_length}m)` : null,
                    status: property.transaction_status || 'Chưa Cập nhật',
                    image: property.images?.length > 0 ? property.images[0].image_path : null,
                    direction: property.direction || null,
                    images: property.images || [],
                    redBook: property.red_book ? 1 : 0,
                    assetType: `Loại Tài Sản ${property.asset_type || 'N/A'}`,
                    locationType: `Vị Trí ${property.location_type || 'N/A'}`,
                    phoneType: property.owner_contacts?.length > 0 ? 1 : 0,
                    contacts: property.owner_contacts || [],
                }));
            if (pageToLoad === 1 || isRefresh) {
                setListingsData(mappedProperties);
            } else {
                setListingsData(prev => [...prev, ...mappedProperties]);
            }
            setHasMore(properties.length === 20);
            setPage(pageToLoad);
            setPagination(paginationData);
            if (pageToLoad === 1 && !isRefresh) showNotification('Đã tải danh sách bất động sản thành công!', 'info');
        } catch (err) {
            setError(err.message);
            showNotification(err.message, 'error');
            await AsyncStorage.clear();
            setIsLoggedIn(false);
            showNotification('👋 Đã đăng xuất.', 'success');
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadProperties(1, true, searchKeyword);
    }, [searchKeyword, loadProperties]);

    const onRefresh = useCallback(async () => {
        if (refreshing || loading) return;
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        await loadProperties(1, true, searchKeyword);
    }, [refreshing, loading, loadProperties, searchKeyword]);

    const handleLoadMore = useCallback(() => {
        if (!loadingMore && hasMore && !loading && !refreshing) {
            loadProperties(page + 1, false, searchKeyword);
        }
    }, [loadingMore, hasMore, loading, refreshing, page, loadProperties, searchKeyword]);

    const handleSearch = useCallback((keyword) => {
        setSearchKeyword(keyword);
        setPage(1);
        setHasMore(true);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchKeyword('');
    }, []);

    const toggleFavorite = async (listingId, isFavorite) => {
        let accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
            showNotification('Vui lòng đăng nhập để thêm/xóa yêu thích', 'warning');
            return false;
        }
        try {
            const apiCall = isFavorite ? removeFavorite : addFavorite;
            const response = await apiCall(listingId, accessToken);
            if (!response.status) {
                throw new Error(response.msg || `Failed to ${isFavorite ? 'remove' : 'add'} favorite`);
            }
            showNotification(response.msg || `Đã ${isFavorite ? 'xóa khỏi' : 'thêm vào'} danh sách yêu thích`, 'info');
            return true;
        } catch (error) {
            showNotification(error.message || `Không thể ${isFavorite ? 'xóa khỏi' : 'thêm vào'} danh sách yêu thích`, 'error');
            return false;
        }
    };

    const handleToggleFavorite = useCallback(async (listing) => {
        const isFavorite = favoriteIds.has(listing.id);
        const success = await toggleFavorite(listing.id, isFavorite);
        if (success) {
            setFavoriteIds(prev => {
                const newSet = new Set(prev);
                if (isFavorite) {
                    newSet.delete(listing.id);
                } else {
                    newSet.add(listing.id);
                }
                return newSet;
            });
        }
    }, [favoriteIds]);

    const handleListingPress = async (listing) => {
        const isFavorite = favoriteIds.has(listing.id);
        try {
            navigation.navigate('ListingDetail', { listing, isFavorite });
        } catch (error) {
            showNotification(error.message, 'error');
            navigation.navigate('ListingDetail', { listing, isFavorite });
        }
    };

    const applyFilters = (newFilters) => {
        setFilters(newFilters);
        // This is a client-side filter, which might not be desired if the API supports these filters.
        // For now, it filters the currently loaded data.
        // A full implementation would require passing filters to the `loadProperties` function.
        setFilterModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {loading && !refreshing && listingsData.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.secondary} />
                    <Text style={styles.loadingText}>Đang tải bất động sản...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={listingsData}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.secondary]}
                            tintColor={colors.secondary}
                        />
                    }
                    ListHeaderComponent={() => (

                        <View style={styles.headerContainer}>
                            <View style={styles.header}>
                                <View style={styles.userInfoContainer}>
                                    <Icon name="account-circle" size={20} color="red" />
                                    <Text style={styles.userNameText}>
                                        Xin Chào {currentUser?.name || currentUser?.username || 'Khách'}!
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.notificationButton}
                                    onPress={() => setNotificationModalVisible(true)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Mở thông báo"
                                >
                                    <Icon name="bell-outline" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                            <SearchBar
                                onSearch={handleSearch}
                                onOpenFilter={() => setFilterModalVisible(true)}
                            />
                            {searchKeyword ? (
                                <View style={styles.keyWordResult}>
                                    <Text style={styles.keyWordText}>
                                        Từ Khóa: {searchKeyword}
                                    </Text>
                                    <TouchableOpacity onPress={handleClearSearch} style={styles.clearKeywordButton}>
                                        <Icon name="close-circle-outline" size={18} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <ListingCard
                            listing={item}
                            onPress={() => handleListingPress(item)}
                            onToggleFavorite={handleToggleFavorite}
                            isFavorite={favoriteIds.has(item.id)}
                        />
                    )}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    ListFooterComponent={() =>
                        loadingMore ? (
                            <View style={{ padding: 16 }}>
                                <ActivityIndicator size="small" color={colors.secondary} />
                            </View>
                        ) : <View style={{ height: 10 }} />
                    }
                    contentContainerStyle={styles.listContainer}
                />
            )}
            {pagination && (
                <View style={styles.paginationHeader}>
                    <Text style={styles.paginationText}>
                        Hiển thị {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} trong tổng số {pagination.total.toLocaleString('vi-VN')} bất động sản | Trang {pagination.page} / {pagination.totalPages}
                    </Text>
                </View>
            )}
            <Modal
                visible={isFilterModalVisible}
                animationType="slide"
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <FilterPage
                    onClose={() => setFilterModalVisible(false)}
                    onApplyFilters={applyFilters}
                />
            </Modal>
            <Modal
                visible={isNotificationModalVisible}
                animationType="slide"
                onRequestClose={() => setNotificationModalVisible(false)}
            >
                <NotificationPage
                    onClose={() => setNotificationModalVisible(false)}
                />
            </Modal>
            <Modal
                visible={isListingFormModalVisible}
                animationType="slide"
                onRequestClose={() => setListingFormModalVisible(false)}
            >
                <ListingForm
                    onClose={() => setListingFormModalVisible(false)}
                    navigation={navigation}
                />
            </Modal>
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setListingFormModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Thêm bất động sản"
            >
                <Icon name="plus" size={28} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F3F5',
    },
    headerContainer: {
        width: '100%',
        backgroundColor: colors.secondary,
        paddingBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 3,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 15,
        paddingBottom: 10,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    userNameText: {
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
        color: '#3D5A80',
    },
    notificationButton: {
        padding: 5,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 25,
        marginHorizontal: 10,
        marginTop: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchIcon: {
        marginRight: 10,
        paddingVertical: 15,
    },
    searchInput: {
        flex: 1,
        height: 45,
        fontSize: 16,
        color: '#333',
        paddingVertical: 0,
    },
    clearButton: {
        padding: 10,
    },
    filterButton: {
        backgroundColor: '#1F2937',
        borderRadius: 20,
        padding: 10,
        marginLeft: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.textPrimary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: colors.error || '#D32F2F',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: colors.secondary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: 35,
        right: 15,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        zIndex: 1000,
    },
    paginationHeader: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    paginationText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
    },
    searchButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        padding: 10,
        marginLeft: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    keyWordResult: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    keyWordText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
    },
    clearKeywordButton: {
        padding: 2,
    },
});

export default ListingList;
