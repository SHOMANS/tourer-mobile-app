import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// TODO: Uncomment when Google OAuth is fully configured
// import * as WebBrowser from 'expo-web-browser';
import { useAppStore } from '../store/appStore';

// TODO: Uncomment when Google OAuth is fully configured
// WebBrowser.maybeCompleteAuthSession();

// TODO: Uncomment when Google OAuth is fully configured
// const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo123');
  const { login, googleSignIn, isLoading } = useAppStore();

  // TODO: Uncomment when Google OAuth is fully configured
  /*
  // Use WebBrowser for direct Google OAuth (avoids PKCE issues)
  const redirectUri = 'https://auth.expo.io/@anonymous/mobile-app';

  const buildGoogleAuthUrl = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'id_token',
      scope: 'openid profile email',
      nonce: Math.random().toString(36).substring(2, 15),
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };
  */

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  // TODO: Uncomment when Google OAuth is fully configured
  /*
  const handleGoogleSignInSuccess = async (idToken: string) => {
    try {
      // Decode the ID token to get user info (basic decoding, not verified)
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const userInfo = JSON.parse(jsonPayload);
      
      await googleSignIn(idToken, userInfo);
      Alert.alert('Success', 'Signed in with Google successfully!');
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', error.message || 'Failed to sign in with Google');
    }
  };
  */

  // TODO: Uncomment when Google OAuth is fully configured
  /*
  const handleGoogleSignIn = async () => {
    try {
      const authUrl = buildGoogleAuthUrl();
      console.log('Opening Google Auth URL:', authUrl);
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      if (result.type === 'success') {
        // Extract id_token from URL fragment
        const url = result.url;
        const fragment = url.split('#')[1];
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const idToken = params.get('id_token');
          if (idToken) {
            await handleGoogleSignInSuccess(idToken);
          }
        }
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };
  */

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* TODO: Uncomment when Google OAuth is fully configured
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.googleButtonText}>
              {isLoading ? 'Signing in...' : '📧 Continue with Google'}
            </Text>
          </TouchableOpacity>
          */}

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    fontSize: 16,
    color: '#0066CC',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});