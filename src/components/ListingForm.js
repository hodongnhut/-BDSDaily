import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../styles/colors';
import { fetchWards, createProperty } from '../services/api';
import { districtOptions, propertyTypes } from '../data/fromPreparing';

const ListingForm = ({ onClose, navigation }) => {
    const [transactionType, setTransactionType] = useState('Bán');
    const [propertyType, setPropertyType] = useState('');
    const [district, setDistrict] = useState(null);
    const [ward, setWard] = useState(null);
    const [street, setStreet] = useState('');
    const [wards, setWards] = useState([]);
    const [streets, setStreets] = useState([]);
    const [filteredStreets, setFilteredStreets] = useState([]);
    const [houseNumber, setHouseNumber] = useState('');
    const [lotNumber, setLotNumber] = useState('');
    const [sheetNumber, setSheetNumber] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [areaDescription, setAreaDescription] = useState('');
    const [locationCache, setLocationCache] = useState({});
    const [isLoading, setIsLoading] = useState(false);


    const handleDistrictChange = useCallback(async (districtValue) => {
        setDistrict(districtValue);
        setWard(null);
        setStreet('');
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
            setStreet(text);
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
        setStreet(streetName);
        setFilteredStreets([]);
    }, []);

    const handleContinue = async () => {
        const missingFields = [];
        if (!transactionType) missingFields.push('Loại Giao Dịch');
        if (!propertyType) missingFields.push('Loại BĐS');
        if (!district) missingFields.push('Quận Huyện');
        if (!ward) missingFields.push('Phường/Xã');
        if (!street.trim()) missingFields.push('Đường');
        if (!houseNumber.trim()) missingFields.push('Số Nhà');

        if (missingFields.length > 0) {
            Alert.alert('Missing Fields', `Please fill in: ${missingFields.join(', ')}`);
            return;
        }

        try {
            setIsLoading(true);
            const propertyData = {
                listing_types_id: transactionType === 'Bán' ? 1 : 2,
                property_type_id: parseInt(propertyType, 10),
                provinces: 'Hồ Chí Minh',
                districts: district,
                wards: ward,
                streets: street,
                house_number: houseNumber,
                plot_number: lotNumber,
                sheet_number: sheetNumber,
                lot_number: blockNumber,
                region: areaDescription,
            };
            const response = await createProperty(propertyData);
            navigation.navigate('ListingFormAdvanced', { propertyId: response.property.property_id });
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to create property.');
        } finally {
            setIsLoading(false);
        }
    };

    const memoizedPropertyTypes = useMemo(() => propertyTypes || [], [propertyTypes]);
    const memoizedDistrictOptions = useMemo(() => districtOptions || [], [districtOptions]);

    const renderStreetSuggestion = ({ item }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleStreetSelect(item.Name)}
            accessibilityLabel={`Select street ${item.Name}`}
        >
            <Text style={styles.suggestionText}>{item.Name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>DỮ LIỆU NHÀ ĐẤT</Text>
                <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    accessibilityLabel="Close form"
                    disabled={isLoading}
                >
                    <Icon name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>
            <FlatList
                style={styles.formContainer}
                data={[]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={null}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <>
                        {/* Loại Giao Dịch */}
                        <View style={styles.fullWidthField}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.asterisk}>*</Text>
                                <Text style={styles.label}> Loại Giao Dịch</Text>
                            </View>
                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={[styles.radioButton, transactionType === 'Bán' && styles.radioButtonSelected]}
                                    onPress={() => setTransactionType('Bán')}
                                    accessibilityLabel="Select Bán"
                                    disabled={isLoading}
                                >
                                    <Text
                                        style={[styles.radioText, transactionType === 'Bán' && styles.radioTextSelected]}
                                    >
                                        Bán
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.radioButton,
                                        transactionType === 'Cho Thuê' && styles.radioButtonSelected,
                                    ]}
                                    onPress={() => setTransactionType('Cho Thuê')}
                                    accessibilityLabel="Select Cho Thuê"
                                    disabled={isLoading}
                                >
                                    <Text
                                        style={[
                                            styles.radioText,
                                            transactionType === 'Cho Thuê' && styles.radioTextSelected,
                                        ]}
                                    >
                                        Cho Thuê
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Loại BĐS và Tỉnh Thành */}
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldGroup}>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.asterisk}>*</Text>
                                    <Text style={styles.label}> Loại BĐS</Text>
                                </View>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={propertyType}
                                        onValueChange={setPropertyType}
                                        style={styles.picker}
                                        accessibilityLabel="Select property type"
                                        enabled={!isLoading}
                                    >
                                        <Picker.Item label="Chọn Loại BĐS" value="" />
                                        {memoizedPropertyTypes.length > 0 ? (
                                            memoizedPropertyTypes.map((item) => (
                                                <Picker.Item key={item.value} label={item.label} value={item.value} />
                                            ))
                                        ) : (
                                            <Picker.Item label="No property types available" value="" />
                                        )}
                                    </Picker>
                                </View>
                            </View>
                            <View style={styles.fieldGroup}>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.asterisk}>*</Text>
                                    <Text style={styles.label}> Tỉnh Thành</Text>
                                </View>
                                <View style={styles.staticInput}>
                                    <Text style={styles.staticText}>Hồ Chí Minh</Text>
                                </View>
                            </View>
                        </View>

                        {/* Quận Huyện và Phường/Xã */}
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldGroup}>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.asterisk}>*</Text>
                                    <Text style={styles.label}> Quận Huyện</Text>
                                </View>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={district}
                                        onValueChange={handleDistrictChange}
                                        style={styles.picker}
                                        accessibilityLabel="Select district"
                                        enabled={!isLoading}
                                    >
                                        {memoizedDistrictOptions.length > 0 ? (
                                            memoizedDistrictOptions.map((item) => (
                                                <Picker.Item
                                                    key={item.value || 'placeholder'}
                                                    label={item.label}
                                                    value={item.value}
                                                    style={styles.pickerItem}
                                                />
                                            ))
                                        ) : (
                                            <Picker.Item label="No districts available" value="" />
                                        )}
                                    </Picker>
                                </View>
                            </View>
                            <View style={styles.fieldGroup}>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.asterisk}>*</Text>
                                    <Text style={styles.label}> Phường / Xã</Text>
                                </View>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={ward}
                                        onValueChange={setWard}
                                        style={styles.picker}
                                        enabled={wards.length > 0 && !isLoading}
                                        accessibilityLabel="Select ward"
                                    >
                                        <Picker.Item label="Chọn Phường / Xã" value={null} style={styles.pickerItem} />
                                        {wards.map((item) => (
                                            <Picker.Item
                                                key={item.id}
                                                label={item.Name}
                                                value={item.Name}
                                                style={styles.pickerItem}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        {/* Đường with Autocomplete */}
                        <View style={styles.fullWidthField}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.asterisk}>*</Text>
                                <Text style={styles.label}> Đường</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                value={street}
                                onChangeText={handleStreetInputChange}
                                placeholder="Nhập tên đường"
                                placeholderTextColor="#888"
                                accessibilityLabel="Enter street name"
                                editable={!isLoading}
                            />
                            {filteredStreets.length > 0 && street.trim() !== '' && (
                                <FlatList
                                    style={styles.id}
                                    data={filteredStreets}
                                    renderItem={renderStreetSuggestion}
                                    keyExtractor={(item) => item.id}
                                    keyboardShouldPersistTaps="handled"
                                />
                            )}
                        </View>

                        {/* Số Nhà và Số Thửa */}
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldGroup}>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.asterisk}>*</Text>
                                    <Text style={styles.label}> Số Nhà</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={houseNumber}
                                    onChangeText={setHouseNumber}
                                    accessibilityLabel="Enter house number"
                                    editable={!isLoading}
                                />
                            </View>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Số Thửa</Text>
                                <TextInput
                                    style={styles.input}
                                    value={lotNumber}
                                    onChangeText={setLotNumber}
                                    accessibilityLabel="Enter lot number"
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Số Tờ và Số Lô */}
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Số Tờ</Text>
                                <TextInput
                                    style={styles.input}
                                    value={sheetNumber}
                                    onChangeText={setSheetNumber}
                                    accessibilityLabel="Enter sheet number"
                                    editable={!isLoading}
                                />
                            </View>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Số Lô</Text>
                                <TextInput
                                    style={styles.input}
                                    value={blockNumber}
                                    onChangeText={setBlockNumber}
                                    accessibilityLabel="Enter block number"
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Khu Vực */}
                        <View style={styles.fullWidthField}>
                            <Text style={styles.label}>Khu Vực</Text>
                            <TextInput
                                style={styles.input}
                                value={areaDescription}
                                onChangeText={setAreaDescription}
                                placeholder="Ví dụ: CityLand, Trung Sơn, Cư Xá Phú Lâm"
                                placeholderTextColor="#888"
                                accessibilityLabel="Enter area description"
                                editable={!isLoading}
                            />
                        </View>
                    </>
                }
            />

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    accessibilityLabel="Cancel form"
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>HỦY</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.continueButton, isLoading && styles.buttonDisabled]}
                    onPress={handleContinue}
                    accessibilityLabel="Continue to next step"
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'ĐANG XỬ LÝ...' : 'TIẾP TỤC'}
                    </Text>
                </TouchableOpacity>
            </View>
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
    formContainer: {
        flex: 1,
        padding: 20,
    },
    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    fieldGroup: {
        flex: 1,
        marginRight: 10,
    },
    fullWidthField: {
        marginBottom: 15,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    asterisk: {
        fontSize: 14,
        color: 'red',
        fontWeight: '600',
    },
    label: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#fff',
        fontSize: 16,
        color: colors.textPrimary,
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
        fontSize: 16,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        color: colors.textPrimary,
    },
    pickerItem: {
        color: colors.textPrimary,
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#E9ECEF',
        borderRadius: 10,
        padding: 4,
    },
    radioButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    radioButtonSelected: {
        backgroundColor: colors.secondary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    radioText: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '500',
    },
    radioTextSelected: {
        color: 'white',
        fontWeight: 'bold',
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
    suggestionList: {
        maxHeight: 172,
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
        fontSize: 16,
        color: colors.textPrimary,
    },
});

export default ListingForm;
