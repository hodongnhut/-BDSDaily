import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ListingCard = memo(({ listing, onPress, onToggleFavorite, isFavorite }) => {
    if (!listing || !listing.id) {
        return (
            <View style={styles.listingCard}>
                <Text style={styles.listingTitle}>Không có dữ liệu</Text>
            </View>
        );
    }

    const renderPricePerSqm = () => {
        if (!listing.price || !listing.area) return null;
        const priceMatch = listing.price.match(/(\d+\.?\d*)/);
        const areaMatch = listing.area.match(/(\d+\.?\d*)/);
        if (!priceMatch || !areaMatch) return null;
        const priceInBillion = parseFloat(priceMatch[0]);
        const areaInSqm = parseFloat(areaMatch[0]);
        if (priceInBillion <= 0 || areaInSqm <= 0) return null;
        const pricePerSqmInMillion = (priceInBillion * 1000) / areaInSqm;
        return (
            <Text style={styles.pricePerSqm}>
                Giá/m²: {pricePerSqmInMillion.toFixed(2)} Triệu/m²
            </Text>
        );
    };

    const renderBadge = (text, style, key) => text && (
        <View key={key} style={[styles.statusBadge, style]}>
            <Text style={styles.statusText}>{String(text)}</Text>
        </View>
    );

    const badges = [
        { text: listing.status, style: listing.status === 'Đang Giao Dịch' ? styles.statusOnSale : {}, key: 'status' },
        { text: listing.redBook ? 'Có Sổ' : null, style: styles.redBookBadge, key: 'redBook' },
        { text: listing.type, style: styles.typeBadge, key: 'type' },
    ];

    const typeBadges = [
        { text: listing.assetType, style: styles.typeBadge, key: 'assetType' },
        { text: listing.locationType, style: styles.statusOnSale, key: 'locationType' },
    ];

    return (
        <TouchableOpacity
            style={styles.listingCard}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Xem chi tiết ${listing.title || 'bất động sản'}`}
        >
            <View style={styles.listingCardItem}>
                <View style={{ position: 'relative' }}>
                    <Image
                        source={listing.image ? { uri: listing.image } : require('../assets/logo.webp')}
                        style={styles.listingImage}
                    />
                    {listing.listing_type && (
                        <View style={styles.listingTypeBadge}>
                            <Text style={styles.listingTypeBadgeText}>{listing.listing_type}</Text>
                        </View>
                    )}
                    {listing.phoneType ? (
                        <View style={styles.listingPhoneBadge}>
                            <Icon name="phone" size={15} color="white" />
                        </View>
                    ) : null}
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
                    {(listing.status || listing.redBook || listing.type) && (
                        <View style={styles.imageBadgeRow}>
                            {badges.map(({ text, style, key }) => renderBadge(text, style, key))}
                        </View>
                    )}
                    {(listing.assetType || listing.locationType) && (
                        <View style={styles.imageBadgeType}>
                            {typeBadges.map(({ text, style, key }) => renderBadge(text, style, key))}
                        </View>
                    )}
                </View>
                <View style={styles.listingDetails}>
                    <Text style={styles.listingTitle}>{listing.title || 'N/A'}</Text>
                    <Text style={styles.listingPrice}>Mức Giá: {listing.price || 'N/A'}</Text>
                    <View style={styles.listingInfoRow}>
                        <Text style={styles.listingArea}>Diện Tích: {listing.area || 'N/A'}</Text>
                        {listing.detailedArea && <Text style={styles.listingArea}> {listing.detailedArea}</Text>}
                        <Text style={styles.listingBedBath}> | {listing.beds || '--'} PN</Text>
                        <Text style={styles.listingBedBath}> | {listing.baths || '--'} WC</Text>
                    </View>
                    {renderPricePerSqm()}
                    <Text style={styles.listingLocation}>
                        {listing.houseNumber ? `${listing.houseNumber}, ` : ''}{listing.ward ? `${listing.ward}, ` : ''}{listing.location || 'N/A'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    listingCard: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
        paddingHorizontal: 5,
    },
    listingCardItem: {},
    listingImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    listingDetails: {
        padding: 10,
    },
    listingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    listingPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#EE6C4D',
        marginBottom: 3,
    },
    listingInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listingArea: {
        fontSize: 13,
        color: '#666',
    },
    listingBedBath: {
        fontSize: 13,
        color: '#666',
        marginLeft: 5,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 5,
        marginTop: 5,
        backgroundColor: '#E0E0E0',
    },
    statusOnSale: {
        backgroundColor: '#4CAF50',
        marginLeft: 6,
    },
    statusText: {
        fontSize: 11,
        color: '#FFF',
        fontWeight: 'bold',
    },
    listingTypeBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#E53935',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        zIndex: 10,
    },
    listingPhoneBadge: {
        position: 'absolute',
        top: 10,
        left: 55,
        backgroundColor: '#E53935',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        zIndex: 10,
    },
    listingTypeBadgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    imageBadgeRow: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        left: 10,
        bottom: 30,
        zIndex: 10,
    },
    imageBadgeType: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        left: 10,
        bottom: 5,
        zIndex: 10,
    },
    redBookBadge: {
        backgroundColor: 'red',
        marginLeft: 6,
    },
    typeBadge: {
        backgroundColor: '#1976D2',
        marginLeft: 6,
    },
    pricePerSqm: {
        fontSize: 13,
        color: '#666',
        marginTop: 3,
        fontWeight: '500',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    listingLocation: {
        fontSize: 13,
        color: '#666',
        marginTop: 3,
    },
});

export default ListingCard;
