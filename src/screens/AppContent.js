import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AuthContext from '../contexts/AuthContext';
import LocationContext from '../contexts/LocationContext';
import LoginPage from '../components/LoginPage';
import LocationPermissionPage from '../components/LocationPermissionPage';
import ListingList from '../components/ListingList';
import MapPage from '../components/MapPage';
import ProfilePage from '../components/ProfilePage';
import FilterPage from '../components/FilterPage';
import NotificationPage from '../components/NotificationPage';
import ListingDetail from '../components/ListingDetail';
import ListingFavorites from '../components/ListingFavorites';
import ListingForm from '../components/ListingForm';
import ListingFormAdvanced from '../components/ListingFormAdvanced';
import AddContactForm from '../components/AddContactForm';
import { BottomNavigationBar } from '../components/BottomNavigationBar';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
    <Tab.Navigator tabBar={props => <BottomNavigationBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Listings" component={ListingList} options={{ title: 'Danh sách' }} />
        <Tab.Screen name="MapPage" component={MapPage} options={{ title: 'Quy Hoạch' }} />
        <Tab.Screen name="Favorites" component={ListingFavorites} options={{ title: 'BDS yêu thích' }} />
        <Tab.Screen name="Profile" component={ProfilePage} options={{ title: 'Cá nhân' }} />
    </Tab.Navigator>
);

const AppContent = () => {
    const { isLoggedIn } = useContext(AuthContext);
    const { locationGranted } = useContext(LocationContext);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isLoggedIn ? (
                    <Stack.Screen name="Login" component={LoginPage} />
                ) : !locationGranted ? (
                    <Stack.Screen name="LocationPermission" component={LocationPermissionPage} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="FilterPage" component={FilterPage} options={{ title: 'Bộ Lọc' }} />
                        <Stack.Screen name="NotificationPage" component={NotificationPage} options={{ title: 'Thông Báo' }} />
                        <Stack.Screen name="ListingDetail" component={ListingDetail} options={{ title: 'Chi Ti  ết' }} />
                        <Stack.Screen name="ListingForm" component={ListingForm} options={{ title: 'From Tạo' }} />
                        <Stack.Screen name="ListingFormAdvanced" component={ListingFormAdvanced} options={{ title: 'ListingFormAdvanced' }} />
                        <Stack.Screen name="AddContactForm" component={AddContactForm} options={{ title: 'AddContactForm' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppContent;