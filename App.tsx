import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, StatusBar } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import MealsScreen from './screens/MealScreen';
import EditMealScreen from './screens/EditMealScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

// Define theme colors
const colors = {
  background: '#18181b', // dark zinc-900
  card: '#27272a',      // dark zinc-800
  text: '#f4f4f5',      // zinc-100
  textSecondary: '#a1a1aa', // zinc-400
  border: '#3f3f46',    // zinc-700
};

// Create a dark theme for navigation
const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.text,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

export type RootStackParamList = {
  Home: undefined;
  Meals: undefined;
  History: undefined;
  Settings: undefined;
  EditMeal: {
    id: string;
    label?: string;
    calories: number;
    protein: number;
    timestamp: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: colors.background,
            }
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Meals" 
            component={MealsScreen}
            options={{ title: 'Your Meals' }}
          />
          <Stack.Screen 
            name="History" 
            component={HistoryScreen}
            options={{ title: 'Meal History' }}
          />
          <Stack.Screen 
            name="EditMeal" 
            component={EditMealScreen}
            options={{ title: 'Edit Meal' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'Goals' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


