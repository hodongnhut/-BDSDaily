const mockData = {
    model: {
      property_id: '12345',
      location_type_id: '1',
      price: '1500000000',
      final_price: '1450000000',
      has_rental_contract: false,
      plot_number: 'A12',
      sheet_number: 'B34',
      lot_number: 'C56',
      house_number: '25',
      street_name: 'Nguyen Van Cu',
      region: 'Quan 5',
      city: '1', // Ho Chi Minh City
      district_county: '101', // Quan 5
      ward_commune: '1001', // Phuong 1
      area_width: '5',
      area_length: '20',
      planned_back_side: '5',
      area_total: '100',
      planned_width: '5',
      planned_length: '20',
      planned_construction_area: '80',
      property_type_id: '1',
      direction_id: '1',
      land_type_id: '1',
      wide_road: '10',
      usable_area: '90',
      num_floors: '3',
      num_bedrooms: '4',
      num_toilets: '3',
      num_basements: '1',
      asset_type_id: '1',
      commission_types_id: '1',
      transaction_status_id: '1',
      transaction_description: 'Property in good condition, ready for sale.',
      listing_types_id: 1, // Sale (not rental)
      listingType: { name: 'Bán' },
      interiors: [{ interior_id: 1 }],
      advantages: [{ advantage_id: 1 }],
      disadvantages: [{ disadvantage_id: 1 }],
    },
    rentalContractModel: {
      rent_price: '',
      currency_id: '1',
      lease_term: '',
      lease_term_unit: '',
      expiry_date: '',
    },
    modelPropertyTypes: [
      { property_type_id: '1', type_name: 'Nhà ở' },
      { property_type_id: '2', type_name: 'Căn hộ' },
      { property_type_id: '3', type_name: 'Đất nền' },
    ],
    directions: [
      { id: '1', name: 'Đông' },
      { id: '2', name: 'Tây' },
      { id: '3', name: 'Nam' },
      { id: '4', name: 'Bắc' },
    ],
    landTypes: [
      { id: '1', name: 'Thổ cư' },
      { id: '2', name: 'Nông nghiệp' },
      { id: '3', name: 'Công nghiệp' },
    ],
    interiors: [
      { interior_id: 1, name: 'Sofa' },
      { interior_id: 2, name: 'Tủ lạnh' },
      { interior_id: 3, name: 'Máy lạnh' },
    ],
    advantages: [
      { advantage_id: 1, name: 'Gần trường học' },
      { advantage_id: 2, name: 'Gần chợ' },
      { advantage_id: 3, name: 'An ninh tốt' },
    ],
    disadvantages: [
      { disadvantage_id: 1, disadvantage_name: 'Đường nhỏ' },
      { disadvantage_id: 2, disadvantage_name: 'Gần nghĩa trang' },
    ],
    assetTypes: {
      '1': 'Nhà ở',
      '2': 'Căn hộ',
      '3': 'Đất nền',
    },
    commissionTypes: {
      '1': 'Phần trăm',
      '2': 'Cố định',
    },
    transactionStatuses: {
      '1': 'Chưa giao dịch',
      '2': 'Đang giao dịch',
      '3': 'Đã giao dịch',
    },
    dataProvider: [
      {
        id: 1,
        role: { name: 'Chủ nhà' },
        contact_name: 'Nguyen Van A',
        phone_number: '0901234567',
        gender: { name: 'Nam' },
      },
      {
        id: 2,
        role: { name: 'Môi giới' },
        contact_name: 'Tran Thi B',
        phone_number: '0912345678',
        gender: { name: 'Nữ' },
      },
    ],
  };
  
  // Mock cities, districts, and wards
  const mockCities = [
    { label: 'Hồ Chí Minh', value: '1' },
    { label: 'Hà Nội', value: '2' },
  ];
  const mockDistricts = {
    '1': [
      { label: 'Quận 1', value: '100' },
      { label: 'Quận 5', value: '101' },
    ],
    '2': [
      { label: 'Hoàn Kiếm', value: '200' },
      { label: 'Ba Đình', value: '201' },
    ],
  };
  const mockWards = {
    '100': [
      { label: 'Phường Bến Nghé', value: '1000' },
      { label: 'Phường Bến Thành', value: '1001' },
    ],
    '101': [
      { label: 'Phường 1', value: '1002' },
      { label: 'Phường 2', value: '1003' },
    ],
    '200': [
      { label: 'Phường Hàng Trống', value: '2000' },
    ],
    '201': [
      { label: 'Phường Ngọc Hà', value: '2001' },
    ],
  };
  
  export { mockData, mockCities, mockDistricts, mockWards };