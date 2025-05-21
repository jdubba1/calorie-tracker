import React, { useState, useEffect } from "react";
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
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import {
  saveGoals,
  setOnboardingComplete,
  loadCalorieGoal,
  loadProteinGoal,
} from "../utils/storageService";
import { settingsScreenStyles as styles } from "../styles/settingsScreenStyles";
import { colors } from "../styles/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const [calorieGoal, setCalorieGoal] = useState("");
  const [proteinGoal, setProteinGoal] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Check for existing goals when component mounts
  useEffect(() => {
    const checkExistingGoals = async () => {
      try {
        const storedCalorieGoal = await loadCalorieGoal();
        const storedProteinGoal = await loadProteinGoal();

        if (storedCalorieGoal) {
          console.log("Found existing calorie goal:", storedCalorieGoal);
          setCalorieGoal(storedCalorieGoal);
        }

        if (storedProteinGoal) {
          console.log("Found existing protein goal:", storedProteinGoal);
          setProteinGoal(storedProteinGoal);
        }
      } catch (error) {
        console.error("Failed to check for existing goals:", error);
        // Silent fail - just start with empty goals
      }
    };

    checkExistingGoals();
  }, []);

  const saveGoalsAndContinue = async () => {
    setIsSaving(true);
    try {
      // Save the goals if provided
      if (calorieGoal || proteinGoal) {
        const success = await saveGoals(calorieGoal, proteinGoal);
        if (!success) {
          Alert.alert("error", "couldn't save your goals. you can set them later in settings.");
        }
      }
      
      // Mark onboarding as complete regardless
      await setOnboardingComplete();
      
      // Navigate to the main app
      navigation.replace("Home");
    } catch (error) {
      console.error("failed to save onboarding data", error);
      Alert.alert("error", "couldn't save your preferences. try again or skip for now.");
      setIsSaving(false);
    }
  };

  const skipOnboarding = async () => {
    try {
      // Mark onboarding as complete without saving goals
      await setOnboardingComplete();
      navigation.replace("Home");
    } catch (error) {
      console.error("failed to skip onboarding", error);
      Alert.alert("error", "something went wrong. please try again.");
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
            <Text style={styles.title}>welcome to calorie tracker</Text>
            <Text style={[styles.label, { marginBottom: 24 }]}>
              set your daily goals to get started
            </Text>

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
                {calorieGoal !== "" && (
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
                {proteinGoal !== "" && <Text style={styles.unitLabel}>g</Text>}
              </View>
            </View>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.buttonOutline}
              onPress={skipOnboarding}
              disabled={isSaving}
            >
              <Text style={styles.buttonOutlineText}>skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={saveGoalsAndContinue}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonPrimaryText}>continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
} 