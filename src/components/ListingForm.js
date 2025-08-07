import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../styles/colors';
import { fetchWards, createProperty } from '../services/api';

const propertyTypes = [
    { label: "Biệt thự", value: "13" },
    { label: "Căn hộ", value: "17" },
    { label: "Căn Hộ Dịch Vụ", value: "12" },
    { label: "Cao ốc", value: "16" },
    { label: "Chưa chọn", value: "30" },
    { label: "Condotel", value: "19" },
    { label: "Đất", value: "24" },
    { label: "Góc 2 mặt tiền", value: "28" },
    { label: "Karaoke", value: "25" },
    { label: "Khác", value: "27" },
    { label: "Khách Sạn", value: "15" },
    { label: "Kho xưởng", value: "23" },
    { label: "Mặt Bằng", value: "22" },
    { label: "Nhà Cấp 4", value: "9" },
    { label: "Nhà Hẻm, Ngõ", value: "10" },
    { label: "Nhà Nát", value: "11" },
    { label: "Nhà phố", value: "8" },
    { label: "Nhà Phố & Biệt thự", value: "14" },
    { label: "Phòng Trọ", value: "26" },
    { label: "ShopHouse", value: "18" },
    { label: "Tòa Nhà Văn Phòng", value: "21" },
    { label: "Văn Phòng", value: "20" }
];

const districtOptions = [
    { label: "Chọn Quận Huyện...", value: null },
    { label: "Quận 1", value: "Quận 1" },
    { label: "Quận 12", value: "Quận 12" },
    { label: "Gò Vấp", value: "Gò Vấp" },
    { label: "Bình Thạnh", value: "Bình Thạnh" },
    { label: "Tân Bình", value: "Tân Bình" },
    { label: "Tân Phú", value: "Tân Phú" },
    { label: "Phú Nhuận", value: "Phú Nhuận" },
    { label: "Thành phố Thủ Đức", value: "Thành phố Thủ Đức" },
    { label: "Quận 3", value: "Quận 3" },
    { label: "Quận 10", value: "Quận 10" },
    { label: "Quận 11", value: "Quận 11" },
    { label: "Quận 4", value: "Quận 4" },
    { label: "Quận 5", value: "Quận 5" },
    { label: "Quận 6", value: "Quận 6" },
    { label: "Quận 8", value: "Quận 8" },
    { label: "Bình Tân", value: "Bình Tân" },
    { label: "Quận 7", value: "Quận 7" },
    { label: "Huyện Củ Chi", value: "Huyện Củ Chi" },
    { label: "Huyện Hóc Môn", value: "Huyện Hóc Môn" },
    { label: "Huyện Bình Chánh", value: "Huyện Bình Chánh" },
    { label: "Huyện Nhà Bè", value: "Huyện Nhà Bè" },
    { label: "Huyện Cần Giờ", value: "Huyện Cần Giờ" },
];

const ListingForm = ({ onClose, navigation }) => {
    const [transactionType, setTransactionType] = useState('Bán');
    const [propertyType, setPropertyType] = useState(null);
    const [district, setDistrict] = useState(null);
    const [ward, setWard] = useState(null);
    const [wards, setWards] = useState([]);
    const [street, setStreet] = useState(null);
    const [houseNumber, setHouseNumber] = useState('');
    const [lotNumber, setLotNumber] = useState('');
    const [sheetNumber, setSheetNumber] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [areaDescription, setAreaDescription] = useState('');

    const handleDistrictChange = async (districtValue) => {
        setDistrict(districtValue);
        setWard(null);
        if (districtValue) {
            try {
                const wardData = await fetchWards(districtValue);
                setWards(wardData.map(item => ({ label: `${item.Name}`, value: item.Name })));
            } catch (error) {
                console.error(error.message);
            }
        } else {
            setWards([]);
        }
    };

    const handleContinue = async () => {
        // Validate required fields
        const missingFields = [];
        if (!transactionType) missingFields.push('Loại Giao Dịch');
        if (!propertyType) missingFields.push('Loại BĐS');
        if (!district) missingFields.push('Quận Huyện');
        if (!ward) missingFields.push('Phường/Xã');
        if (!street || street.trim() === '') missingFields.push('Đường');
        if (!houseNumber || houseNumber.trim() === '') missingFields.push('Số Nhà');

        if (missingFields.length > 0) {
            alert(`Vui lòng điền đầy đủ các trường bắt buộc: ${missingFields.join(', ')}`);
            return;
        }

        try {
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
            navigation.navigate('ListingFormAdvanced', { basicData: propertyData, response });
        } catch (error) {
            console.error(error.message);
            alert(error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>DỮ LIỆU NHÀ ĐẤT</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Icon name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                {/* Loại Giao Dịch */}
                <View style={styles.fullWidthField}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.asterisk}>*</Text>
                        <Text style={styles.label}> Loại Giao Dịch</Text>
                    </View>
                    <View style={styles.radioGroup}>
                        <TouchableOpacity
                            style={[
                                styles.radioButton,
                                transactionType === 'Bán' && styles.radioButtonSelected,
                            ]}
                            onPress={() => setTransactionType('Bán')}
                        >
                            <Text style={[styles.radioText, transactionType === 'Bán' && styles.radioTextSelected]}>Bán</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.radioButton,
                                transactionType === 'Cho Thuê' && styles.radioButtonSelected,
                            ]}
                            onPress={() => setTransactionType('Cho Thuê')}
                        >
                            <Text style={[styles.radioText, transactionType === 'Cho Thuê' && styles.radioTextSelected]}>Cho Thuê</Text>
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
                                onValueChange={(itemValue) => setPropertyType(itemValue)}
                            >
                                <Picker.Item label="Chọn Loại BĐS" value="" />
                                {propertyTypes.map((item) => (
                                    <Picker.Item key={item.value} label={item.label} value={item.value} />
                                ))}
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
                            >
                                {districtOptions.map((item) => (
                                    <Picker.Item
                                        key={item.value || 'placeholder'}
                                        label={item.label}
                                        value={item.value}
                                        style={styles.pickerItem}
                                    />
                                ))}
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
                                onValueChange={(itemValue) => setWard(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Chọn Phường / Xã" value={null} style={styles.pickerItem} />
                                {wards.map((item) => (
                                    <Picker.Item key={item.value} label={item.label} value={item.value} style={styles.pickerItem} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                </View>

                {/* Đường */}
                <View style={styles.fullWidthField}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.asterisk}>*</Text>
                        <Text style={styles.label}> Đường</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        value={street}
                        onChangeText={setStreet}
                        placeholder="Nhập tên đường"
                        placeholderTextColor="#888"
                    />
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
                        />
                    </View>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Số Thửa</Text>
                        <TextInput
                            style={styles.input}
                            value={lotNumber}
                            onChangeText={setLotNumber}
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
                        />
                    </View>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Số Lô</Text>
                        <TextInput
                            style={styles.input}
                            value={blockNumber}
                            onChangeText={setBlockNumber}
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
                    />
                </View>
            </ScrollView>

            {/* Nút hành động */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                    <Text style={styles.buttonText}>HỦY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                    <Text style={styles.buttonText}>TIẾP TỤC</Text>
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
        height: 40,
        justifyContent: 'center',
    },
    picker: {
        height: 55,
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
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default ListingForm;