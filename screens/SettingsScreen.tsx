import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useFocusEffect } from '@react-navigation/native';
import { 
  loadCalorieGoal, 
  loadProteinGoal, 
  saveGoals 
} from '../utils/storageService';
import { settingsScreenStyles as styles } from '../styles/settingsScreenStyles';
import { colors } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const [calorieGoal, setCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('SettingsScreen: Screen focused, loading fresh data');
      loadGoals();
    }, [])
  );

  const loadGoals = async () => {
    try {
      const storedCalorieGoal = await loadCalorieGoal();
      const storedProteinGoal = await loadProteinGoal();
      
      if (storedCalorieGoal) {
        setCalorieGoal(storedCalorieGoal);
      }
      
      if (storedProteinGoal) {
        setProteinGoal(storedProteinGoal);
      }
    } catch (error) {
      console.error('Failed to load goals', error);
      Alert.alert('Error', 'Failed to load your goals');
    }
  };

  const saveGoalsAndNavigate = async () => {
    setIsSaving(true);
    try {
      const success = await saveGoals(calorieGoal, proteinGoal);
      
      if (success) {
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to save your goals. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save goals', error);
      Alert.alert('Error', 'Failed to save your goals. Please try again.');
    } finally {
      setIsSaving(false);
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
              disabled={isSaving}
            >
              <Text style={styles.buttonOutlineText}>cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.buttonPrimary}
              onPress={saveGoalsAndNavigate}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonPrimaryText}>save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
} 