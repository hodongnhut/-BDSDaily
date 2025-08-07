import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../styles/colors';
import AddContactForm from './AddContactForm';
import { fetchWards, updateProperty, getProperty } from '../services/api';
import {
    transactionTypes,
    propertyTypes,
    statusOptions,
    assetTypeOptions,
    locationTypeOptions,
    productTypeOptions,
    directionOptions,
    landTypeOptions,
    priceUnitOptions,
    districtOptions,
    prosConsOptions
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
    const { id } = route.params;
    const [selectedTab, setSelectedTab] = useState('Dữ Liệu Nhà Đất');
    const [isContactModalVisible, setIsContactModalVisible] = useState(false);
    const [wards, setWards] = useState([]);
    const [streets, setStreets] = useState([]);
    const [filteredStreets, setFilteredStreets] = useState([]);
    const [locationCache, setLocationCache] = useState({});
    const [isLoading, setIsLoading] = useState(false);

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
    });

    const [redBookImages, setRedBookImages] = useState([]);
    const [additionalImages, setAdditionalImages] = useState([]);

    useEffect(() => {
        const property_id = id;
        console.log(property_id);
    }, [navigation]);

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

    const handleToggleProsCons = (type, value) => {
        setFormData((prev) => {
            const newSet = new Set(prev[type]);
            if (newSet.has(value)) {
                newSet.delete(value);
            } else {
                newSet.add(value);
            }
            return { ...prev, [type]: newSet };
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
            setIsLoading(true);
            const propertyData = {
                listing_types_id: formData.transactionType === 'Bán' ? 1 : 2,
                property_type_id: parseInt(formData.propertyType, 10),
                status: parseInt(formData.status, 10),
                asset_type: parseInt(formData.assetType, 10),
                provinces: formData.city,
                districts: formData.district,
                wards: formData.ward,
                streets: formData.street,
                house_number: formData.houseNumber,
                plot_number: formData.lotNumber,
                sheet_number: formData.sheetNumber,
                lot_number: formData.blockNumber,
                region: formData.areaDescription,
                price: formData.price,
                price_unit: formData.priceUnit,
                price_rate: formData.priceRate,
                land_area: formData.landArea,
                land_width: formData.landWidth,
                land_length: formData.landLength,
                back_width: formData.backWidth,
                planned_area: formData.plannedArea,
                planned_width: formData.plannedWidth,
                planned_length: formData.plannedLength,
                planned_back_width: formData.plannedBackWidth,
                beds: formData.beds,
                baths: formData.baths,
                product_type: formData.productType,
                direction: formData.direction,
                land_type: formData.landType,
                street_width: formData.streetWidth,
                used_area: formData.usedArea,
                floors: formData.floors,
                basements: formData.basements,
                has_tax_contract: formData.hasTaxContract,
                has_lease_contract: formData.hasLeaseContract,
                is_under_negotiation: formData.isUnderNegotiation,
                contact_name: formData.contactName,
                contact_phone: formData.contactPhone,
                has_lucky_money: formData.hasLuckyMoney,
                notes: formData.notes,
                pros: Array.from(formData.selectedPros),
                cons: Array.from(formData.selectedCons),
            };
            await createProperty(propertyData);
            Alert.alert('Thành công', 'Đã tạo bất động sản thành công.');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Không thể tạo bất động sản.');
        } finally {
            setIsLoading(false);
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

    const handleImagePicker = (imageType) => {
        const dummyImageUri = 'https://via.placeholder.com/150';
        const newImage = { uri: dummyImageUri, name: `ảnh_${Math.random().toString(36).substring(7)}.jpg` };
        if (imageType === 'redBook') {
            setRedBookImages((prev) => [...prev, newImage]);
        } else {
            setAdditionalImages((prev) => [...prev, newImage]);
        }
    };

    const handleRemoveImage = (imageType, indexToRemove) => {
        if (imageType === 'redBook') {
            setRedBookImages((prev) => prev.filter((_, index) => index !== indexToRemove));
        } else {
            setAdditionalImages((prev) => prev.filter((_, index) => index !== indexToRemove));
        }
    };

    // Render street suggestion item
    const renderStreetSuggestion = ({ item }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleStreetSelect(item.Name)}
            accessibilityLabel={`Chọn đường ${item.Name}`}
        >
            <Text style={styles.suggestionText}>{item.Name}</Text>
        </TouchableOpacity>
    );

    // Component hiển thị nội dung của tab "Dữ Liệu Nhà Đất"
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
                                    <Picker.Item key={item.value || 'placeholder'} label={item.label} value={item.value} />
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
                            onChangeText={(text) => handleChange('price', text)}
                            accessibilityLabel="Nhập giá"
                            editable={!isLoading}
                        />
                    </InputGroup>
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
                <View style={styles.fieldRow}>

                </View>
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
                    <InputGroup label="Loại Sản Phẩm" isRequired>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.propertyType}
                                onValueChange={(itemValue) => handleChange('propertyType', itemValue)}
                                style={styles.picker}
                                enabled={!isLoading}
                            >
                                <Picker.Item label="Chọn Loại BĐS" value={null} />
                                {propertyTypes.map((type) => (
                                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                                ))}
                            </Picker>
                        </View>
                    </InputGroup>

                </View>


                <View style={[styles.fieldRow, { marginTop: 10 }]}>
                    <InputGroup label="Loại Tài Sản" isRequired>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.assetType}
                                onValueChange={(itemValue) => handleChange('assetType', itemValue)}
                                style={styles.picker}
                                enabled={!isLoading}
                            >
                                {assetTypeOptions.map((item) => (
                                    <Picker.Item key={item.value || 'placeholder'} label={item.label} value={item.value} />
                                ))}
                            </Picker>
                        </View>
                    </InputGroup>

                </View>

                <View style={styles.fullWidthField}>
                    <InputGroup label="Trạng thái giao dịch" isRequired>
                        <View style={styles.checkboxGroup}>
                            {statusOptions.map((option) => (
                                <View key={option.value} style={styles.checkboxItem}>
                                    <TouchableOpacity
                                        onPress={() => handleChange('status', option.value)}
                                        disabled={isLoading}
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
                            <Picker
                                selectedValue={formData.district}
                                onValueChange={handleDistrictChange}
                                style={styles.picker}
                                enabled={!isLoading}
                            >
                                {districtOptions.map((item) => (
                                    <Picker.Item key={item.value || 'placeholder'} label={item.label} value={item.value} />
                                ))}
                            </Picker>
                        </View>
                    </InputGroup>
                </View>
                <View style={styles.fieldRow}>
                    <InputGroup label="Phường / Xã" isRequired>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.ward}
                                onValueChange={(itemValue) => handleChange('ward', itemValue)}
                                style={styles.picker}
                                enabled={wards.length > 0 && !isLoading}
                            >
                                <Picker.Item label="Chọn Phường / Xã" value={null} />
                                {wards.map((item) => (
                                    <Picker.Item key={item.value} label={item.Name} value={item.Name} />
                                ))}
                            </Picker>
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
                            <FlatList
                                style={styles.suggestionList}
                                data={filteredStreets}
                                renderItem={renderStreetSuggestion}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="handled"
                            />
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
                    <InputGroup label="Chiều rộng">
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={formData.landWidth}
                            onChangeText={(text) => handleChange('landWidth', text)}
                            editable={!isLoading}
                        />
                    </InputGroup>
                    <InputGroup label="Chiều dài">
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
                    <InputGroup label="DT Công nhận">
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
                    <InputGroup label="Loại sản phẩm">
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.productType}
                                onValueChange={(itemValue) => handleChange('productType', itemValue)}
                                style={styles.picker}
                                enabled={!isLoading}
                            >
                                {productTypeOptions.map((item) => (
                                    <Picker.Item key={item.value || 'placeholder'} label={item.label} value={item.value} />
                                ))}
                            </Picker>
                        </View>
                    </InputGroup>
                    <InputGroup label="Hướng">
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.direction}
                                onValueChange={(itemValue) => handleChange('direction', itemValue)}
                                style={styles.picker}
                                enabled={!isLoading}
                            >
                                {directionOptions.map((item) => (
                                    <Picker.Item key={item.value || 'placeholder'} label={item.label} value={item.value} />
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
                                    <Picker.Item key={item.value || 'placeholder'} label={item.label} value={item.value} />
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
                        {prosConsOptions.pros.map((option) => (
                            <View key={option.id} style={styles.checkboxItem}>
                                <TouchableOpacity
                                    onPress={() => handleToggleProsCons('selectedPros', option.name)}
                                    disabled={isLoading}
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
                        {prosConsOptions.cons.map((option) => (
                            <View key={option.id} style={styles.checkboxItem}>
                                <TouchableOpacity
                                    onPress={() => handleToggleProsCons('selectedCons', option.disadvantage_name)}
                                    disabled={isLoading}
                                >
                                    <Icon
                                        name={formData.selectedCons.has(option.disadvantage_name) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                        size={20}
                                        color={formData.selectedCons.has(option.disadvantage_name) ? colors.secondary : '#888'}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.checkboxText}>{option.disadvantage_name}</Text>
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

    // Component hiển thị nội dung của tab "Sổ Hồng & Hình Ảnh"
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
                    <View key={index} style={styles.imagePreviewContainer}>
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
                    <View key={index} style={styles.imagePreviewContainer}>
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

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                {selectedTab === 'Dữ Liệu Nhà Đất' ? renderDataForm() : renderImagesForm()}
            </ScrollView>

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
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        marginBottom: 5,
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
    prosConsColumn: {
        width: '48%',
    },
    prosConsTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
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