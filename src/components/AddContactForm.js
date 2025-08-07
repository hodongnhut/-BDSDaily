import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- CẬP NHẬT DANH SÁCH VAI TRÒ MỚI ---
const roles = [
    { label: "Chọn Vai Trò", value: "" },
    { label: "Không xác định", value: "0" },
    { label: "Chủ nhà", value: "1" },
    { label: "Độc Quyền", value: "2" },
    { label: "Môi Giới Hợp Tác", value: "3" },
    { label: "Người Thân Chủ Nhà", value: "4" },
    { label: "Trợ Lý Chủ Nhà", value: "5" },
    { label: "Đại Diện Công Ty", value: "6" },
    { label: "Đại Diện Chủ Nhà", value: "7" },
    { label: "Đầu Tư", value: "8" }
];

const genders = [
    { label: "Chọn Giới tính", value: "" },
    { label: "Nam", value: "1" },
    { label: "Nữ", value: "2" },
    { label: "Khác", value: "0" }
];


const AddContactForm = ({ visible, onClose, onSave }) => {
    const [contactData, setContactData] = useState({
        role: "", // Cập nhật giá trị ban đầu thành chuỗi rỗng để khớp với "Chọn Vai Trò"
        name: '',
        phone: '',
        gender: 'Nam',
    });

    const handleChange = (name, value) => {
        setContactData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (contactData.name && contactData.phone && contactData.role !== "") {
            onSave(contactData);
            onClose();
        } else {
            alert('Vui lòng điền đầy đủ thông tin Tên, Điện thoại và Vai Trò.');
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {/* Header của Modal */}
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Thêm Thông Tin Liên Hệ</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Form nhập liệu */}
                    <View style={styles.formContainer}>
                        {/* Vai Trò và Tên */}
                        <View style={styles.row}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Vai Trò</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={contactData.role}
                                        onValueChange={(itemValue) => handleChange('role', itemValue)}
                                        style={styles.picker}
                                    >
                                        {roles.map(role => (
                                            <Picker.Item key={role.value} label={role.label} value={role.value} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tên</Text>
                                <TextInput
                                    style={styles.input}
                                    value={contactData.name}
                                    onChangeText={(text) => handleChange('name', text)}
                                />
                            </View>
                        </View>

                        {/* Điện thoại và Giới tính */}
                        <View style={styles.row}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Điện thoại</Text>
                                <TextInput
                                    style={styles.input}
                                    value={contactData.phone}
                                    onChangeText={(text) => handleChange('phone', text)}
                                    keyboardType="phone-pad"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Giới tính</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={contactData.gender}
                                        onValueChange={(itemValue) => handleChange('gender', itemValue)}
                                        style={styles.picker}
                                    >
                                        {genders.map(gender => (
                                            <Picker.Item key={gender.value} label={gender.label} value={gender.value} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Nút điều hướng */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                            <Text style={styles.buttonText}>Lưu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={[styles.buttonText, { color: '#000' }]}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    formContainer: {
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    inputGroup: {
        flex: 1,
        marginRight: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: Platform.OS === 'ios' ? 12 : 10,
        backgroundColor: '#f5f5f5',
        height: Platform.OS === 'ios' ? 150 : 55,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
    },
    picker: {
        height: Platform.OS === 'ios' ? 150 : 55,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginLeft: 10,
    },
    saveButton: {
        backgroundColor: 'rgb(249, 115, 22)', // Màu cam
    },
    cancelButton: {
        backgroundColor: '#e0e0e0',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AddContactForm;