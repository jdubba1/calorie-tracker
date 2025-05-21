import React, { useState, useEffect, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import {
  loadCalorieGoal,
  loadProteinGoal,
  saveGoals,
  STORAGE_KEYS,
} from "../utils/storageService";
import { settingsScreenStyles as styles } from "../styles/settingsScreenStyles";
import { colors } from "../styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export default function SettingsScreen({ navigation }: Props) {
  const [calorieGoal, setCalorieGoal] = useState("");
  const [proteinGoal, setProteinGoal] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log("SettingsScreen: Screen focused, loading fresh data");
      loadGoals();
    }, []),
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
      console.error("Failed to load goals", error);
      Alert.alert("Error", "Failed to load your goals");
    }
  };

  const saveGoalsAndNavigate = async () => {
    setIsSaving(true);
    try {
      const success = await saveGoals(calorieGoal, proteinGoal);

      if (success) {
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to save your goals. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save goals", error);
      Alert.alert("Error", "Failed to save your goals. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const resetOnboardingState = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      Alert.alert(
        "Onboarding Reset",
        "Onboarding state has been reset. Restart the app to see the onboarding screen.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Failed to reset onboarding:", error);
      Alert.alert("Error", "Failed to reset onboarding state");
    }
  };

  const resetAllData = async () => {
    Alert.alert(
      "Reset All Data",
      "This will clear ALL app data including meals and goals. Are you sure?",
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        { 
          text: "Reset Everything", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert(
                "Data Reset",
                "All app data has been reset. Restart the app to see the onboarding screen.",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error("Failed to reset data:", error);
              Alert.alert("Error", "Failed to reset app data");
            }
          }
        }
      ]
    );
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

            {/* Debug section - only shown in development mode */}
            {__DEV__ && (
              <View style={[styles.inputContainer, { marginTop: 40, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>developer options</Text>
                <TouchableOpacity
                  style={[styles.buttonOutline, { marginTop: 12 }]}
                  onPress={resetOnboardingState}
                >
                  <Text style={styles.buttonOutlineText}>reset onboarding</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.buttonOutline, { marginTop: 8, borderColor: colors.red }]}
                  onPress={resetAllData}
                >
                  <Text style={[styles.buttonOutlineText, { color: colors.red }]}>reset all data</Text>
                </TouchableOpacity>
              </View>
            )}
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
