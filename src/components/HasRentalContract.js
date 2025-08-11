import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../styles/colors';

const InputGroup = ({ label, children, isRequired }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>
            {isRequired && <Text style={styles.requiredStar}>* </Text>}
            {label}
        </Text>
        {children}
    </View>
);

const HasRentalContract = ({ formData, setFormData }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || formData.expiration_date;
        setShowDatePicker(Platform.OS === 'ios');
        setFormData((prev) => ({ ...prev, expiration_date: currentDate }));
    };

    const durationUnits = [
        { label: 'Tháng', value: 'month' },
        { label: 'Năm', value: 'year' },
        { label: 'Ngày', value: 'day' },
    ];

    return (
        <View style={styles.container}>
            <InputGroup label="Giá cho thuê" isRequired>
                <TextInput
                    style={styles.input}
                    value={formData.rent_price}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, rent_price: text }))}
                    keyboardType="numeric"
                    placeholder="Ví dụ: 15000000 VND"
                    placeholderTextColor="#888"
                    accessibilityLabel="Nhập giá cho thuê"
                />
            </InputGroup>
            <InputGroup label="Thời hạn thuê" isRequired>
                <TextInput
                    style={styles.input}
                    value={formData.lease_term}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, lease_term: text }))}
                    keyboardType="numeric"
                    placeholder="Ví dụ: 12"
                    placeholderTextColor="#888"
                    accessibilityLabel="Nhập thời hạn thuê"
                />
            </InputGroup>
            <InputGroup label="Đơn vị thời hạn" isRequired>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.lease_term_unit}
                        onValueChange={(itemValue) => setFormData((prev) => ({ ...prev, lease_term_unit: itemValue }))}
                        style={styles.picker}
                    >
                        <Picker.Item label="Chọn đơn vị" value="" />
                        {durationUnits.map((unit) => (
                            <Picker.Item key={unit.value} label={unit.label} value={unit.value} />
                        ))}
                    </Picker>
                </View>
            </InputGroup>
            <InputGroup label="Ngày hết hạn" isRequired>
                <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker(true)}
                    accessibilityLabel="Chọn ngày hết hạn"
                >
                    <Text style={styles.dateText}>
                        {formData.expiry_date ? formData.expiry_date.toLocaleDateString() : 'Chọn ngày'}
                    </Text>
                    <Icon name="calendar" size={20} color={colors.secondary} />
                </TouchableOpacity>
            </InputGroup>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#FFF',
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    inputGroup: {
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
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#fff',
    },
    dateText: {
        fontSize: 14,
        color: colors.textPrimary,
    },
});

export default HasRentalContract;