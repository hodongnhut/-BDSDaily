import React, { useState, useCallback, useEffect, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    SafeAreaView,
    FlatList,
    Image,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Switch
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../styles/colors';
import NotificationContext from '../contexts/NotificationContext';
import AddContactForm from './AddContactForm';
// import HasRentalContract from './HasRentalContract';
import { launchImageLibrary } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';
import { fetchWards, updateProperty, getProperty, uploadImage } from '../services/api';
import {
    transactionTypes,
    propertyTypes,
    statusOptions,
    assetTypeOptions,
    locationTypeOptions,
    productTypeOptions,
    directionOptions,
    landTypeOptions,
    prosConsOptions,
    formatPriceUnit
} from '../data/fromPreparing';

const Section = ({ title, children }) => (
    <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const InputGroup = ({ label, children, isRequired }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>
            {isRequired && <Text style={styles.requiredStar}>* </Text>}
            {label}
        </Text>
        {children}
    </View>
);

const ListingFormAdvanced = ({ route, navigation }) => {
    const { propertyId } = route.params || {};
    const [selectedTab, setSelectedTab] = useState('Dữ Liệu Nhà Đất');
    const [isContactModalVisible, setIsContactModalVisible] = useState(false);
    const [wards, setWards] = useState([]);
    const [streets, setStreets] = useState([]);
    const [filteredStreets, setFilteredStreets] = useState([]);
    const [locationCache, setLocationCache] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isFetchingProperty, setIsFetchingProperty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPickingImage, setIsPickingImage] = useState(false);
    const { showNotification } = useContext(NotificationContext);
    const [viewPrice, setViewPrice] = useState(false);
    // const [isHasRentalContract, setIsHasRentalContract] = useState(false);


    const [formData, setFormData] = useState({
        city: 'Hồ Chí Minh',
        district: null,
        ward: null,
        street: '',
        houseNumber: '',
        lotNumber: '',
        sheetNumber: '',
        blockNumber: '',
        areaDescription: '',
        transactionType: 'Bán',
        propertyType: null,
        listingType: null,
        price: '',
        priceUnit: 'Tỷ',
        priceRate: '',
        landArea: '',
        landWidth: '',
        landLength: '',
        backWidth: '',
        plannedArea: '',
        plannedWidth: '',
        plannedLength: '',
        plannedBackWidth: '',
        beds: '',
        baths: '',
        productType: null,
        direction: null,
        landType: null,
        streetWidth: '',
        usedArea: '',
        floors: '',
        basements: '',
        status: null,
        assetType: null,
        hasTaxContract: false,
        hasLeaseContract: false,
        isUnderNegotiation: false,
        contactName: '',
        contactPhone: '',
        hasLuckyMoney: false,
        notes: '',
        selectedPros: new Set(),
        selectedCons: new Set(),
        final_price: '',
        locationType: null,
    });

    const [redBookImages, setRedBookImages] = useState([]);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [prosOptions, setProsOptions] = useState(prosConsOptions.pros);
    const [consOptions, setConsOptions] = useState(prosConsOptions.cons);

    const fetchPropertyData = useCallback(async () => {
        if (propertyId) {
            try {
                setIsLoading(true);
                const response = await getProperty(propertyId);
                const property = response.property;
                const contacts = response.contacts[0] || {};
                setViewPrice(formatPriceUnit(parseInt(property.price)));
                setFormData({
                    city: property.city || 'Hồ Chí Minh',
                    district: property.district_county || null,
                    ward: property.ward_commune || null,
                    street: property.street_name || '',
                    houseNumber: property.house_number || '',
                    lotNumber: property.plot_number || '',
                    sheetNumber: property.sheet_number || '',
                    blockNumber: property.lot_number || '',
                    areaDescription: property.region || '',
                    transactionType: property.listing_types_id === 1 ? 'Bán' : 'Cho thuê',
                    propertyType: property.property_type_id || null,
                    listingType: null,
                    price: property.price ? (parseInt(property.price)).toString() : '',
                    priceUnit: property.price_unit || 'Tỷ',
                    priceRate: '',
                    landArea: property.area_total || '',
                    landWidth: property.area_width || '',
                    landLength: property.area_length || '',
                    backWidth: property.area_back_side || '',
                    plannedArea: property.planned_construction_area || '',
                    plannedWidth: property.planned_width || '',
                    plannedLength: property.planned_length || '',
                    plannedBackWidth: property.planned_back_side || '',
                    beds: property.num_bedrooms || '',
                    baths: property.num_toilets || '',
                    productType: property.product_type || null,
                    direction: property.direction_id || null,
                    landType: property.land_type_id || null,
                    streetWidth: property.wide_road || '',
                    usedArea: property.usable_area || '',
                    floors: property.num_floors || '',
                    basements: property.num_basements || '',
                    status: property.transaction_status_id?.toString() || null,
                    assetType: property.asset_type_id?.toString() || null,
                    hasTaxContract: !!property.has_vat_invoice,
                    hasLeaseContract: !!property.has_rental_contract,
                    isUnderNegotiation: !!property.has_deposit,
                    contactName: contacts.contact_name || '',
                    contactPhone: contacts.phone_number || '',
                    hasLuckyMoney: false,
                    notes: property.description || '',
                    selectedPros: new Set(response.selectAdvantages.map(id => response.advantages.find(a => a.advantage_id === id)?.name || '')),
                    selectedCons: new Set(response.selectDisadvantages.map(id => response.disadvantages.find(d => d.disadvantage_id === id)?.disadvantage_name || '')),
                    final_price: property.final_price || '',
                    locationType: property.location_type_id?.toString() || null,
                });
                setProsOptions(response.advantages.map(a => ({ id: a.advantage_id, name: a.name })));
                setConsOptions(response.disadvantages.map(d => ({ id: d.disadvantage_id, name: d.disadvantage_name })));
                setAdditionalImages(response.images.map(img => ({
                    uri: img.image_path,
                    name: `image_${img.image_id}.jpg`,
                })));
                setRedBookImages([]);
            } catch (error) {
                Alert.alert('Error', error.message || 'Failed to load property data.');
            } finally {
                setIsLoading(false);
                setRefreshing(false);
            }
        } else {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [propertyId, handleDistrictChange]);

    useEffect(() => {
        fetchPropertyData();
    }, [fetchPropertyData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPropertyData();
    }, [fetchPropertyData]);

    const handleDistrictChange = useCallback(async (districtValue) => {
        setFormData((prev) => ({ ...prev, district: districtValue, ward: null, street: '' }));
        setFilteredStreets([]);
        if (!districtValue) {
            setWards([]);
            setStreets([]);
            return;
        }

        if (locationCache[districtValue]) {
            setWards(locationCache[districtValue].wards);
            setStreets(locationCache[districtValue].streets);
            setFilteredStreets(locationCache[districtValue].streets);
            return;
        }

        try {
            setIsLoading(true);
            const { wards, streets } = await fetchWards(districtValue);
            setWards(wards);
            setStreets(streets);
            setFilteredStreets(streets);
            setLocationCache((prev) => ({
                ...prev,
                [districtValue]: { wards, streets },
            }));
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to fetch wards and streets.');
            setWards([]);
            setStreets([]);
            setFilteredStreets([]);
        } finally {
            setIsLoading(false);
        }
    }, [locationCache]);

    const handleStreetInputChange = useCallback(
        (text) => {
            setFormData((prev) => ({ ...prev, street: text }));
            if (text.trim() === '') {
                setFilteredStreets(streets);
            } else {
                const filtered = streets.filter((item) =>
                    item.Name.toLowerCase().includes(text.toLowerCase())
                );
                setFilteredStreets(filtered);
            }
        },
        [streets]
    );

    const handleStreetSelect = useCallback((streetName) => {
        setFormData((prev) => ({ ...prev, street: streetName }));
        setFilteredStreets([]);
    }, []);

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleChangePrice = (name, value) => {
        const numericValue = Number(value.replace(/[^0-9]/g, ''));
        setViewPrice(formatPriceUnit(numericValue));
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleToggleProsCons = (type, value) => {
        setFormData((prev) => {
            const updatedSet = new Set(prev[type]);
            updatedSet.has(value) ? updatedSet.delete(value) : updatedSet.add(value);
            return { ...prev, [type]: updatedSet };
        });
    };

    const handleSubmit = async () => {
        const missingFields = [];
        if (!formData.transactionType) missingFields.push('Loại Giao Dịch');
        if (!formData.propertyType) missingFields.push('Loại BĐS');
        if (!formData.district) missingFields.push('Quận Huyện');
        if (!formData.ward) missingFields.push('Phường/Xã');
        if (!formData.street.trim()) missingFields.push('Đường');
        if (!formData.houseNumber.trim()) missingFields.push('Số Nhà');
        if (!formData.status) missingFields.push('Trạng thái giao dịch');
        if (!formData.assetType) missingFields.push('Loại Hình');

        if (missingFields.length > 0) {
            Alert.alert('Missing Fields', `Vui lòng điền: ${missingFields.join(', ')}`);
            return;
        }

        try {
            setIsSubmitting(true);
            const advantagesIds = Array.from(formData.selectedPros).map(name => prosOptions.find(opt => opt.name === name)?.id).filter(id => id !== undefined);
            const disadvantagesIds = Array.from(formData.selectedCons).map(name => consOptions.find(opt => opt.name === name)?.id).filter(id => id !== undefined);

            const propertyData = {
                listing_types_id: formData.transactionType === 'Bán' ? 1 : 2,
                property_type_id: parseInt(formData.propertyType, 10),
                transaction_status_id: parseInt(formData.status, 10),
                asset_type_id: parseInt(formData.assetType, 10),
                location_type_id: formData.locationType ? parseInt(formData.locationType, 10) : null,
                city: formData.city,
                district_county: formData.district,
                ward_commune: formData.ward,
                street_name: formData.street,
                house_number: formData.houseNumber,
                plot_number: formData.lotNumber,
                sheet_number: formData.sheetNumber,
                lot_number: formData.blockNumber,
                region: formData.areaDescription,
                price: formData.price ? formData.price : '',
                final_price: formData.final_price || null,
                price_unit: formData.priceUnit,
                price_rate: formData.priceRate,
                area_total: formData.landArea,
                area_width: formData.landWidth,
                area_length: formData.landLength,
                area_back_side: formData.backWidth,
                planned_construction_area: formData.plannedArea,
                planned_width: formData.plannedWidth,
                planned_length: formData.plannedLength,
                planned_back_side: formData.plannedBackWidth,
                num_bedrooms: formData.beds,
                num_toilets: formData.baths,
                product_type: formData.productType,
                direction_id: formData.direction,
                land_type_id: formData.landType,
                wide_road: formData.streetWidth,
                usable_area: formData.usedArea,
                num_floors: formData.floors,
                num_basements: formData.basements,
                has_vat_invoice: formData.hasTaxContract ? 1 : 0,
                has_rental_contract: formData.hasLeaseContract ? 1 : 0,
                has_deposit: formData.isUnderNegotiation ? 1 : 0,
                contact_name: formData.contactName,
                phone_number: formData.contactPhone,
                has_lucky_money: formData.hasLuckyMoney ? 1 : 0,
                description: formData.notes,
                advantages: advantagesIds,
                disadvantages: disadvantagesIds,
            };

            if (propertyId) {
                await updateProperty(propertyId, propertyData);
                showNotification('Đã cập nhật bất động sản thành công!', 'info');
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Không thể lưu bất động sản.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleSaveContact = (newContact) => {
        setFormData((prev) => ({
            ...prev,
            contactName: newContact.name || prev.contactName,
            contactPhone: newContact.phone || prev.contactPhone,
        }));
        setIsContactModalVisible(false);
    };

    const checkPermissions = async () => {
        const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
        const result = await check(permission);
        if (result !== RESULTS.GRANTED) {
            const requestResult = await request(permission);
            if (requestResult !== RESULTS.GRANTED) {
                Alert.alert('Quyền bị từ chối', 'Vui lòng cấp quyền truy cập thư viện ảnh trong cài đặt.');
                return false;
            }
        }
        return true;
    };

    const handleImagePicker = async (imageType) => {
        const hasPermission = await checkPermissions();
        if (!hasPermission) return;
        const maxImages = 10;
        const currentImages = imageType === 'redBook' ? redBookImages : additionalImages;
        if (currentImages.length >= maxImages) {
            Alert.alert('Giới hạn', `Bạn chỉ có thể tải lên tối đa ${maxImages} hình ảnh ${imageType === 'redBook' ? 'sổ hồng' : 'bổ sung'}.`);
            return;
        }

        const options = {
            mediaType: 'photo',
            quality: 1,
            maxWidth: 1024,
            maxHeight: 1024,
            includeBase64: false,
            selectionLimit: 0,
        };

        try {
            setIsPickingImage(true);
            const result = await launchImageLibrary(options);
            if (result.didCancel) {
                console.log('User cancelled image picker');
                return;
            }
            if (result.errorCode) {
                Alert.alert('Lỗi', `Không thể chọn hình ảnh: ${result.errorMessage}`);
                return;
            }

            const images = result.assets.map((image) => ({
                uri: image.uri,
                name: image.fileName || `image_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
                type: image.type || 'image/jpeg',
            }));

            const currentCount = currentImages.length;
            const allowedImages = images.slice(0, maxImages - currentCount);

            if (allowedImages.length < images.length) {
                Alert.alert('Cảnh báo', `Chỉ có thể thêm ${allowedImages.length} hình ảnh do giới hạn tối đa ${maxImages}.`);
            }

            if (propertyId) {
                try {
                    const uploadType = imageType === 'redBook' ? 'legal' : 'other';
                    const uploadedImages = await uploadImage(propertyId, allowedImages, uploadType);
                    const formattedImages = uploadedImages.map((img, index) => ({
                        uri: img.image_path || allowedImages[index].uri,
                        name: allowedImages[index].name,
                        type: allowedImages[index].type,
                    }));

                    if (imageType === 'redBook') {
                        setRedBookImages((prev) => [...prev, ...formattedImages]);
                    } else {
                        setAdditionalImages((prev) => [...prev, ...formattedImages]);
                    }
                    Alert.alert('Thành công', `Đã tải lên ${allowedImages.length} hình ảnh.`);
                } catch (error) {
                    Alert.alert('Lỗi', error.message || 'Không thể tải lên hình ảnh.');
                    console.error('Image upload error:', error);
                    if (imageType === 'redBook') {
                        setRedBookImages((prev) => [...prev, ...allowedImages]);
                    } else {
                        setAdditionalImages((prev) => [...prev, ...allowedImages]);
                    }
                }
            } else {
                if (imageType === 'redBook') {
                    setRedBookImages((prev) => [...prev, ...allowedImages]);
                } else {
                    setAdditionalImages((prev) => [...prev, ...allowedImages]);
                }
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chọn hình ảnh.');
            console.error('Image picker error:', error);
        } finally {
            setIsPickingImage(false);
        }
    };

    const handleRemoveImage = (imageType, indexToRemove) => {
        if (imageType === 'redBook') {
            setRedBookImages((prev) => prev.filter((_, index) => index !== indexToRemove));
        } else {
            setAdditionalImages((prev) => prev.filter((_, index) => index !== indexToRemove));
        }
    };

    const renderDataForm = () => (
        <>
            <Section title="Thông tin cơ bản">
                <View style={styles.fieldRow}>
                    <InputGroup label="Vị Trí BĐS" isRequired>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.locationType}
                                onValueChange={(itemValue) => handleChange('locationType', itemValue)}
                                style={styles.picker}
                                enabled={!isLoading}
                            >
                                {locationTypeOptions.map((item) => (
                                    <Picker.Item
                                        key={item.value || 'placeholder'}
                                        label={item.label}
                                        value={item.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </InputGroup>
                </View>
                <View style={styles.fieldRow}>
                    <InputGroup label="Giá" isRequired>
                        <TextInput
                            style={styles.input}
                            value={formData.price}
                            onChangeText={(text) => handleChangePrice('price', text)}
                            keyboardType="numeric"
                            accessibilityLabel="Nhập giá"
                            editable={!isLoading}
                        />
                    </InputGroup>

                </View>
                <View style={styles.fieldRow}>
                    <View>
                        <Text>{viewPrice}</Text>
                    </View>
                </View>
                <View style={styles.fieldRow}>
                    <InputGroup label="Giá chốt">
                        <TextInput
                            style={styles.input}
                            value={formData.final_price}
                            onChangeText={(text) => handleChange('final_price', text)}
                            accessibilityLabel="Giá chốt"
                            editable={!isLoading}
                        />
                    </InputGroup>
                </View>
                {/* <View style={styles.fieldRow}>
                    <View style={styles.switchRow}>

                        <Switch
                            trackColor={{ false: colors.border, true: colors.accent }}
                            thumbColor={isHasRentalContract ? colors.cardBackground : colors.cardBackground}
                            onValueChange={isHasRentalContract}
                            value={isHasRentalContract}
                        />
                        <Text style={styles.switchLabel}>Hợp đồng thuê</Text>
                    </View>
                </View> */}
            </Section>
            <Section title="Thông tin giao dịch">
                <View style={styles.fieldRow}>
                    <InputGroup label="Loại Giao Dịch" isRequired>
                        <View style={styles.radioGroup}>
                            {transactionTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.radioButton, formData.transactionType === type && styles.radioButtonSelected]}
                                    onPress={() => handleChange('transactionType', type)}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.radioText, formData.transactionType === type && styles.radioTextSelected]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </InputGroup>
                    <InputGroup label="Loại Tài Sản" isRequired>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.assetType}
                                onValueChange={(itemValue) => handleChange('assetType', itemValue)}
                                style={styles.picker}
                                enabled={!isLoading}
                            >
                                {assetTypeOptions.map((item) => (
                                    <Picker.Item
                                        key={item.value || 'placeholder'}
                                        label={item.label}
                                        value={item.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </InputGroup>
                </View>
                <View style={styles.fullWidthField}>
                    <InputGroup label="Trạng thái giao dịch" isRequired>
                        <View style={styles.checkboxGroup}>
                            {statusOptions.map((option) => (
                                <View key={option.value} style={styles.statusCheckboxItem}>
                                    <TouchableOpacity
                                        onPress={() => handleChange('status', option.value)}
                                        disabled={isFetchingProperty || isSubmitting}
                                        accessibilityRole="radio"
                                        accessibilityLabel={`Chọn trạng thái ${option.label}`}
                                    >
                                        <Icon
                                            name={formData.status === option.value ? 'radiobox-marked' : 'radiobox-blank'}
                                            size={20}
                                            color={formData.status === option.value ? colors.secondary : '#888'}
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.checkboxText}>{option.label}</Text>
                                </View>
                            ))}
                            {statusOptions.length % 2 !== 0 && (
                                <View style={[styles.statusCheckboxItem, styles.placeholderItem]} />
                            )}
                        </View>
                    </InputGroup>
                </View>
            </Section>
            <Section title="Địa Chỉ BĐS">
                <View style={styles.fieldRow}>
                    <InputGroup label="Tỉnh Thành" isRequired>
                        <View style={styles.staticInput}>
                            <Text style={styles.staticText}>{formData.city}</Text>
                        </View>
                    </InputGroup>
                    <InputGroup label="Quận Huyện" isRequired>
                        <View style={styles.pickerContainer}>
                            <TextInput
                                style={styles.input}
                                value={formData.district}
                                placeholder="Nhập Quận huyện"
                                placeholderTextColor="#888"
                                accessibilityLabel="Nhập Quận huyện"
                                editable={!isLoading}
                            />
                        </View>
                    </InputGroup>
                </View>
                <View style={styles.fieldRow}>
                    <InputGroup label="Phường / Xã" isRequired>
                        <View style={styles.pickerContainer}>
                            <TextInput
                                style={styles.input}
                                value={formData.ward}
                                placeholder="Nhập Tên Phường"
                                placeholderTextColor="#888"
                                accessibilityLabel="Nhập Tên Phường"
                                editable={!isLoading}
                            />
                        </View>
                    </InputGroup>
                </View>
                <View style={styles.fieldRow}>
                    <InputGroup label="Đường" isRequired>
                        <TextInput
                            style={styles.input}
                            value={formData.street}
                            onChangeText={handleStreetInputChange}
                            placeholder="Nhập tên đường"
                            placeholderTextColor="#888"
                            accessibilityLabel="Nhập tên đường"
                            editable={!isLoading}
                        />
                        {filteredStreets.length > 0 && formData.street.trim() !== '' && (
                            <ScrollView
                                style={styles.suggestionList}
                                nestedScrollEnabled={true}
                                keyboardShouldPersistTaps="handled"
                            >
                                {filteredStreets.map((item) => (
                                    <TouchableOpacity
                                        key={item?.id ? item.id.toString() : `street-${index}`}
                                        style={styles.suggestionItem}
                                        onPress={() => handleStreetSelect(item.Name)}
                                        accessibilityLabel={`Chọn đường ${item.Name}`}
                                    >
                                        <Text style={styles.suggestionText}>{item.Name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </InputGroup>
                </View>
                <View style={styles.fieldRow}>
                    <InputGroup label="Số Nhà" isRequired>
                        <TextInput
                            style={styles.input}
                            value={formData.houseNumber}
                            onChangeText={(text) => handleChange('houseNumber', text)}
                            accessibilityLabel="Nhập số nhà"
                            editable={!isLoading}
                        />
                    </InputGroup>
                    <InputGroup label="Số Thửa">
                        <TextInput
                            style={styles.input}
                            value={formData.lotNumber}
                            onChangeText={(text) => handleChange('lotNumber', text)}
                            accessibilityLabel="Nhập số thửa"
                            editable={!isLoading}
                        />
                    </InputGroup>
                </View>
                <View style={styles.fieldRow}>
                    <InputGroup label="Số Tờ">
                        <TextInput
                            style={styles.input}
                            value={formData.sheetNumber}
                            onChangeText={(text) => handleChange('sheetNumber', text)}
                            accessibilityLabel="Nhập số tờ"
                            editable={!isLoading}
                        />
                    </InputGroup>
                    <InputGroup label="Số Lô">
                        <TextInput
                            style={styles.input}
                            value={formData.blockNumber}
                            onChangeText={(text) => handleChange('blockNumber', text)}
                            accessibilityLabel="Nhập số lô"
                            editable={!isLoading}
                        />
                    </InputGroup>
                </View>
                <View style={styles.fullWidthField}>
                    <InputGroup label="Khu Vực">
                        <TextInput
                            style={styles.input}
                            value={formData.areaDescription}
                            onChangeText={(text) => handleChange('areaDescription', text)}
                            placeholder="Ví dụ: CityLand, Trung Sơn, Cư Xá Phú Lâm"
                            placeholderTextColor="#888"
                            accessibilityLabel="Nhập mô tả khu vực"
                            editable={!isLoading}
                        />
                    </InputGroup>
                </View>
            </Section>
            <Section title="Diện Tích Đất">
                <View style={styles.fieldRow}>
                    <InputGroup label="Ngang" isRequired>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.landWidth}
                            onChangeText={(text) => handleChange('landWidth', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                    <InputGroup label="Dài" isRequired>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.landLength}
                            onChangeText={(text) => handleChange('landLength', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                    <InputGroup label="Mặt Hậu">
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.backWidth}
                            onChangeText={(text) => handleChange('backWidth', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                </View>
                <View style={styles.fullWidthField}>
                    <InputGroup label="DT Công nhận" isRequired>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.landArea}
                            onChangeText={(text) => handleChange('landArea', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                </View>
            </Section>
            <Section title="Diện Tích Quy Hoạch">
                <View style={styles.fieldRow}>
                    <InputGroup label="Chiều rộng">
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.plannedWidth}
                            onChangeText={(text) => handleChange('plannedWidth', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                    <InputGroup label="Chiều dài">
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.plannedLength}
                            onChangeText={(text) => handleChange('plannedLength', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                    <InputGroup label="Mặt Hậu">
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.plannedBackWidth}
                            onChangeText={(text) => handleChange('plannedBackWidth', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                </View>
                <View style={styles.fullWidthField}>
                    <InputGroup label="DT Xây dựng">
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.plannedArea}
                            onChangeText={(text) => handleChange('plannedArea', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                </View>
            </Section>
            <Section title="Thông tin khác">
                <View style={styles.fieldRow}>
                    <InputGroup label="Loại sản phẩm" isRequired>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.propertyType}
                                onValueChange={(itemValue) => handleChange('propertyType', itemValue)}
                                style={styles.picker}
                                enabled={!isLoading}
                            >
                                {productTypeOptions.map((item) => (
                                    <Picker.Item
                                        key={item.value || 'placeholder'}
                                        label={item.label}
                                        value={item.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </InputGroup>
                </View>
                <View style={styles.fieldRow}>

                    <InputGroup label="Hướng">
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.direction}
                                onValueChange={(itemValue) => handleChange('direction', itemValue)}
                                style={styles.picker}
                                enabled={!isLoading}
                            >
                                {directionOptions.map((item) => (
                                    <Picker.Item
                                        key={item.value || 'placeholder'}
                                        label={item.label}
                                        value={item.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </InputGroup>
                    <InputGroup label="Loại đất">
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.landType}
                                onValueChange={(itemValue) => handleChange('landType', itemValue)}
                                style={styles.picker}
                                enabled={!isLoading}
                            >
                                {landTypeOptions.map((item) => (
                                    <Picker.Item
                                        key={item.value || 'placeholder'}
                                        label={item.label}
                                        value={item.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </InputGroup>
                </View>
                <View style={styles.fieldRow}>
                    <InputGroup label="Đường rộng">
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.streetWidth}
                            onChangeText={(text) => handleChange('streetWidth', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                    <InputGroup label="DT Sử dụng">
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.usedArea}
                            onChangeText={(text) => handleChange('usedArea', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                </View>
                <View style={styles.fieldRow}>
                    <InputGroup label="Số Tầng">
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.floors}
                            onChangeText={(text) => handleChange('floors', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                    <InputGroup label="Số tầng hầm">
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.basements}
                            onChangeText={(text) => handleChange('basements', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                    <InputGroup label="PN">
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.beds}
                            onChangeText={(text) => handleChange('beds', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                    <InputGroup label="WC">
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.baths}
                            onChangeText={(text) => handleChange('baths', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                </View>
            </Section>
            <Section title="Ưu điểm & Nhược điểm">
                <View style={styles.prosConsContainer}>
                    <View style={styles.prosConsColumn}>
                        <Text style={styles.prosConsTitle}>Ưu điểm</Text>
                        {prosOptions.map((option) => (
                            <View key={option.id} style={styles.prosConsCheckboxItem}>
                                <TouchableOpacity
                                    onPress={() => handleToggleProsCons('selectedPros', option.name)}
                                    disabled={isFetchingProperty || isSubmitting}
                                    accessibilityRole="checkbox"
                                    accessibilityLabel={`Chọn ưu điểm ${option.name}`}
                                >
                                    <Icon
                                        name={formData.selectedPros.has(option.name) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                        size={20}
                                        color={formData.selectedPros.has(option.name) ? colors.secondary : '#888'}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.checkboxText}>{option.name}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.prosConsColumn}>
                        <Text style={styles.prosConsTitle}>Nhược điểm</Text>
                        {consOptions.map((option) => (
                            <View key={option.id} style={styles.prosConsCheckboxItem}>
                                <TouchableOpacity
                                    onPress={() => handleToggleProsCons('selectedCons', option.name)}
                                    disabled={isFetchingProperty || isSubmitting}
                                    accessibilityRole="checkbox"
                                    accessibilityLabel={`Chọn nhược điểm ${option.name}`}
                                >
                                    <Icon
                                        name={formData.selectedCons.has(option.name) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                        size={20}
                                        color={formData.selectedCons.has(option.name) ? colors.secondary : '#888'}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.checkboxText}>{option.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Section>
            <Section title="Ghi chú">
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={4}
                    value={formData.notes}
                    onChangeText={(text) => handleChange('notes', text)}
                    editable={!isLoading}
                />
            </Section>
        </>
    );

    const renderImagesForm = () => (
        <View style={styles.imagesTabContent}>
            <Text style={styles.imageSectionTitle}>Hình ảnh đã tải lên</Text>
            <View style={styles.imageUploadRow}>
                <View style={styles.imageUploadBox}>
                    <Text style={styles.uploadBoxTitle}>SỔ HỒNG | GIẤY TỜ PHÁP LÝ</Text>
                    <TouchableOpacity style={styles.uploadBoxButton} onPress={() => handleImagePicker('redBook')} disabled={isLoading}>
                        <Icon name="cloud-upload-outline" size={40} color={colors.secondary} />
                        <Text style={styles.uploadBoxText}>Chọn hoặc kéo thả</Text>
                        <Text style={styles.uploadBoxSubText}>File: pdf, jpg, png, jpeg, webp, heic!</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.imageUploadBox}>
                    <Text style={styles.uploadBoxTitle}>HÌNH ẢNH BỔ SUNG</Text>
                    <TouchableOpacity style={styles.uploadBoxButton} onPress={() => handleImagePicker('additional')} disabled={isLoading}>
                        <Icon name="cloud-upload-outline" size={40} color={colors.secondary} />
                        <Text style={styles.uploadBoxText}>Chọn hoặc kéo thả</Text>
                        <Text style={styles.uploadBoxSubText}>File: pdf, jpg, png, jpeg, webp, heic!</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollContainer}>
                {redBookImages.map((image, index) => (
                    <View key={`redBook_${index}`} style={styles.imagePreviewContainer}>
                        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                            onPress={() => handleRemoveImage('redBook', index)}
                            style={styles.removeImageButton}
                            disabled={isLoading}
                        >
                            <Icon name="trash-can-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollContainer}>
                {additionalImages.map((image, index) => (
                    <View key={`additional_${index}`} style={styles.imagePreviewContainer}>
                        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                            onPress={() => handleRemoveImage('additional', index)}
                            style={styles.removeImageButton}
                            disabled={isLoading}
                        >
                            <Icon name="trash-can-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>DỮ LIỆU NHÀ ĐẤT</Text>
                <TouchableOpacity onPress={handleGoBack} style={styles.closeButton} disabled={isLoading}>
                    <Icon name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, selectedTab === 'Dữ Liệu Nhà Đất' && styles.tabButtonSelected]}
                    onPress={() => setSelectedTab('Dữ Liệu Nhà Đất')}
                    disabled={isLoading}
                >
                    <Text style={[styles.tabButtonText, selectedTab === 'Dữ Liệu Nhà Đất' && styles.tabButtonTextSelected]}>
                        DỮ LIỆU NHÀ ĐẤT
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, selectedTab === 'Sổ Hồng & Hình Ảnh' && styles.tabButtonSelected]}
                    onPress={() => setSelectedTab('Sổ Hồng & Hình Ảnh')}
                    disabled={isLoading}
                >
                    <Text style={[styles.tabButtonText, selectedTab === 'Sổ Hồng & Hình Ảnh' && styles.tabButtonTextSelected]}>
                        SỔ HỒNG & HÌNH ẢNH
                    </Text>
                </TouchableOpacity>
            </View>
            {isLoading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.secondary} />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.formContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.secondary]}
                            tintColor={colors.secondary}
                        />
                    }
                >
                    {selectedTab === 'Dữ Liệu Nhà Đất' ? renderDataForm() : renderImagesForm()}
                </ScrollView>
            )}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
                    onPress={handleGoBack}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>TRỞ LẠI</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.continueButton, isLoading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>{isLoading ? 'ĐANG XỬ LÝ...' : 'LƯU'}</Text>
                </TouchableOpacity>
            </View>
            <AddContactForm
                visible={isContactModalVisible}
                onClose={() => setIsContactModalVisible(false)}
                onSave={handleSaveContact}
            />
            {/* <HasRentalContract
                visible={isContactModalVisible}
                onClose={() => setIsContactModalVisible(false)}
                onSave={handleSaveContact}
            /> */}
            <TouchableOpacity
                style={[styles.fab, isLoading && styles.buttonDisabled]}
                onPress={() => setIsContactModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Thêm Liên Hệ"
                disabled={isLoading}
            >
                <Icon name="account-plus" size={28} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F3F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    closeButton: {
        padding: 5,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        alignItems: 'center',
    },
    tabButtonSelected: {
        borderBottomColor: colors.secondary,
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.textSecondary,
    },
    tabButtonTextSelected: {
        color: colors.textPrimary,
    },
    formContainer: {
        flex: 1,
        padding: 10,
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
    sectionContainer: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingVertical: 5,
    },
    switchLabel: {
        fontSize: 15,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    inputGroup: {
        flex: 1,
        marginRight: 10,
    },
    fullWidthField: {
        marginBottom: 10,
    },
    label: {
        fontSize: 13,
        color: colors.textPrimary,
        marginBottom: 5,
        fontWeight: '600',
    },
    requiredStar: {
        color: colors.error,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#fff',
        fontSize: 14,
        color: colors.textPrimary,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    staticInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#f1f1f1',
        padding: 10,
        justifyContent: 'center',
    },
    staticText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
        height: 40,
        justifyContent: 'center',
    },
    picker: {
        height: 40,
        width: '100%',
        color: colors.textPrimary,
    },
    radioGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioButton: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 10,
        backgroundColor: '#fff',
    },
    radioButtonSelected: {
        backgroundColor: colors.secondary,
        borderColor: colors.secondary,
    },
    radioText: {
        color: colors.textPrimary,
    },
    radioTextSelected: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    checkboxGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    placeholderItem: {
        width: '50%',
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    checkboxText: {
        marginLeft: 5,
        fontSize: 13,
        color: colors.textPrimary,
    },
    prosConsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    prosConsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statusCheckboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#f0f0f0',
    },
    prosConsCheckboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#e0e0e0',
    },
    prosConsColumn: {
        width: '48%',
    },
    prosConsTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: colors.textPrimary,
        marginBottom: 8,
    },
    prosConsCheckboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    continueButton: {
        backgroundColor: colors.secondary,
        flex: 1,
        marginLeft: 10,
        paddingVertical: 12,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: colors.error,
        flex: 1,
        marginRight: 10,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    imagesTabContent: {
        flex: 1,
        padding: 10,
    },
    imageSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 10,
    },
    imageUploadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    imageUploadBox: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    uploadBoxTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.secondary,
        marginBottom: 10,
    },
    uploadBoxButton: {
        alignItems: 'center',
    },
    uploadBoxText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 5,
    },
    uploadBoxSubText: {
        fontSize: 10,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 5,
    },
    imageScrollContainer: {
        marginBottom: 20,
    },
    imagePreviewContainer: {
        width: 150,
        height: 150,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        padding: 3,
    },
    suggestionList: {
        maxHeight: 150,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginTop: 5,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    suggestionText: {
        fontSize: 14,
        color: colors.textPrimary,
    },
    fab: {
        position: 'absolute',
        bottom: 100,
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
});

export default ListingFormAdvanced;