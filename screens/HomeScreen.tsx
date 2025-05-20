import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  Dimensions,
  StatusBar,
  InputAccessoryView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { isToday } from '../utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { estimateNutrition } from '../utils/openaiUtils';
import { transcribeAudio } from '../utils/whisperUtils';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import AISparkleIcon from '../components/AISparkleIcon';
import MicrophoneIcon from '../components/MicrophoneIcon';
import StopIcon from '../components/StopIcon';
import LoadingDots from '../components/LoadingDots';
import SquareSwitch from '../components/SquareSwitch';

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

type Entry = {
  id: string;
  label?: string;
  calories: number;
  protein: number;
  timestamp: number;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const accessoryID = 'doneAccessory';
  const [label, setLabel] = useState('');
  const [caloriesInput, setCaloriesInput] = useState('');
  const [proteinInput, setProteinInput] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [todayEntries, setTodayEntries] = useState<Entry[]>([]);
  const [lastMidnightCheck, setLastMidnightCheck] = useState<string>('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [aiMode, setAIMode] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const totalCalories = todayEntries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = todayEntries.reduce((sum, e) => sum + e.protein, 0);

  // Request permissions for recording
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissions required', 'Please grant microphone permissions to use voice input');
      }
    })();
  }, []);

  // Filter entries to only show today's
  const updateTodayEntries = useCallback((allEntries: Entry[]) => {
    const today = new Date().toDateString();
    
    // Check if the date has changed since our last check
    if (lastMidnightCheck && lastMidnightCheck !== today) {
      // It's a new day, reset for today
      console.log('New day detected, resetting today view');
    }
    
    setLastMidnightCheck(today);
    setTodayEntries(allEntries.filter(entry => isToday(entry.timestamp)));
  }, [lastMidnightCheck]);

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem('entries');
      if (stored) {
        const allEntries = JSON.parse(stored);
        setEntries(allEntries);
        updateTodayEntries(allEntries);
      }
    };
    load();
    
    // Set up a timer to check for date changes every minute
    const timer = setInterval(() => {
      updateTodayEntries(entries);
    }, 60000); // Check every minute
    
    return () => clearInterval(timer);
  }, [updateTodayEntries]);

  // Reload entries when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const stored = await AsyncStorage.getItem('entries');
        if (stored) {
          const allEntries = JSON.parse(stored);
          setEntries(allEntries);
          updateTodayEntries(allEntries);
        }
      };
      load();
    }, [updateTodayEntries])
  );

  useEffect(() => {
    AsyncStorage.setItem('entries', JSON.stringify(entries));
    updateTodayEntries(entries);
  }, [entries, updateTodayEntries]);

  const addEntry = () => {
    const calories = parseInt(caloriesInput);
    const protein = parseInt(proteinInput);
    if (isNaN(calories) || isNaN(protein)) return;

    const newEntry: Entry = {
      id: Date.now().toString(),
      label: label.trim() || undefined,
      calories,
      protein,
      timestamp: Date.now(),
    };

    setEntries(prev => [newEntry, ...prev]);
    setLabel('');
    setCaloriesInput('');
    setProteinInput('');
    setIsAIGenerated(false);
    setErrorMessage(null);
    Keyboard.dismiss();
  };

  const clearInputs = () => {
    setLabel('');
    setCaloriesInput('');
    setProteinInput('');
    setIsAIGenerated(false);
    setErrorMessage(null);
    Keyboard.dismiss();
  };

  const toggleManualMode = () => {
    setAIMode(!aiMode);
    setManualMode(!aiMode);
    clearInputs();
  };

  const handleAIEstimate = async () => {
    if (!label.trim()) {
      Alert.alert('Please enter a food description', 'AI needs a description to provide nutrition estimates.');
      return;
    }

    setErrorMessage(null);
    setIsAILoading(true);
    try {
      const result = await estimateNutrition(label.trim());
      if (result) {
        if (!result.isFoodItem) {
          setErrorMessage('Failed to estimate calories: input doesn\'t appear to be a food item.');
          setCaloriesInput('');
          setProteinInput('');
        } else {
          setCaloriesInput(result.calories.toString());
          setProteinInput(result.protein.toString());
          setIsAIGenerated(true);
        }
      } else {
        setErrorMessage('Unable to get nutrition estimates. Please try again with a more detailed description.');
      }
    } catch (error) {
      console.error('Error estimating nutrition:', error);
      setErrorMessage('Something went wrong trying to estimate nutrition values.');
    } finally {
      setIsAILoading(false);
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      // Create recording object
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissions required', 'Please grant microphone permissions to use voice input');
        return;
      }
      
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      
      // Start recording
      await recording.startAsync();
      setRecording(recording);
      setIsRecording(true);
      setErrorMessage(null);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  // Stop recording and start transcription
  const stopRecording = async () => {
    if (!recording) return;
    
    setIsRecording(false);
    setIsTranscribing(true);
    
    try {
      await recording.stopAndUnloadAsync();
      
      // Get the file uri
      const uri = recording.getURI();
      if (!uri) {
        throw new Error('Recording URI not available');
      }
      
      // Transcribe the audio
      const transcript = await transcribeAudio(uri);
      
      if (transcript) {
        setLabel(transcript);
        
        // Automatically estimate nutrition based on transcript
        setIsAILoading(true);
        const result = await estimateNutrition(transcript);
        if (result) {
          if (!result.isFoodItem) {
            setErrorMessage('Failed to estimate calories: input doesn\'t appear to be a food item.');
            setCaloriesInput('');
            setProteinInput('');
          } else {
            setCaloriesInput(result.calories.toString());
            setProteinInput(result.protein.toString());
            setIsAIGenerated(true);
          }
        }
        setIsAILoading(false);
      } else {
        setErrorMessage('Unable to transcribe your voice. Please try again or enter your meal manually.');
      }
    } catch (error) {
      console.error('Failed to stop recording or transcribe', error);
      setErrorMessage('Failed to process your voice recording');
    } finally {
      setRecording(null);
      setIsTranscribing(false);
    }
  };

  // Handle the mic button press
  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Remove the keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          {/* Main scrollable content */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            style={{flex:1}}
            keyboardVerticalOffset={Platform.OS==='ios'?58:0}
          >
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inner}>
                <View style={styles.totalsContainer}>
                  <Text style={styles.todayLabel}>Today</Text>
                  <Text style={styles.metric}>
                    <Text style={styles.metricNumber}>{totalCalories}</Text>
                    <Text style={styles.metricUnit}> kcal</Text>
                  </Text>
                  <Text style={styles.metric}>
                    <Text style={styles.metricNumber}>{totalProtein}</Text>
                    <Text style={styles.metricUnit}> g protein</Text>
                  </Text>
                </View>

                <View style={styles.headerRow}>
                  <Text style={styles.inputLabel}>Describe your meal</Text>
                  <SquareSwitch
                    value={aiMode}
                    onValueChange={toggleManualMode}
                    leftLabel="Manual"
                    rightLabel="AI"
                    activeColor={colors.purple}
                    inactiveColor={colors.border}
                  />
                </View>

                {aiMode ? (
                  // Smart mode - large input with AI features
                  <>
                   <View style={styles.largeInputContainer}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={[styles.largeInput, isTranscribing && styles.disabledInput]}>
            {isTranscribing ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Transcribing</Text>
                <LoadingDots />
              </View>
            ) : (
              <TextInput
                style={styles.textArea}
                placeholder="what did you eat? (e.g. grilled chicken sandwich with fries)"
                placeholderTextColor={colors.textSecondary}
                value={label}
                onChangeText={text => {
                  setLabel(text);
                  isAIGenerated && setIsAIGenerated(false);
                  errorMessage && setErrorMessage(null);
                }}
                multiline
                inputAccessoryViewID={accessoryID}
                numberOfLines={3}
                onFocus={() => setFocusedInput('label')}
                onBlur={() => setFocusedInput(null)}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                editable={!isTranscribing}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
                    
                    <View style={styles.iconButtonRow}>
                      <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={clearInputs}
                      >
                        <Text style={styles.clearButtonText}>Clear</Text>
                      </TouchableOpacity>
                      
                      <View style={styles.rightButtons}>
                        <TouchableOpacity 
                          style={[styles.iconButton, isRecording && styles.recordingButton]}
                          onPress={handleMicPress}
                          disabled={isTranscribing}
                        >
                          {isTranscribing ? (
                            <ActivityIndicator size="small" color={colors.red} />
                          ) : (
                            <MicrophoneIcon size={24} isRecording={isRecording} />
                          )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.iconButton}
                          onPress={handleAIEstimate}
                          disabled={isAILoading || label.trim() === ''}
                        >
                          {isAILoading ? (
                            <ActivityIndicator size="small" color={colors.purple} />
                          ) : (
                            <AISparkleIcon size={24} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {errorMessage && (
                      <Text style={styles.errorMessage}>{errorMessage}</Text>
                    )}
                  </>
                ) : (
                  // Manual mode - simple text input
                  <TextInput
                  style={styles.input}
                  placeholder="what did you eat?"
                  placeholderTextColor={colors.textSecondary}
                  value={label}
                  onChangeText={setLabel}
                  returnKeyType="done"               // show “done” key
                  onSubmitEditing={dismissKeyboard}  
                  // inputAccessoryViewID={accessoryID}  // link to your toolbar
                  onFocus={() => setFocusedInput('label')}
                  onBlur={() => setFocusedInput(null)}
                />
                )}
                
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[
                        styles.input, 
                        styles.inputHalf, 
                        isAIGenerated && styles.aiGeneratedInput
                      ]}
                      placeholder="Calories"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      value={caloriesInput}
                      onChangeText={(text) => {
                        setCaloriesInput(text);
                        if (isAIGenerated) {
                          setIsAIGenerated(false);
                        }
                        if (errorMessage) {
                          setErrorMessage(null);
                        }
                      }}
                      returnKeyType="done"
                      onSubmitEditing={dismissKeyboard}
                      onFocus={() => {
                        console.log('Calories input focused');
                        setFocusedInput('calories');
                      }}
                      onBlur={() => {
                        console.log('Calories input blurred');
                        setFocusedInput(null);
                      }}
                    />
                    {caloriesInput !== '' && (
                      <Text style={styles.unitLabel}>kcal</Text>
                    )}
                  </View>
                  
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[
                        styles.input, 
                        styles.inputHalf, 
                        isAIGenerated && styles.aiGeneratedInput
                      ]}
                      placeholder="Protein (g)"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      value={proteinInput}
                      onChangeText={(text) => {
                        setProteinInput(text);
                        if (isAIGenerated) {
                          setIsAIGenerated(false);
                        }
                        if (errorMessage) {
                          setErrorMessage(null);
                        }
                      }}
                      returnKeyType="done"
                      onSubmitEditing={dismissKeyboard}
                      onFocus={() => {
                        console.log('Protein input focused');
                        setFocusedInput('protein');
                      }}
                      onBlur={() => {
                        console.log('Protein input blurred');
                        setFocusedInput(null);
                      }}
                    />
                    {proteinInput !== '' && (
                      <Text style={styles.unitLabel}>g</Text>
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          
          {/* Fixed bottom buttons */}
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={styles.buttonOutline}
              onPress={() => navigation.navigate('Meals')}
            >
              <Text style={styles.buttonOutlineText}>View Meals</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.buttonPrimary}
              onPress={addEntry}
            >
              <Text style={styles.buttonPrimaryText}>Add Meal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      
      {Platform.OS === 'ios' && focusedInput === 'label' && (
        <InputAccessoryView nativeID={accessoryID}>
            <View style={styles.accessoryContainer}>
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={() => Keyboard.dismiss()}
              >
                <Text style={styles.dismissButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
        </InputAccessoryView>
      )}


      {/* Custom numeric keyboard done button */}
      {/* {Platform.OS === 'ios' && isKeyboardVisible && (focusedInput === 'label') && (
        <View style={[
          styles.numericDoneContainer, 
          { bottom: keyboardHeight + 10 } // Position it 10px above the keyboard
        ]}>
          <TouchableOpacity
            style={styles.numericDoneButton}
            onPress={() => Keyboard.dismiss()}
          >
            <Text style={styles.numericDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )} */}
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    padding: 24,
    paddingBottom: 24,
  },
  totalsContainer: {
    marginBottom: 32,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  todayLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  metric: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  metricNumber: {
    fontSize: 84, // Bumped up by 20
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.text,
  },
  metricUnit: {
    fontSize: 24,
    alignSelf: 'flex-end',
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  largeInputContainer: {
    marginBottom: 0,
  },
  largeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 0,
    padding: 12,
    backgroundColor: colors.card,
    minHeight: 100,
    maxHeight: 150,
  },
  textArea: {
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlignVertical: 'top',
    padding: 0,
    height: '100%',
  },
  disabledInput: {
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  iconButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  rightButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginLeft: 8,
    width: 48,
    height: 48,
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    width: 90,
    height: 48,
  },
  clearButtonText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  recordingButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: colors.red,
  },
  errorMessage: {
    color: colors.red,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    marginBottom: 8,
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
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  inputWrapper: {
    width: '48%',
    position: 'relative',
  },
  inputHalf: {
    width: '100%',
  },
  unitLabel: {
    position: 'absolute',
    right: 12,
    top: 12,
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  aiGeneratedInput: {
    color: colors.purple,
    borderColor: colors.purple,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
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
  accessoryContainer: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dismissButton: {
    padding: 8,
  },
  dismissButtonText: {
    color: colors.green,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  numericDoneContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  numericDoneButton: {
    padding: 8,
    marginRight: 8,
  },
  numericDoneText: {
    color: colors.green,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});