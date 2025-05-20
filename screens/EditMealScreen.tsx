import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
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
};

type Entry = {
  id: string;
  label?: string;
  calories: number;
  protein: number;
  timestamp: number;
};

type Props = NativeStackScreenProps<RootStackParamList, 'EditMeal'>;

export default function EditMealScreen({ navigation, route }: Props) {
  const { id, label: initialLabel, calories: initialCalories, protein: initialProtein, timestamp } = route.params;
  
  const [label, setLabel] = useState(initialLabel || '');
  const [caloriesInput, setCaloriesInput] = useState(initialCalories.toString());
  const [proteinInput, setProteinInput] = useState(initialProtein.toString());

  const handleSave = async () => {
    const calories = parseInt(caloriesInput);
    const protein = parseInt(proteinInput);
    
    if (isNaN(calories) || isNaN(protein)) return;

    const storedEntriesJson = await AsyncStorage.getItem('entries');
    if (!storedEntriesJson) return;
    
    const entries = JSON.parse(storedEntriesJson) as Entry[];
    const updatedEntries = entries.map((entry: Entry) => {
      if (entry.id === id) {
        return {
          ...entry,
          label: label.trim() || undefined,
          calories,
          protein,
        };
      }
      return entry;
    });

    await AsyncStorage.setItem('entries', JSON.stringify(updatedEntries));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
          <Text style={styles.title}>Edit Meal</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Optional label"
            placeholderTextColor={colors.textSecondary}
            value={label}
            onChangeText={setLabel}
          />
          
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Calories"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={caloriesInput}
              onChangeText={setCaloriesInput}
            />
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Protein (g)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={proteinInput}
              onChangeText={setProteinInput}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.buttonOutline}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonOutlineText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.buttonPrimary}
              onPress={handleSave}
            >
              <Text style={styles.buttonPrimaryText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    padding: 24,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 0,
    padding: 12,
    marginBottom: 12,
    fontSize: 18,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: colors.card,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    width: '48%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
    fontSize: 16,
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
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
}); 