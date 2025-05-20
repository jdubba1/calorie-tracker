import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

// Define theme colors
const colors = {
  background: '#18181b', // dark zinc-900
  card: '#27272a',      // dark zinc-800
  text: '#f4f4f5',      // zinc-100
  textSecondary: '#a1a1aa', // zinc-400
  border: '#3f3f46',    // zinc-700
  green: '#10b981',     // emerald-500
  greenLight: '#059669', // emerald-600
  purple: '#a855f7',    // purple-500
  red: '#f43f5e',       // rose-500
};

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const [calorieGoal, setCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const storedCalorieGoal = await AsyncStorage.getItem('calorieGoal');
      const storedProteinGoal = await AsyncStorage.getItem('proteinGoal');
      
      if (storedCalorieGoal) {
        setCalorieGoal(storedCalorieGoal);
      }
      
      if (storedProteinGoal) {
        setProteinGoal(storedProteinGoal);
      }
    } catch (error) {
      console.error('Failed to load goals', error);
    }
  };

  const saveGoals = async () => {
    try {
      await AsyncStorage.setItem('calorieGoal', calorieGoal);
      await AsyncStorage.setItem('proteinGoal', proteinGoal);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save goals', error);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>daily goals</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>daily calorie goal</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={calorieGoal}
                  onChangeText={setCalorieGoal}
                  placeholder="enter calorie goal"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
                {calorieGoal !== '' && (
                  <Text style={styles.unitLabel}>kcal</Text>
                )}
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>daily protein goal</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={proteinGoal}
                  onChangeText={setProteinGoal}
                  placeholder="enter protein goal"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
                {proteinGoal !== '' && (
                  <Text style={styles.unitLabel}>g</Text>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={styles.buttonOutline}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonOutlineText}>cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.buttonPrimary}
              onPress={saveGoals}
            >
              <Text style={styles.buttonPrimaryText}>save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 0,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: colors.card,
  },
  unitLabel: {
    position: 'absolute',
    right: 12,
    top: 12,
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 96,
  },
  buttonPrimary: {
    backgroundColor: colors.green,
    borderRadius: 0,
    padding: 14,
    width: '48%',
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonOutline: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 0,
    padding: 14,
    width: '48%',
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
}); 