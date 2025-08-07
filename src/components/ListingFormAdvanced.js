import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../styles/colors';
import AddContactForm from './AddContactForm';


const transactionTypes = ['Bán', 'Cho Thuê'];
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

const statusOptions = ['Đang Giao Dịch', 'Ngưng Giao Dịch', 'Đã Giao Dịch', 'Đã Cọc'];
const prosConsOptions = {
    pros: [
        'Nhà Mới Xây',
        'Giá Rẻ',
        'Bề Ngang Lớn',
        'Nhà Kế Bên Có Bán, Có Thể Mua Gộp',
        'Vị Trí Đẹp Nhất Trên Con Đường',
        'Căn Góc, có hẻm bên hông',
        'Căn Góc, 2 Mặt Đường Chính',
        'Nhà 2 Mặt Đường Trước và Sau',
        'Có Hẻm Sau Nhà',
        'Hẻm Thông',
        'Gần Công Viên Siêu Thị, Trung Tâm Thương Mại',
        'Tặng Full Nội Thất',
        'Nội Thất Cao Cấp',
        'Quy Hoạch Mở Đường',
        'Gần Siêu Dự Án Đang Xây',
        'Chủ nhà thiện chí',
        'Có Hệ thống PCCC',
        'Khuôn đất Vuông Vức',
        'Giá /m2 rẻ',
        'Nhà đẹp có sẵn nội thất',
        'Gần mặt tiền đường',
        'Nhà cũ tiện xây mới',
        'Nhà nhiều phòng',
        'Nhà cho thuê giá cao'
    ],
    cons: [
        'Chủ nhà không thiện chí',
        'Có Cây Trước Nhà',
        'Có Cống Trước Nhà',
        'Có Trụ Điện Trước Nhà',
        'Dưới Chân Cầu Hoặc Điện Cao Thế',
        'Đất Không Được Vuông',
        'Đất Tóp Hậu',
        'Đối Diện hoặc Gần Chùa, Nhà Thờ',
        'Đường Hoặc Hẻm Đâm Vào Nhà',
        'Gần Nghĩa Trang',
        'Gần nhà tang lễ',
        'Gần Trại Hòm',
        'Hẻm Cụt',
        'Không Cho Xây Mới Hoặc Không Thể Xây Mới',
        'Pháp Lý (Thừa Kế, Tranh Chấp, Chưa Hoàn Công...)',
        'Quy Hoạch Lộ Giới Hết Nhà',
        'Quy Hoạch Lộ Giới Nhiều',
        'Quy Hoạch Treo'
    ],
};

// Component con để nhóm các input
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

const ListingFormAdvanced = ({ navigation }) => {
    // Thêm state để quản lý tab đang được chọn
    const [selectedTab, setSelectedTab] = useState('Dữ Liệu Nhà Đất');
    const [isContactModalVisible, setIsContactModalVisible] = useState(false);

    const handleSaveContact = (newContact) => {
        // Xử lý logic lưu contact, có thể thêm vào danh sách contacts trong state
        console.log('Lưu liên hệ mới:', newContact);
    };

    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        // ... (Giữ nguyên các state cũ)
        // Vị trí
        city: 'Hồ Chí Minh',
        district: null,
        ward: null,
        street: null,
        houseNumber: '',
        lotNumber: '',
        sheetNumber: '',
        blockNumber: '',
        areaDescription: '',
        // Thông tin cơ bản
        transactionType: 'Bán',
        propertyType: null,
        listingType: null,
        price: '',
        priceUnit: 'Tỷ',
        priceRate: '',
        // Diện tích
        landArea: '',
        landWidth: '',
        landLength: '',
        backWidth: '',
        plannedArea: '',
        plannedWidth: '',
        plannedLength: '',
        plannedBackWidth: '',
        // Thông tin khác
        beds: '',
        baths: '',
        productType: null,
        direction: null,
        landType: null,
        streetWidth: '',
        usedArea: '',
        floors: '',
        basements: '',
        // Trạng thái
        status: null,
        hasRedBook: false,
        hasTaxContract: false,
        hasLeaseContract: false,
        isUnderNegotiation: false,
        isMortgaged: false,
        // Liên hệ
        contactName: '',
        contactPhone: '',
        hasLuckyMoney: false,
        notes: '',
        // Ưu/Nhược điểm
        selectedPros: new Set(),
        selectedCons: new Set(),
    });

    const [redBookImages, setRedBookImages] = useState([]);
    const [additionalImages, setAdditionalImages] = useState([]);


    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleProsCons = (type, value) => {
        setFormData(prev => {
            const newSet = new Set(prev[type]);
            if (newSet.has(value)) {
                newSet.delete(value);
            } else {
                newSet.add(value);
            }
            return { ...prev, [type]: newSet };
        });
    };

    const handleSubmit = () => {
        console.log('Submitted Data:', formData);
        // Logic gửi dữ liệu lên API
        // ...
        // Sau khi thành công, đóng form
        navigation.goBack();
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    // --- HÀM XỬ LÝ HÌNH ẢNH (GIẢ LẬP) ---
    const handleImagePicker = (imageType) => {
        // Đây là nơi bạn sẽ tích hợp thư viện chọn ảnh thực tế
        // Ví dụ với react-native-image-picker:
        // ImagePicker.launchImageLibrary({}, (response) => {
        //   if (response.didCancel) return;
        //   if (response.error) {
        //     console.log('ImagePicker Error: ', response.error);
        //   } else {
        //     const newImage = { uri: response.uri, type: response.type, name: response.fileName };
        //     if (imageType === 'redBook') {
        //       setRedBookImages(prev => [...prev, newImage]);
        //     } else {
        //       setAdditionalImages(prev => [...prev, newImage]);
        //     }
        //   }
        // });

        // Giả lập việc thêm ảnh
        const dummyImageUri = 'https://via.placeholder.com/150';
        const newImage = { uri: dummyImageUri, name: `ảnh_${Math.random().toString(36).substring(7)}.jpg` };
        if (imageType === 'redBook') {
            setRedBookImages(prev => [...prev, newImage]);
        } else {
            setAdditionalImages(prev => [...prev, newImage]);
        }
    };

    const handleRemoveImage = (imageType, indexToRemove) => {
        if (imageType === 'redBook') {
            setRedBookImages(redBookImages.filter((_, index) => index !== indexToRemove));
        } else {
            setAdditionalImages(additionalImages.filter((_, index) => index !== indexToRemove));
        }
    };

    // Component hiển thị nội dung của tab "Dữ Liệu Nhà Đất"
    const renderDataForm = () => (
        <>
            {/* Section 1: Thông tin cơ bản */}
            <Section title="Thông tin cơ bản">
                {/* ... (Nội dung của Section 1) */}
                <View style={styles.fieldRow}>
                    <InputGroup label=" Loại Giao Dịch" isRequired>
                        <View style={styles.radioGroup}>
                            {transactionTypes.map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.radioButton, formData.transactionType === type && styles.radioButtonSelected]}
                                    onPress={() => handleChange('transactionType', type)}
                                >
                                    <Text style={[styles.radioText, formData.transactionType === type && styles.radioTextSelected]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </InputGroup>
                    <InputGroup label=" Loại BĐS" isRequired>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.propertyType}
                                onValueChange={(itemValue) => handleChange('propertyType', itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Chọn Loại BĐS" value={null} />
                                {propertyTypes.map(type => (
                                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                                ))}
                            </Picker>
                        </View>
                    </InputGroup>
                </View>

                <View style={styles.fullWidthField}>
                    <Text style={styles.label}>* Trạng thái giao dịch</Text>
                    <View style={styles.checkboxGroup}>
                        {statusOptions.map(status => (
                            <View key={status} style={styles.checkboxItem}>
                                <TouchableOpacity
                                    onPress={() => handleChange('status', status)}
                                >
                                    <Icon
                                        name={formData.status === status ? "radiobox-marked" : "radiobox-blank"}
                                        size={20}
                                        color={formData.status === status ? colors.secondary : '#888'}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.checkboxText}>{status}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={[styles.fieldRow, { marginTop: 10 }]}>
                    <InputGroup label="Các Loại Hình">
                        <View style={styles.checkboxGroup}>
                            <View style={styles.checkboxItem}>
                                <TouchableOpacity onPress={() => handleChange('hasRedBook', !formData.hasRedBook)}>
                                    <Icon
                                        name={formData.hasRedBook ? "checkbox-marked" : "checkbox-blank-outline"}
                                        size={20}
                                        color={formData.hasRedBook ? colors.secondary : '#888'}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.checkboxText}>Có Sổ</Text>
                            </View>
                            <View style={styles.checkboxItem}>
                                <TouchableOpacity onPress={() => handleChange('isMortgaged', !formData.isMortgaged)}>
                                    <Icon
                                        name={formData.isMortgaged ? "checkbox-marked" : "checkbox-blank-outline"}
                                        size={20}
                                        color={formData.isMortgaged ? colors.secondary : '#888'}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.checkboxText}>Thế Chấp</Text>
                            </View>
                        </View>
                    </InputGroup>
                </View>
            </Section>

            {/* Section 2: Vị trí BĐS */}
            <Section title="Vị Trí BĐS">
                <View style={styles.fieldRow}>
                    <InputGroup label=" Tỉnh Thành" isRequired>
                        <View style={styles.staticInput}>
                            <Text style={styles.staticText}>{formData.city}</Text>
                        </View>
                    </InputGroup>
                    <InputGroup label=" Quận Huyện" isRequired>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.district}
                                onValueChange={(itemValue) => handleChange('district', itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Chọn Quận Huyện" value={null} />
                                <Picker.Item label="Quận 1" value="q1" />
                                <Picker.Item label="TP. Thủ Đức" value="thuduc" />
                            </Picker>
                        </View>
                    </InputGroup>
                </View>

                <View style={styles.fieldRow}>
                    <InputGroup label=" Phường / Xã" isRequired>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.ward}
                                onValueChange={(itemValue) => handleChange('ward', itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Chọn Phường / Xã" value={null} />
                            </Picker>
                        </View>
                    </InputGroup>
                    <InputGroup label=" Đường" isRequired>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.street}
                                onValueChange={(itemValue) => handleChange('street', itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Chọn Đường" value={null} />
                            </Picker>
                        </View>
                    </InputGroup>
                </View>

                <View style={styles.fieldRow}>
                    <InputGroup label=" Số Nhà" isRequired>
                        <TextInput style={styles.input} value={formData.houseNumber} onChangeText={(text) => handleChange('houseNumber', text)} />
                    </InputGroup>
                    <InputGroup label="Số Thửa">
                        <TextInput style={styles.input} value={formData.lotNumber} onChangeText={(text) => handleChange('lotNumber', text)} />
                    </InputGroup>
                </View>

                <View style={styles.fieldRow}>
                    <InputGroup label="Số Tờ">
                        <TextInput style={styles.input} value={formData.sheetNumber} onChangeText={(text) => handleChange('sheetNumber', text)} />
                    </InputGroup>
                    <InputGroup label="Số Lô">
                        <TextInput style={styles.input} value={formData.blockNumber} onChangeText={(text) => handleChange('blockNumber', text)} />
                    </InputGroup>
                </View>
            </Section>

            {/* Section 3: Diện Tích Đất */}
            <Section title="Diện Tích Đất">
                <View style={styles.fieldRow}>
                    <InputGroup label="Chiều rộng">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.landWidth} onChangeText={(text) => handleChange('landWidth', text)} />
                    </InputGroup>
                    <InputGroup label="Chiều dài">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.landLength} onChangeText={(text) => handleChange('landLength', text)} />
                    </InputGroup>
                    <InputGroup label="Mặt Hậu">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.backWidth} onChangeText={(text) => handleChange('backWidth', text)} />
                    </InputGroup>
                </View>
                <View style={styles.fullWidthField}>
                    <InputGroup label="DT Công nhận">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.landArea} onChangeText={(text) => handleChange('landArea', text)} />
                    </InputGroup>
                </View>
            </Section>

            {/* Section 4: Diện Tích Quy Hoạch */}
            <Section title="Diện Tích Quy Hoạch">
                <View style={styles.fieldRow}>
                    <InputGroup label="Chiều rộng">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.plannedWidth} onChangeText={(text) => handleChange('plannedWidth', text)} />
                    </InputGroup>
                    <InputGroup label="Chiều dài">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.plannedLength} onChangeText={(text) => handleChange('plannedLength', text)} />
                    </InputGroup>
                    <InputGroup label="Mặt Hậu">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.plannedBackWidth} onChangeText={(text) => handleChange('plannedBackWidth', text)} />
                    </InputGroup>
                </View>
                <View style={styles.fullWidthField}>
                    <InputGroup label="DT Xây dựng">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.plannedArea} onChangeText={(text) => handleChange('plannedArea', text)} />
                    </InputGroup>
                </View>
            </Section>

            {/* Section 5: Thông tin khác */}
            <Section title="Thông tin khác">
                <View style={styles.fieldRow}>
                    <InputGroup label="Loại sản phẩm">
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.productType}
                                onValueChange={(itemValue) => handleChange('productType', itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Chọn Loại Sản Phẩm" value={null} />
                                <Picker.Item label="Đất trống" value="empty_land" />
                                <Picker.Item label="Nhà ở" value="house" />
                            </Picker>
                        </View>
                    </InputGroup>
                    <InputGroup label="Hướng">
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.direction}
                                onValueChange={(itemValue) => handleChange('direction', itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Chọn Hướng" value={null} />
                                <Picker.Item label="Đông" value="east" />
                                <Picker.Item label="Tây" value="west" />
                            </Picker>
                        </View>
                    </InputGroup>
                    <InputGroup label="Loại đất">
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.landType}
                                onValueChange={(itemValue) => handleChange('landType', itemValue)}
                                style={styles.picker}
                            >
                            </Picker>
                        </View>
                    </InputGroup>
                </View>

                <View style={styles.fieldRow}>
                    <InputGroup label="Đường rộng">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.streetWidth} onChangeText={(text) => handleChange('streetWidth', text)} />
                    </InputGroup>
                    <InputGroup label="DT Sử dụng">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.usedArea} onChangeText={(text) => handleChange('usedArea', text)} />
                    </InputGroup>
                </View>

                <View style={styles.fieldRow}>
                    <InputGroup label="Số Tầng">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.floors} onChangeText={(text) => handleChange('floors', text)} />
                    </InputGroup>
                    <InputGroup label="Số tầng hầm">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.basements} onChangeText={(text) => handleChange('basements', text)} />
                    </InputGroup>
                    <InputGroup label="PN">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.beds} onChangeText={(text) => handleChange('beds', text)} />
                    </InputGroup>
                    <InputGroup label="WC">
                        <TextInput style={styles.input} keyboardType="numeric" value={formData.baths} onChangeText={(text) => handleChange('baths', text)} />
                    </InputGroup>
                </View>
            </Section>

            {/* Section 6: Ưu & Nhược điểm */}
            <Section title="Ưu điểm & Nhược điểm">
                <View style={styles.prosConsContainer}>
                    <View style={styles.prosConsColumn}>
                        <Text style={styles.prosConsTitle}>Ưu điểm</Text>
                        {prosConsOptions.pros.map(option => (
                            <View key={option} style={styles.checkboxItem}>
                                <TouchableOpacity
                                    onPress={() => handleToggleProsCons('selectedPros', option)}
                                >
                                    <Icon
                                        name={formData.selectedPros.has(option) ? "checkbox-marked" : "checkbox-blank-outline"}
                                        size={20}
                                        color={formData.selectedPros.has(option) ? colors.secondary : '#888'}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.checkboxText}>{option}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.prosConsColumn}>
                        <Text style={styles.prosConsTitle}>Nhược điểm</Text>
                        {prosConsOptions.cons.map(option => (
                            <View key={option} style={styles.checkboxItem}>
                                <TouchableOpacity
                                    onPress={() => handleToggleProsCons('selectedCons', option)}
                                >
                                    <Icon
                                        name={formData.selectedCons.has(option) ? "checkbox-marked" : "checkbox-blank-outline"}
                                        size={20}
                                        color={formData.selectedCons.has(option) ? colors.secondary : '#888'}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.checkboxText}>{option}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Section>

            {/* Section 7: Ghi chú */}
            <Section title="Ghi chú">
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={4}
                    value={formData.notes}
                    onChangeText={(text) => handleChange('notes', text)}
                />
            </Section>
        </>
    );

    // Component hiển thị nội dung của tab "Sổ Hồng & Hình Ảnh"
    const renderImagesForm = () => (
        <View style={styles.imagesTabContent}>
            <Text style={styles.imageSectionTitle}>Hình ảnh đã tải lên</Text>

            {/* Vùng tải lên Sổ hồng */}
            <View style={styles.imageUploadRow}>
                <View style={styles.imageUploadBox}>
                    <Text style={styles.uploadBoxTitle}>SỔ HỒNG | GIẤY TỜ PHÁP LÝ</Text>
                    <TouchableOpacity style={styles.uploadBoxButton} onPress={() => handleImagePicker('redBook')}>
                        <Icon name="cloud-upload-outline" size={40} color={colors.secondary} />
                        <Text style={styles.uploadBoxText}>Chọn hoặc kéo thả</Text>
                        <Text style={styles.uploadBoxSubText}>File: pdf, jpg, png, jpeg, webp, heic!</Text>
                    </TouchableOpacity>
                </View>

                {/* Vùng tải lên Hình ảnh bổ sung */}
                <View style={styles.imageUploadBox}>
                    <Text style={styles.uploadBoxTitle}>HÌNH ẢNH BỔ SUNG</Text>
                    <TouchableOpacity style={styles.uploadBoxButton} onPress={() => handleImagePicker('additional')}>
                        <Icon name="cloud-upload-outline" size={40} color={colors.secondary} />
                        <Text style={styles.uploadBoxText}>Chọn hoặc kéo thả</Text>
                        <Text style={styles.uploadBoxSubText}>File: pdf, jpg, png, jpeg, webp, heic!</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Hiển thị danh sách hình ảnh Sổ hồng đã tải lên */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollContainer}>
                {redBookImages.map((image, index) => (
                    <View key={index} style={styles.imagePreviewContainer}>
                        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                        <TouchableOpacity onPress={() => handleRemoveImage('redBook', index)} style={styles.removeImageButton}>
                            <Icon name="trash-can-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* Hiển thị danh sách hình ảnh bổ sung đã tải lên */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollContainer}>
                {additionalImages.map((image, index) => (
                    <View key={index} style={styles.imagePreviewContainer}>
                        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                        <TouchableOpacity onPress={() => handleRemoveImage('additional', index)} style={styles.removeImageButton}>
                            <Icon name="trash-can-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>DỮ LIỆU NHÀ ĐẤT</Text>
                <TouchableOpacity onPress={handleGoBack} style={styles.closeButton}>
                    <Icon name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        selectedTab === 'Dữ Liệu Nhà Đất' && styles.tabButtonSelected,
                    ]}
                    onPress={() => setSelectedTab('Dữ Liệu Nhà Đất')}
                >
                    <Text
                        style={[
                            styles.tabButtonText,
                            selectedTab === 'Dữ Liệu Nhà Đất' && styles.tabButtonTextSelected,
                        ]}
                    >
                        DỮ LIỆU NHÀ ĐẤT
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        selectedTab === 'Sổ Hồng & Hình Ảnh' && styles.tabButtonSelected,
                    ]}
                    onPress={() => setSelectedTab('Sổ Hồng & Hình Ảnh')}
                >
                    <Text
                        style={[
                            styles.tabButtonText,
                            selectedTab === 'Sổ Hồng & Hình Ảnh' && styles.tabButtonTextSelected,
                        ]}
                    >
                        SỔ HỒNG & HÌNH ẢNH
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                {selectedTab === 'Dữ Liệu Nhà Đất' ? renderDataForm() : renderImagesForm()}
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleGoBack}>
                    <Text style={styles.buttonText}>TRỞ LẠI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>LƯU</Text>
                </TouchableOpacity>
            </View>
            <AddContactForm
                visible={isContactModalVisible}
                onClose={() => setIsContactModalVisible(false)}
                onSave={handleSaveContact}
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setIsContactModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Thêm Liên Hệ"
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
    imagesTabContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    imagesPlaceholderText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 10,
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
        height: 55,
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
});

export default ListingFormAdvanced;
