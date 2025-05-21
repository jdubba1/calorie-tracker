import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  InputAccessoryView,
} from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
import { 
  Entry, 
  loadEntries, 
  saveEntries, 
  loadCalorieGoal, 
  loadProteinGoal 
} from '../utils/storageService';

// Import shared styles
import { colors, getColorForPercentage } from '../styles/theme';
import { homeScreenStyles as styles } from '../styles/homeScreenStyles';

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
  const [calorieGoal, setCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');

  const totalCalories = todayEntries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = todayEntries.reduce((sum, e) => sum + e.protein, 0);

  const caloriePercentage = calorieGoal && totalCalories > 0 
    ? Math.round((totalCalories / parseInt(calorieGoal)) * 100) 
    : 0;
  
  const proteinPercentage = proteinGoal && totalProtein > 0
    ? Math.round((totalProtein / parseInt(proteinGoal)) * 100)
    : 0;

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
    
    // Filter and immediately update
    const todaysEntries = allEntries.filter(entry => isToday(entry.timestamp));
    console.log(`Updating today entries: ${todaysEntries.length} entries for today`);
    setTodayEntries(todaysEntries);
  }, [lastMidnightCheck]);

  // Add an additional effect to ensure todayEntries stays in sync with entries
  useEffect(() => {
    // Always make sure todayEntries is in sync with the main entries array
    updateTodayEntries(entries);
  }, [entries, updateTodayEntries]);

  // Refs for tracking loading state and preventing loops
  const initialLoadRef = useRef(false);
  
  // Initial load effect - only runs ONCE on mount
  useEffect(() => {
    const load = async () => {
      // Prevent duplicate loads
      if (initialLoadRef.current) return;
      initialLoadRef.current = true;
      
      try {
        const allEntries = await loadEntries();
        console.log(`HomeScreen: Initial load - ${allEntries.length} entries from storage`);
        
        // Always set entries on initial mount
        setEntries(allEntries);
        updateTodayEntries(allEntries);
        
        // Load goals
        const storedCalorieGoal = await loadCalorieGoal();
        const storedProteinGoal = await loadProteinGoal();
        
        if (storedCalorieGoal) {
          setCalorieGoal(storedCalorieGoal);
        }
        
        if (storedProteinGoal) {
          setProteinGoal(storedProteinGoal);
        }
        
        // Set initial data loaded flag AFTER we've loaded entries from storage
        prevEntriesRef.current = JSON.stringify(allEntries);
        isInitialDataLoadedRef.current = true;
        console.log('HomeScreen: Initial data loaded, persistence enabled');
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    load();
    
    // Set up a timer to check for storage changes and midnight rollover every 30 seconds
    const timer = setInterval(async () => {
      try {
        // Check for new data
        const freshEntries = await loadEntries();
        const currentIdsSet = new Set(entries.map(e => e.id));
        const freshIdsSet = new Set(freshEntries.map(e => e.id));
        
        // Check if entries were added or removed
        let hasChanges = false;
        
        // Check if any entries were added or removed
        if (currentIdsSet.size !== freshIdsSet.size) {
          hasChanges = true;
        } else {
          // Check if any entries in current aren't in fresh (deleted entries)
          for (const id of currentIdsSet) {
            if (!freshIdsSet.has(id)) {
              hasChanges = true;
              break;
            }
          }
          
          // Check if any entries in fresh aren't in current (new entries)
          for (const id of freshIdsSet) {
            if (!currentIdsSet.has(id)) {
              hasChanges = true;
              break;
            }
          }
        }
        
        if (hasChanges) {
          console.log('HomeScreen: Detected entry changes in timer, updating');
          setEntries(freshEntries);
        }
        
        // Always update today entries to handle midnight rollover
        updateTodayEntries(hasChanges ? freshEntries : entries);
      } catch (error) {
        console.error('Timer update error:', error);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(timer);
  }, []); // Empty dependency array - only run once on mount

  // Reload entries when screen comes into focus - USING REF TO PREVENT LOOPS
  const isLoadingRef = useRef(false);
  
  useFocusEffect(
    useCallback(() => {
      // Force a fresh reload of data every time the screen gains focus
      const load = async () => {
        try {
          console.log('HomeScreen: Screen focused, reloading data');
          isLoadingRef.current = true;
          
          // Always load fresh data from storage
          const allEntries = await loadEntries();
          console.log(`HomeScreen (focus): Loaded ${allEntries.length} entries from storage`);
          
          // Always update entries when the screen comes into focus
          setEntries(allEntries);
          updateTodayEntries(allEntries);
          
          // Update cached entries string to prevent immediate re-save
          prevEntriesRef.current = JSON.stringify(allEntries);
          
          // Set the initial data loaded flag if not already set
          if (!isInitialDataLoadedRef.current) {
            isInitialDataLoadedRef.current = true;
            console.log('HomeScreen: Initial data loaded via focus effect, persistence enabled');
          }
          
          // Reload goals
          const storedCalorieGoal = await loadCalorieGoal();
          const storedProteinGoal = await loadProteinGoal();
          
          if (storedCalorieGoal) {
            setCalorieGoal(storedCalorieGoal);
          }
          
          if (storedProteinGoal) {
            setProteinGoal(storedProteinGoal);
          }
        } catch (error) {
          console.error('Failed to load data:', error);
        } finally {
          isLoadingRef.current = false;
        }
      };
      
      // Execute load function
      load();
      
      // Close any open UI elements when returning to this screen
      return () => {
        // Cleanup if needed when screen loses focus
      };
    }, [updateTodayEntries]) // REMOVE entries dependency - it causes infinite loops!
  );

  // Track previous entries to avoid unnecessary saves
  const prevEntriesRef = useRef<string>('');
  const isInitialDataLoadedRef = useRef(false);
  
  useEffect(() => {
    const persistEntries = async () => {
      // Don't save until initial data is loaded from storage
      if (!isInitialDataLoadedRef.current) {
        console.log('HomeScreen: Skipping save, initial data not yet loaded');
        return;
      }
      
      // Create a string representation of current entries to compare with previous
      const entriesString = JSON.stringify(entries);
      
      // Skip if entries haven't changed
      if (entriesString === prevEntriesRef.current) {
        console.log('HomeScreen: Skipping save, entries unchanged');
        return;
      }
      
      try {
        console.log(`HomeScreen: Saving ${entries.length} entries (data changed)`);
        await saveEntries(entries);
        updateTodayEntries(entries);
        
        // Update ref after successful save
        prevEntriesRef.current = entriesString;
      } catch (error) {
        console.error('Failed to save entries:', error);
        Alert.alert(
          'Storage Error',
          'Failed to save your meal data. Please try again.'
        );
      }
    };
    
    // Always try to persist entries, but with change detection
    persistEntries();
  }, [entries, updateTodayEntries]);

  const addEntry = async () => {
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

    // Update state with new entry
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    
    // Explicitly save to storage right away
    try {
      await saveEntries(updatedEntries);
      console.log('Entry added and saved to storage');
    } catch (error) {
      console.error('Failed to save entry directly:', error);
    }
    
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
                <View style={styles.headerContainer}>
                  <Text style={styles.todayLabel}>Today</Text>
                  <TouchableOpacity 
                    style={styles.settingsButton}
                    onPress={() => navigation.navigate('Settings')}
                  >
                    <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.totalsContainer}>
                  <View style={styles.metricContainer}>
                    <Text style={styles.metricNumber}>{totalCalories}</Text>
                    <View style={styles.metricInfoContainer}>
                      {calorieGoal && (
                        <Text style={[
                          styles.metricInfoText, 
                          { color: getColorForPercentage(caloriePercentage) }
                        ]}>
                          {caloriePercentage}%
                        </Text>
                      )}
                      <Text style={styles.metricInfoText}>kcal</Text>
                    </View>
                  </View>
                  
                  <View style={styles.metricContainer}>
                    <Text style={styles.metricNumber}>{totalProtein}</Text>
                    <View style={styles.metricInfoContainer}>
                      {proteinGoal && (
                        <Text style={[
                          styles.metricInfoText, 
                          { color: getColorForPercentage(proteinPercentage) }
                        ]}>
                          {proteinPercentage}%
                        </Text>
                      )}
                      <Text style={styles.metricInfoText}>g protein</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.headerRow}>
                  <Text style={styles.inputLabel}>Describe your meal</Text>
                  <SquareSwitch
                    value={aiMode}
                    onValueChange={toggleManualMode}
                    leftLabel="Manual"
                    rightLabel="AI"
                    activeColor={colors.purple}
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
                  returnKeyType="done"               // show "done" key
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
              onPress={() => addEntry()}
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
    </SafeAreaView>
  );
}