import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Linking, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../contexts/AuthContext';
import NotificationContext from '../contexts/NotificationContext';
import { colors } from '../styles/colors';
import { login } from '../services/api';

const LoginPage = () => {
  const { setIsLoggedIn, setCurrentUser } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New: Loading state

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password.trim()) { // New: Basic validation
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }
    setIsLoading(true); // Start loading
    try {
      const { access_token, user } = await login(username, password);
      await AsyncStorage.multiSet([ // Optimize: Batch AsyncStorage sets
        ['isLoggedIn', 'true'],
        ['accessToken', access_token],
        ['currentUser', JSON.stringify(user)],
        ['loginTime', new Date().getTime().toString()],
      ]);
      setIsLoggedIn(true);
      setCurrentUser(user);
      showNotification('Đăng nhập thành công!', 'success');
    } catch (err) {
      // Improved: More robust error parsing
      const errorMessage = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi đăng nhập.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../assets/logo.webp')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Chào mừng!</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tên đăng nhập</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email hoặc mã nhân viên"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="email-address" // New: Better for emails
            returnKeyType="next" // New: Move to next field
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done" // New: Submit on enter
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? 'Ẩn' : 'Hiện'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity onPress={() => showNotification('Vui lòng liên hệ admin!', 'success')}>
          <Text style={styles.forgotPasswordText}>
            Quên mật khẩu?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isLoading && { opacity: 0.7 }]} // New: Disable look during load
          onPress={handleLogin}
          disabled={isLoading} // New: Prevent multiple taps
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} /> // New: Spinner
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>
        <Text
          style={[styles.websiteText, { color: colors.buttonPrimary, textDecorationLine: 'underline' }]} // Simplified: Single Text
          onPress={() => Linking.openURL('https://bdsdaily.com')}
        >
          BDSDaily.com
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 20,
  },
  card: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    alignItems: 'center', // Center the logo and other content
  },
  logo: {
    width: 100, // Adjust size as needed
    height: 100, // Adjust size as needed
    marginBottom: 20, // Space between logo and title
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
    width: '100%', // Ensure inputs take full width
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMedium,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  showPasswordButton: {
    padding: 12,
  },
  showPasswordText: {
    color: colors.buttonPrimary,
    fontWeight: '600',
  },
  forgotPasswordText: {
    color: colors.buttonPrimary,
    textDecorationLine: 'underline',
    textAlign: 'right',
    width: '100%',
    marginBottom: 15,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: '100%', // Ensure button takes full width
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  websiteText: {
    fontSize: 14,
    color: colors.textDark,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '900',
  },
});

export default LoginPage;
