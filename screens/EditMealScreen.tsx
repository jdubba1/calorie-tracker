import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { Entry, loadEntries, saveEntries } from "../utils/storageService";
import { editMealScreenStyles as styles } from "../styles/editMealScreenStyles";
import { colors } from "../styles/theme";

type Props = NativeStackScreenProps<RootStackParamList, "EditMeal">;

export default function EditMealScreen({ navigation, route }: Props) {
  const {
    id,
    label: initialLabel,
    calories: initialCalories,
    protein: initialProtein,
    timestamp,
  } = route.params;

  const [label, setLabel] = useState(initialLabel || "");
  const [caloriesInput, setCaloriesInput] = useState(
    initialCalories.toString(),
  );
  const [proteinInput, setProteinInput] = useState(initialProtein.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const calories = parseInt(caloriesInput);
    const protein = parseInt(proteinInput);

    if (isNaN(calories) || isNaN(protein)) {
      Alert.alert(
        "Invalid input",
        "Please enter valid numbers for calories and protein",
      );
      return;
    }

    setIsSaving(true);
    try {
      // Load fresh entries every time to avoid overwriting other changes
      const currentEntries = await loadEntries();
      console.log(
        `Editing meal ${id} - loaded ${currentEntries.length} entries for updating`,
      );

      // Update the specific entry
      const updatedEntries = currentEntries.map((entry: Entry) => {
        if (entry.id === id) {
          console.log(`Found entry to update: ${entry.id}`);
          return {
            ...entry,
            label: label.trim() || undefined,
            calories,
            protein,
          };
        }
        return entry;
      });

      // Save the updated entries
      console.log(`Saving ${updatedEntries.length} entries after edit`);
      const success = await saveEntries(updatedEntries);

      if (success) {
        console.log("Edit saved successfully");
        navigation.goBack();
      } else {
        console.error("First save attempt failed, retrying...");
        // Try once more with fresh data
        const freshEntries = await loadEntries();
        const retryUpdatedEntries = freshEntries.map((entry: Entry) => {
          if (entry.id === id) {
            console.log(`Retry: Found entry to update: ${entry.id}`);
            return {
              ...entry,
              label: label.trim() || undefined,
              calories,
              protein,
            };
          }
          return entry;
        });

        const retrySuccess = await saveEntries(retryUpdatedEntries);
        if (retrySuccess) {
          console.log("Edit saved successfully on retry");
          navigation.goBack();
        } else {
          Alert.alert("Error", "Failed to save changes. Please try again.");
        }
      }
    } catch (error) {
      console.error("Failed to save meal update:", error);
      Alert.alert("Error", "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.inner}
        >
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
              disabled={isSaving}
            >
              <Text style={styles.buttonOutlineText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonPrimaryText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
