import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from './src/store/appStore';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MainScreen from './src/screens/MainScreen';
import HomeScreen from './src/screens/HomeScreen';
import HealthScreen from './src/screens/HealthScreen';
import ToursScreen from './src/screens/ToursScreen';
import TourDetailScreen from './src/screens/TourDetailScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SplashScreen from './src/screens/SplashScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: '#0066CC' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Sign In' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Create Account' }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tours') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tours" component={ToursScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: { backgroundColor: '#0066CC' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TourDetail"
        component={TourDetailScreen}
        options={{ title: 'Tour Details' }}
      />
      <Stack.Screen
        name="Profile"
        component={HealthScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const { user, loadStoredAuth } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await loadStoredAuth();
      } catch (error) {
        console.error('Error loading stored auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [loadStoredAuth]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={handleSplashFinish} />
      </SafeAreaProvider>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <LoadingScreen />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? <MainStack /> : <AuthStack />}
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0066CC',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
});
