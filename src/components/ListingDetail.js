import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Dimensions, Alert, Platform, PermissionsAndroid, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNBlobUtil from 'react-native-blob-util';
import ImageViewer from 'react-native-image-zoom-viewer';
import { colors } from '../styles/colors';
import NotificationContext from '../contexts/NotificationContext';
import { addFavorite, removeFavorite } from '../services/api';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ListingDetail = ({ route, navigation }) => {
    const { listing, isFavorite: initialIsFavorite } = route.params;
    const { showNotification } = useContext(NotificationContext);
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [contactsModalVisible, setContactsModalVisible] = useState(false);

    const handleCopyPhoneNumber = (phoneNumber) => {
        Clipboard.setString(phoneNumber);
        showNotification('Copy số ĐT thành công: ' + phoneNumber, 'success');
        setContactsModalVisible(false);
    };


    const [images, setImages] = useState(
        Array.isArray(listing.images) && listing.images.length > 0
            ? listing.images.map(img => img.image_path)
            : [listing.image || 'https://app.bdsdaily.com/img/no-image.webp']
    );

    const [modalVisible, setModalVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleThumbnailPress = (idx) => {
        setCurrentIndex(idx);
    };

    const handleMainImagePress = () => {
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };
    const handleDownloadImage = async () => {
        try {
            const imageUrl = images[currentIndex];
            let granted = true;
            if (Platform.OS === 'android') {
                granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'App needs access to your storage to download images.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                granted = granted === PermissionsAndroid.RESULTS.GRANTED;
            }
            if (!granted) {
                Alert.alert('Permission Denied', 'Storage permission is required to download images.');
                return;
            }
            const { config, fs } = RNBlobUtil;
            const date = new Date();
            const ext = imageUrl.split('.').pop().split('?')[0];
            const fileName = `kingland_${date.getTime()}.${ext}`;
            const dir = Platform.OS === 'android' ? fs.dirs.DownloadDir : fs.dirs.DocumentDir;
            const filePath = `${dir}/${fileName}`;
            config({
                fileCache: true,
                appendExt: ext,
                path: filePath,
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    path: filePath,
                    description: 'Image downloaded by KingLand',
                },
            })
                .fetch('GET', imageUrl)
                .then(res => {
                    Alert.alert('Tải thành công', `Ảnh đã được lưu vào ${filePath}`);
                })
                .catch(err => {
                    Alert.alert('Lỗi tải ảnh', err.message);
                });
        } catch (err) {
            Alert.alert('Lỗi tải ảnh', err.message);
        }
    };

    // Copy listing details to clipboard
    const handleCopyListing = () => {
        const details = [
            `Tiêu đề: ${String(listing.title)}`,
            `Giá: ${String(listing.price)}`,
            `Vị trí: ${String(listing.location)}`,
            listing.ward ? `Phường: ${String(listing.ward)}` : '',
            listing.houseNumber ? `Số nhà: ${String(listing.houseNumber)}` : '',
            `Diện tích: ${String(listing.area)}`,
            listing.detailedArea ? `Chi tiết diện tích: ${String(listing.detailedArea)}` : '',
            listing.beds ? `Phòng ngủ: ${String(listing.beds)}` : '',
            listing.baths ? `Phòng tắm: ${String(listing.baths)}` : '',
            listing.direction ? `Hướng: ${String(listing.direction)}` : '',
            listing.status ? `Trạng thái: ${String(listing.status)}` : '',
        ].filter(Boolean).join('\n');
        Clipboard.setString(details);
        Alert.alert('Đã sao chép', 'Thông tin bất động sản đã được sao chép vào clipboard.');
    };

    const handleToggleFavorite = useCallback(async () => {
        let accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
            showNotification('Vui lòng đăng nhập để thêm/xóa yêu thích', 'warning');
            return;
        }
        try {
            const apiCall = isFavorite ? removeFavorite : addFavorite;
            const response = await apiCall(listing.id, accessToken);
            if (!response.status) {
                throw new Error(response.msg || `Failed to ${isFavorite ? 'remove' : 'add'} favorite`);
            }
            setIsFavorite(!isFavorite);
            showNotification(response.msg || `Đã ${isFavorite ? 'xóa khỏi' : 'thêm vào'} danh sách yêu thích`, 'info');
        } catch (error) {
            showNotification(error.message || `Không thể ${isFavorite ? 'xóa khỏi' : 'thêm vào'} danh sách yêu thích`, 'error');
        }
    }, [isFavorite, listing.id, showNotification]);

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
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Custom Header */}
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
                        <Icon name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chi tiết nhà phố</Text>
                    <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerFavoriteButton}>
                        <Icon name={isFavorite ? "heart" : "heart-outline"} size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
                data={[]} // No data for the main FlatList, content is in ListHeaderComponent
                ListHeaderComponent={
                    <View style={styles.card}>
                        <View style={{ position: 'relative' }}>
                            <TouchableOpacity activeOpacity={0.9} onPress={handleMainImagePress}>
                                <Image
                                    source={{ uri: images[currentIndex] }}
                                    style={styles.image}
                                    resizeMode="cover"
                                    shouldRasterizeIOS
                                    renderToHardwareTextureAndroid
                                />
                            </TouchableOpacity>
                            {listing.listing_type && (
                                <View style={styles.listingTypeBadge}>
                                    <Text style={styles.listingTypeBadgeText}>{String(listing.listing_type)}</Text>
                                </View>
                            )}
                            {listing.phoneType ? (
                                <View style={styles.listingPhoneBadge}>
                                    <Icon name="phone" size={15} color="white" />
                                </View>
                            ) : null}
                            {(listing.status || listing.redBook) && (
                                <>
                                    <View style={styles.imageBadgeType}>
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
                                </>
                            )}
                        </View>
                        {/* Thumbnails */}
                        {images.length >= 1 && (
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={images}
                                renderItem={({ item, index: idx }) => (
                                    <TouchableOpacity key={item + idx} onPress={() => handleThumbnailPress(idx)}>
                                        <Image
                                            source={{ uri: item }}
                                            style={[styles.thumbnail, idx === currentIndex && styles.thumbnailSelected]}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item, index) => item + index}
                                style={styles.thumbnailScroll}
                                contentContainerStyle={styles.thumbnailRow}
                            />
                        )}
                        <View style={styles.detailsContainer}>
                            <Text style={styles.title}>{String(listing.title)}</Text>
                            <Text style={styles.price}>{String(listing.price)}</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoText}>Diện tích: {String(listing.area)}</Text>
                                {listing.detailedArea && <Text style={styles.infoText}> {String(listing.detailedArea)}</Text>}
                                {listing.beds && <Text style={styles.infoText}> | {String(listing.beds)} PN</Text>}
                                {listing.baths && <Text style={styles.infoText}> | {String(listing.baths)} WC</Text>}

                            </View>
                            <View style={styles.infoRow}>
                                {renderPricePerSqm()}
                            </View>
                            {/* Copy Button */}
                            <TouchableOpacity style={styles.insightButton} onPress={handleCopyListing}>
                                <Text style={styles.insightButtonText}>Sao chép thông tin</Text>
                            </TouchableOpacity>

                            {listing.phoneType && listing.contacts && listing.contacts.length > 0 ? (
                                <TouchableOpacity
                                    style={styles.updateButton}
                                    onPress={() => setContactsModalVisible(true)}
                                >
                                    <Text style={styles.updateButtonText}>Xem danh bạ</Text>
                                </TouchableOpacity>
                            ) : null}

                            <TouchableOpacity
                                style={styles.historyButton}
                                onPress={() => navigation.navigate('ListingUpdate', { listing })}
                            >
                                <Text style={styles.updateButtonText}>Lịch sử tương tác</Text>
                            </TouchableOpacity>

                            {/* Update Button */}
                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={() => navigation.navigate('ListingFormAdvanced', { propertyId: listing.id })}
                            >
                                <Text style={styles.updateButtonText}>Cập nhật</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                }
                style={styles.container}
            />
            {/* Fullscreen Image Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleCloseModal}
            >
                <View style={[styles.modalOverlay, { alignItems: undefined, justifyContent: undefined }]}>
                    <View style={styles.modalTopRow}>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={handleCloseModal}
                            accessibilityLabel="Close image viewer"
                        >
                            <Icon name="close" size={32} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalDownloadButton}
                            onPress={handleDownloadImage}
                            accessibilityLabel="Download image"
                        >
                            <Icon name="download" size={32} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <ImageViewer style={styles.modalImage}
                        imageUrls={images.map(url => {
                            const finalUrl = url.startsWith('http') ? url : require('../assets/logo.webp');
                            return { url: finalUrl };
                        })}
                        index={currentIndex}
                        onChange={idx => {
                            if (typeof idx === 'number') {
                                setCurrentIndex(idx);
                            }
                        }}
                        enableSwipeDown
                        onSwipeDown={handleCloseModal}
                        backgroundColor="rgba(0,0,0,0.95)"
                        saveToLocalByLongPress={false}
                        renderIndicator={() => null}
                        renderHeader={() => null}
                        renderFooter={() => null}
                        enablePreload
                    />
                    {images.length > 1 && (
                        <View style={styles.modalIndicatorRow}>
                            {images.map((_, idx) => (
                                <View
                                    key={idx}
                                    style={[styles.modalIndicatorDot, idx === currentIndex && styles.modalIndicatorDotActive]}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </Modal>

            {/* Contacts Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={contactsModalVisible}
                onRequestClose={() => {
                    setContactsModalVisible(!contactsModalVisible);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Danh sách liên hệ</Text>
                        <FlatList
                            data={listing.contacts}
                            keyExtractor={(item, index) => String(index)}
                            renderItem={({ item: contact, index }) => (
                                <View key={index} style={styles.contactRow}>
                                    <View>
                                        <Text style={styles.contactName}>{String(contact.contact_name)}</Text>
                                        <Text style={styles.contactPhone}>{String(contact.phone_number)}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleCopyPhoneNumber(String(contact.phone_number))}>
                                        <Icon name="content-copy" size={24} color={colors.buttonPrimary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            style={{ width: '100%' }}
                        />
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setContactsModalVisible(!contactsModalVisible)}>
                            <Text style={styles.textStyle}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F3F5',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 250,
    },
    detailsContainer: {
        padding: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#EE6C4D',
        marginBottom: 10,
    },
    location: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    subInfo: {
        fontSize: 14,
        color: '#777',
        marginBottom: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
        backgroundColor: '#E0E0E0',
        marginBottom: 10,
        margin: 5,
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
    typeBadge: {
        backgroundColor: '#1976D2',
        marginLeft: 6,
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
        bottom: 30,
        zIndex: 10,
        marginBottom: 2,
    },
    imageBadgeType: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        bottom: 5,
        zIndex: 10,
    },
    redBookBadge: {
        backgroundColor: '#1976D2',
        marginLeft: 6,
    },
    statusOnSale: {
        backgroundColor: '#4CAF50',
    },
    statusText: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: 'bold',
    },
    insightButton: {
        backgroundColor: colors.secondary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    insightButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Add header styles for ListingDetail
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 15,
        paddingBottom: 10,
    },
    headerBackButton: {
        padding: 5,
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        flex: 1,
    },
    headerFavoriteButton: {
        padding: 5,
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Add thumbnail styles
    thumbnailScroll: {
        marginTop: 10,
        marginBottom: 10,
    },
    thumbnailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    thumbnailSelected: {
        borderColor: colors.secondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTopRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        position: 'absolute',
        top: 40,
        right: 0,
        zIndex: 20,
        paddingHorizontal: 10,
    },
    modalCloseButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 4,
        marginRight: 10,
    },
    modalDownloadButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 4,
    },
    modalScroll: {
        flexGrow: 0,
    },
    modalImage: {
        width: '100%',
        height: Dimensions.get('window').height * 0.7,
        borderRadius: 12,
    },
    modalIndicatorRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        zIndex: 30,
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
    },
    modalIndicatorDot: {
        width: 12, // Slightly larger dots
        height: 12,
        borderRadius: 6,
        backgroundColor: '#888',
        marginHorizontal: 6,
    },
    modalIndicatorDotActive: {
        backgroundColor: colors.secondary,
        width: 14, // Slightly larger for active dot
        height: 14,
        borderRadius: 7,
    },
    // Add styles for update button
    updateButton: {
        backgroundColor: colors.buttonPrimary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    historyButton: {
        backgroundColor: '#A16207',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    updateButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Styles for contacts modal
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxHeight: '80%',
    },
    button: {
        borderRadius: 10,
        padding: 12,
        elevation: 2,
        minWidth: 100,
    },
    buttonClose: {
        backgroundColor: colors.buttonPrimary,
        marginTop: 15,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        width: '100%',
    },
    contactName: {
        fontSize: 16,
        color: '#333',
    },
    contactPhone: {
        fontSize: 16,
        color: colors.buttonPrimary,
        fontWeight: 'bold',
    },
    contactRole: {
        fontSize: 14,
        color: '#666',
    },
    contactGender: {
        fontSize: 14,
        color: '#666',
    },
});

export default ListingDetail;
