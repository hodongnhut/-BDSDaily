import React, { useCallback, useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../styles/colors';
import NotificationContext from '../contexts/NotificationContext';
import AuthContext from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchFavorites, removeFavorite } from '../services/api';

const toggleFavorite = async (accessToken, listingId) => {
    try {
        console.log('Toggle Favorite:', { accessToken, listingId });
        const response = await removeFavorite(listingId, accessToken);
        return response;
    } catch (error) {
        throw new Error(error.message);
    }
};

const DEFAULT_IMAGE = 'https://placehold.co/600x400/6F42C1/FFFFFF?text=No+Image';

const ListingCard = ({ listing, onPress, onToggleFavorite, isFavorite }) => (
    <TouchableOpacity style={styles.listingCard} onPress={onPress}>
        <View style={styles.listingCardItem}>
            <View style={{ position: 'relative' }}>
                <Image
                    source={{ uri: listing.image || DEFAULT_IMAGE }}
                    style={styles.listingImage}
                />
                {listing.listing_type && (
                    <View style={styles.listingTypeBadge}>
                        <Text style={styles.listingTypeBadgeText}>{listing.listing_type}</Text>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => onToggleFavorite(listing)}
                    accessibilityRole="button"
                    accessibilityLabel={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                >
                    <Icon
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={20}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
                {(listing.status || listing.redBook) && (
                    <View style={styles.imageBadgeRow}>
                        {listing.status && (
                            <View style={[styles.statusBadge, listing.status === 'Đang Giao Dịch' && styles.statusOnSale]}>
                                <Text style={styles.statusText}>{String(listing.status)}</Text>
                            </View>
                        )}
                        {listing.redBook ? (
                            <View style={[styles.statusBadge, styles.redBookBadge]}>
                                <Text style={styles.statusText}>Có Sổ</Text>
                            </View>
                        ) : null}
                    </View>
                )}
            </View>
            <View style={styles.listingDetails}>
                <Text style={styles.listingTitle}>{String(listing.title || '')}</Text>
                <Text style={styles.listingPrice}>Mức Giá: {String(listing.price || '')}</Text>
                <View style={styles.listingInfoRow}>
                    <Text style={styles.listingArea}>Diện Tích: {String(listing.area || '')}</Text>
                    {listing.detailedArea && <Text style={styles.listingArea}> {String(listing.detailedArea)}</Text>}
                    {listing.beds && <Text style={styles.listingBedBath}> | {String(listing.beds)} PN</Text>}
                    {listing.baths && <Text style={styles.listingBedBath}> | {String(listing.baths)} WC</Text>}
                </View>
                {(() => {
                    try {
                        const priceMatch = listing.price.match(/(\d+\.?\d*)/);
                        const areaMatch = listing.area.match(/(\d+\.?\d*)/);
                        if (priceMatch && areaMatch) {
                            const priceInBillion = parseFloat(priceMatch[0]);
                            const areaInSqm = parseFloat(areaMatch[0]);
                            if (priceInBillion > 0 && areaInSqm > 0) {
                                const pricePerSqm = (priceInBillion * 1e9) / areaInSqm;
                                return (
                                    <Text style={styles.pricePerSqm}>
                                        Giá/m²: {pricePerSqm.toLocaleString('vi-VN')} VNĐ
                                    </Text>
                                );
                            }
                        }
                        return null;
                    } catch (e) {
                        console.warn('Error calculating price per sqm:', e);
                        return null;
                    }
                })()}
            </View>
        </View>
    </TouchableOpacity>
);

const ListingFavorites = ({ navigation }) => {
    const { setIsLoggedIn, currentUser } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadFavorites = useCallback(async () => {
        let accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
            setFavorites([]);
            setLoading(false);
            showNotification('Vui lòng đăng nhập để xem danh sách yêu thích', 'warning');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetchFavorites(accessToken);
            console.log('API Response:', response); // Debug log
            const properties = response.data.properties;

            const mappedProperties = properties.map(property => ({
                id: property.property_id.toString(),
                type: property.property_type === 'Nhà phố' ? 'Nhà Phố' : property.property_type,
                title: property.title,
                listing_type: property.listing,
                price: `${(parseFloat(property.price) / 1e9).toFixed(1)} Tỷ VNĐ`,
                area: `${parseFloat(property.area_total).toFixed(2)} m²`,
                beds: property.beds || null,
                baths: property.baths || null,
                location: `${property.district_county}, ${property.city}`,
                houseNumber: property.street_name,
                ward: property.ward_commune,
                detailedArea: property.area_length && property.area_width ? `(${property.area_width}m x ${property.area_length}m)` : null,
                status: property.transaction_status,
                image: property.images && property.images.length > 0 ? property.images[0].image_path : DEFAULT_IMAGE,
                direction: property.direction,
                images: property.images || [],
                redBook: property.red_book ? 1 : 0,
            }));
            setFavorites(mappedProperties);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load favorites:', err.message);
            setError('Không thể tải danh sách yêu thích.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            loadFavorites();
        }
        return () => { isMounted = false; };
    }, [loadFavorites]);

    const handleToggleFavorite = useCallback(async (listing) => {
        let accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
            showNotification('Vui lòng đăng nhập để xóa khỏi danh sách yêu thích', 'warning');
            return;
        }
        try {
            const response = await toggleFavorite(accessToken, listing.id);
            console.log(response.status)
            console.log(response.msg)

            if (response.status) {
                setFavorites(prev => prev.filter(fav => fav.id !== listing.id));
                showNotification(response.msg || 'Đã xóa khỏi danh sách yêu thích', 'info');
            } else {
                showNotification('Không thể xóa khỏi danh sách yêu thích', 'error');
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err.message);
            showNotification('Không thể xóa khỏi danh sách yêu thích', 'error');
        }
    }, [showNotification]);

    const handleListingPress = useCallback((listing) => {
        const mockInsight = { description: 'Khu vực sầm uất, gần trung tâm.' };
        navigation.navigate('ListingDetail', { listing, insight: mockInsight });
    }, [navigation]);

    if (!currentUser) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.headerContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Danh Sách Yêu Thích</Text>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.navigate('Listings')}
                        >
                            <Icon name="arrow-left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Vui lòng đăng nhập để xem danh sách yêu thích.</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.retryButtonText}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Listings')}
                    >
                        <Icon name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Danh Sách Yêu Thích</Text>

                </View>
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.secondary} />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={loadFavorites}
                    >
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="heart-outline" size={48} color="#aaa" />
                    <Text style={[styles.emptyText, { marginTop: 10 }]}>
                        Chưa có bất động sản nào trong danh sách yêu thích.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <ListingCard
                            listing={item}
                            onPress={() => handleListingPress(item)}
                            onToggleFavorite={() => handleToggleFavorite(item)}
                            isFavorite={true}
                        />
                    )}
                    contentContainerStyle={styles.listContainer}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={21}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={loadFavorites}
                            colors={[colors.secondary]}
                        />
                    }
                />
            )}
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
        paddingBottom: 10,
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
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 15,
        paddingBottom: 10,
        position: 'relative', // Added to allow absolute positioning of headerText
    },
    backButton: {
        padding: 5,
        zIndex: 1, // Ensure back button is clickable
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center', // Center the text
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    listingCard: {
        marginVertical: 8,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    listingCardItem: {
        flexDirection: 'column',
    },
    listingImage: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    listingTypeBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: colors.secondary,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    listingTypeBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 6,
    },
    imageBadgeRow: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        flexDirection: 'row',
    },
    statusBadge: {
        backgroundColor: '#28A745',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginRight: 5,
    },
    statusOnSale: {
        backgroundColor: '#FFC107',
    },
    redBookBadge: {
        backgroundColor: '#DC3545',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    listingDetails: {
        padding: 12,
    },
    listingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    listingPrice: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.secondary,
        marginBottom: 4,
    },
    listingInfoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
    },
    listingArea: {
        fontSize: 13,
        color: '#666',
    },
    listingBedBath: {
        fontSize: 13,
        color: '#666',
    },
    pricePerSqm: {
        fontSize: 13,
        color: '#666',
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
});

export default ListingFavorites;