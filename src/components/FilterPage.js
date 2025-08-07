import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../styles/colors';

// Mock data for dropdowns
const transactionTypes = ['Bán', 'Cho Thuê'];
const propertyTypes = ['Nhà Phố', 'Căn Hộ', 'Đất Nền', 'Biệt Thự', 'Cao ốc', 'Kho/Xưởng'];
const locations = ['Quận 1', 'Quận 3', 'Quận 7', 'Thủ Đức', 'Bình Chánh', 'Vũng Tàu'];
const wards = ['Phường Tân Phú', 'Phường Tân Phong', 'Xã Bình Hưng', 'Phường Thảo Điền', 'Phường 3', 'Phường Thắng Tam', 'Phường Nguyễn Cư Trinh'];
const features = ['Gần Trường Học', 'Gần Bệnh Viện', 'View Đẹp', 'Nở Hậu', 'Hẻm Xe Hơi'];
const disadvantages = ['Hẻm Nhỏ', 'Kẹt Xe', 'Hướng Xấu', 'Đường Cụt'];
const directions = ['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Tây Nam', 'Đông Bắc', 'Tây Bắc'];

const FilterPage = ({ onClose, onApplyFilters }) => {
    // State for filter values
    const [transactionType, setTransactionType] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [location, setLocation] = useState('');
    const [ward, setWard] = useState('');
    const [street, setStreet] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minArea, setMinArea] = useState('');
    const [maxArea, setMaxArea] = useState('');
    const [minWidth, setMinWidth] = useState('');
    const [maxWidth, setMaxWidth] = useState('');
    const [minLength, setMinLength] = useState('');
    const [maxLength, setMaxLength] = useState('');
    const [minBeds, setMinBeds] = useState('');
    const [maxBeds, setMaxBeds] = useState('');
    const [minBaths, setMinBaths] = useState('');
    const [maxBaths, setMaxBaths] = useState('');
    const [minFloors, setMinFloors] = useState('');
    const [maxFloors, setMaxFloors] = useState('');
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [selectedDisadvantages, setSelectedDisadvantages] = useState([]);
    const [direction, setDirection] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [isUnderNegotiation, setIsUnderNegotiation] = useState(false);

    // Function to handle applying filters
    const handleApply = () => {
        const filters = {
            transactionType,
            propertyType,
            location,
            ward,
            street,
            minPrice: minPrice ? parseFloat(minPrice) : null,
            maxPrice: maxPrice ? parseFloat(maxPrice) : null,
            minArea: minArea ? parseFloat(minArea) : null,
            maxArea: maxArea ? parseFloat(maxArea) : null,
            minWidth: minWidth ? parseFloat(minWidth) : null,
            maxWidth: maxWidth ? parseFloat(maxWidth) : null,
            minLength: minLength ? parseFloat(minLength) : null,
            maxLength: maxLength ? parseFloat(maxLength) : null,
            minBeds: minBeds ? parseInt(minBeds) : null,
            maxBeds: maxBeds ? parseInt(maxBeds) : null,
            minBaths: minBaths ? parseInt(minBaths) : null,
            maxBaths: maxBaths ? parseInt(maxBaths) : null,
            minFloors: minFloors ? parseInt(minFloors) : null,
            maxFloors: maxFloors ? parseInt(maxFloors) : null,
            selectedFeatures,
            selectedDisadvantages,
            direction,
            dateFrom,
            dateTo,
            isNewProduct,
            isUnderNegotiation,
        };
        onApplyFilters(filters);
        onClose();
    };

    // Function to handle resetting filters
    const handleReset = () => {
        setTransactionType('');
        setPropertyType('');
        setLocation('');
        setWard('');
        setStreet('');
        setMinPrice('');
        setMaxPrice('');
        setMinArea('');
        setMaxArea('');
        setMinWidth('');
        setMaxWidth('');
        setMinLength('');
        setMaxLength('');
        setMinBeds('');
        setMaxBeds('');
        setMinBaths('');
        setMaxBaths('');
        setMinFloors('');
        setMaxFloors('');
        setSelectedFeatures([]);
        setSelectedDisadvantages([]);
        setDirection('');
        setDateFrom('');
        setDateTo('');
        setIsNewProduct(false);
        setIsUnderNegotiation(false);
    };

    // Helper for dropdown selection using Picker
    const renderDropdown = (label, value, setValue, options) => (
        <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>{label}</Text>
            <View style={styles.dropdownInput}>
                <Picker
                    selectedValue={value}
                    onValueChange={(itemValue) => setValue(itemValue)}
                    style={styles.picker}
                    dropdownIconColor={colors.textSecondary}
                >
                    <Picker.Item label={`Chọn ${label.toLowerCase()}`} value="" />
                    {options.map((option, index) => (
                        <Picker.Item key={index} label={option} value={option} />
                    ))}
                </Picker>
            </View>
        </View>
    );

    // Helper for range inputs
    const renderRangeInput = (label, minVal, setMinVal, maxVal, setMaxVal, keyboardType = 'numeric') => (
        <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>{label}</Text>
            <View style={styles.rangeInputContainer}>
                <TextInput
                    style={styles.rangeInput}
                    placeholder="Từ"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType={keyboardType}
                    value={minVal}
                    onChangeText={setMinVal}
                />
                <Text style={styles.rangeSeparator}>-</Text>
                <TextInput
                    style={styles.rangeInput}
                    placeholder="Đến"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType={keyboardType}
                    value={maxVal}
                    onChangeText={setMaxVal}
                />
            </View>
        </View>
    );

    // Helper for multi-select tags
    const renderMultiSelect = (label, options, selectedItems, setSelectedItems) => (
        <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>{label}</Text>
            <View style={styles.tagsContainer}>
                {options.map((item, index) => {
                    const isSelected = selectedItems.includes(item);
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.tag, isSelected && styles.selectedTag]}
                            onPress={() => {
                                if (isSelected) {
                                    setSelectedItems(selectedItems.filter(i => i !== item));
                                } else {
                                    setSelectedItems([...selectedItems, item]);
                                }
                            }}
                        >
                            <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    // Data for FlatList
    const filterSections = [
        {
            type: 'basic',
            render: () => (
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
                    {renderDropdown('Loại Giao Dịch', transactionType, setTransactionType, transactionTypes)}
                    {renderDropdown('Loại Sản Phẩm', propertyType, setPropertyType, propertyTypes)}
                    {renderDropdown('Quận', location, setLocation, locations)}
                    {renderDropdown('Phường', ward, setWard, wards)}
                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>Đường</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Nhập tên đường"
                            placeholderTextColor={colors.textSecondary}
                            value={street}
                            onChangeText={setStreet}
                        />
                    </View>
                </View>
            ),
        },
        {
            type: 'area_price',
            render: () => (
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Diện tích & Giá</Text>
                    {renderRangeInput('Giá (Tỷ VNĐ)', minPrice, setMinPrice, maxPrice, setMaxPrice)}
                    {renderRangeInput('Diện tích (m²)', minArea, setMinArea, maxArea, setMaxArea)}
                    {renderRangeInput('Chiều Rộng (m)', minWidth, setMinWidth, maxWidth, setMaxWidth)}
                    {renderRangeInput('Chiều Dài (m)', minLength, setMinLength, maxLength, setMaxLength)}
                </View>
            ),
        },
        {
            type: 'property_details',
            render: () => (
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Đặc điểm bất động sản</Text>
                    {renderRangeInput('Số phòng ngủ', minBeds, setMinBeds, maxBeds, setMaxBeds)}
                    {renderRangeInput('Số phòng vệ sinh', minBaths, setMinBaths, maxBaths, setMaxBaths)}
                    {renderRangeInput('Số tầng', minFloors, setMinFloors, maxFloors, setMaxFloors)}
                    {renderDropdown('Hướng', direction, setDirection, directions)}
                </View>
            ),
        },
        {
            type: 'features',
            render: () => renderMultiSelect('Ưu điểm', features, selectedFeatures, setSelectedFeatures),
        },
        {
            type: 'disadvantages',
            render: () => renderMultiSelect('Nhược điểm', disadvantages, selectedDisadvantages, setSelectedDisadvantages),
        },
        {
            type: 'date_posted',
            render: () => (
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Ngày đăng</Text>
                    <View style={styles.dateInputContainer}>
                        <TextInput
                            style={styles.dateInput}
                            placeholder="Từ ngày (YYYY-MM-DD)"
                            placeholderTextColor={colors.textSecondary}
                            value={dateFrom}
                            onChangeText={setDateFrom}
                        />
                        <Icon name="calendar-month-outline" size={24} color={colors.textSecondary} style={styles.calendarIcon} />
                    </View>
                    <View style={styles.dateInputContainer}>
                        <TextInput
                            style={styles.dateInput}
                            placeholder="Đến ngày (YYYY-MM-DD)"
                            placeholderTextColor={colors.textSecondary}
                            value={dateTo}
                            onChangeText={setDateTo}
                        />
                        <Icon name="calendar-month-outline" size={24} color={colors.textSecondary} style={styles.calendarIcon} />
                    </View>
                </View>
            ),
        },
        {
            type: 'status',
            render: () => (
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Trạng thái</Text>
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Sản phẩm mới</Text>
                        <Switch
                            trackColor={{ false: colors.border, true: colors.accent }}
                            thumbColor={isNewProduct ? colors.cardBackground : colors.cardBackground}
                            onValueChange={setIsNewProduct}
                            value={isNewProduct}
                        />
                    </View>
                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Đang giao dịch</Text>
                        <Switch
                            trackColor={{ false: colors.border, true: colors.accent }}
                            thumbColor={isUnderNegotiation ? colors.cardBackground : colors.cardBackground}
                            onValueChange={setIsUnderNegotiation}
                            value={isUnderNegotiation}
                        />
                    </View>
                </View>
            ),
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Icon name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bộ Lọc</Text>
                <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                    <Text style={styles.resetButtonText}>Đặt Lại</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filterSections}
                renderItem={({ item }) => item.render()}
                keyExtractor={(item) => item.type}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                    <Text style={styles.applyButtonText}>Áp Dụng Bộ Lọc</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F3F5', // Match ListingList
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: colors.secondary, // Match ListingList
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        paddingBottom: 20, // Add some padding at the bottom
    },
    closeButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20, // Larger title
        fontWeight: 'bold',
        color: '#FFF', // White text
    },
    resetButton: {
        padding: 5,
    },
    resetButtonText: {
        fontSize: 16, // Larger text
        color: '#FFF', // White text
        fontWeight: '600',
    },
    flatListContent: {
        padding: 15,
        paddingBottom: 100, // Increased space for footer
    },
    filterSection: {
        backgroundColor: '#FFF', // Match listingCard
        borderRadius: 10, // Match listingCard
        padding: 20, // More padding
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4, // Softer shadow
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA', // Lighter border
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20, // More space
    },
    filterLabel: {
        fontSize: 15, // Larger label
        color: colors.textPrimary,
        width: 110, // Wider label
        fontWeight: '500',
    },
    textInput: {
        flex: 1,
        height: 45, // Taller input
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 15,
        backgroundColor: '#F8F9FA', // Light background
        color: colors.textPrimary,
    },
    dropdownInput: {
        flex: 1,
        height: 45, // Taller
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
    },
    picker: {
        height: 55,
        color: colors.textPrimary,
    },
    rangeInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rangeInput: {
        flex: 1,
        height: 45,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 15,
        color: colors.textPrimary,
        textAlign: 'center',
        backgroundColor: '#F8F9FA',
    },
    rangeSeparator: {
        marginHorizontal: 10,
        fontSize: 16,
        color: colors.textSecondary,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    tag: {
        backgroundColor: '#F0F3F5', // Lighter background
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'transparent', // No border by default
    },
    selectedTag: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    tagText: {
        fontSize: 14, // Larger text
        color: colors.textPrimary,
        fontWeight: '500',
    },
    selectedTagText: {
        color: '#FFF', // White text
        fontWeight: '600',
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: '#F8F9FA',
        height: 45,
    },
    dateInput: {
        flex: 1,
        height: 45,
        fontSize: 15,
        color: colors.textPrimary,
    },
    calendarIcon: {
        marginLeft: 10,
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
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        paddingBottom: 25, // Safe area padding
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 8,
    },
    applyButton: {
        backgroundColor: colors.secondary,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    applyButtonText: {
        fontSize: 18, // Larger text
        fontWeight: 'bold',
        color: '#FFF', // White text
    },
});

export default FilterPage;
