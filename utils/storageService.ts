import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys used in storage
export const STORAGE_KEYS = {
  ENTRIES: "entries",
  CALORIE_GOAL: "calorieGoal",
  PROTEIN_GOAL: "proteinGoal",
  ONBOARDING_COMPLETE: "onboardingComplete",
};

// Entry type definition
export type Entry = {
  id: string;
  label?: string;
  calories: number;
  protein: number;
  timestamp: number;
};

// Maximum retry attempts
const MAX_RETRIES = 3;

/**
 * Attempts to store data with retries
 */
async function storeWithRetry<T>(
  key: string,
  data: T,
  retries = 0,
): Promise<boolean> {
  try {
    console.log(
      `STORAGE: Attempting to store data to key "${key}" (attempt ${retries + 1})`,
    );
    await AsyncStorage.setItem(key, JSON.stringify(data));
    console.log(`STORAGE: Successfully stored data to key "${key}"`);
    return true;
  } catch (error) {
    console.error(
      `Storage error (attempt ${retries + 1}/${MAX_RETRIES}):`,
      error,
    );

    if (retries < MAX_RETRIES - 1) {
      // Wait a bit before retrying (exponential backoff)
      const delay = Math.pow(2, retries) * 100;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return storeWithRetry(key, data, retries + 1);
    }

    console.error(`Failed to store data after ${MAX_RETRIES} attempts`);
    return false;
  }
}

/**
 * Attempts to retrieve data with retries
 */
async function retrieveWithRetry<T>(
  key: string,
  retries = 0,
): Promise<T | null> {
  try {
    console.log(
      `STORAGE: Attempting to retrieve data from key "${key}" (attempt ${retries + 1})`,
    );
    const data = await AsyncStorage.getItem(key);
    if (data) {
      console.log(`STORAGE: Successfully retrieved data from key "${key}"`);
    } else {
      console.log(`STORAGE: No data found for key "${key}"`);
    }
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(
      `Retrieval error (attempt ${retries + 1}/${MAX_RETRIES}):`,
      error,
    );

    if (retries < MAX_RETRIES - 1) {
      // Wait a bit before retrying (exponential backoff)
      const delay = Math.pow(2, retries) * 100;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retrieveWithRetry(key, retries + 1);
    }

    console.error(`Failed to retrieve data after ${MAX_RETRIES} attempts`);
    return null;
  }
}

/**
 * Save entries to storage
 */
export const saveEntries = async (entries: Entry[]): Promise<boolean> => {
  console.log(`STORAGE: Saving ${entries.length} entries to storage...`);
  const success = await storeWithRetry(STORAGE_KEYS.ENTRIES, entries);

  if (success) {
    console.log(
      `STORAGE: Entries saved successfully (${entries.length} entries)`,
    );
  } else {
    console.error("STORAGE: Failed to save entries!");
  }

  return success;
};

/**
 * Load entries from storage
 */
export const loadEntries = async (): Promise<Entry[]> => {
  console.log("STORAGE: Loading entries from storage...");
  const entries = await retrieveWithRetry<Entry[]>(STORAGE_KEYS.ENTRIES);

  if (entries) {
    console.log(`STORAGE: Loaded ${entries.length} entries successfully`);
    return entries;
  }

  console.log("STORAGE: No entries found, returning empty array");
  return [];
};

/**
 * Save calorie goal to storage
 */
export const saveCalorieGoal = async (goal: string): Promise<boolean> => {
  console.log(`Saving calorie goal: ${goal}`);
  return await storeWithRetry(STORAGE_KEYS.CALORIE_GOAL, goal);
};

/**
 * Load calorie goal from storage
 */
export const loadCalorieGoal = async (): Promise<string | null> => {
  console.log("Loading calorie goal...");
  return await retrieveWithRetry<string>(STORAGE_KEYS.CALORIE_GOAL);
};

/**
 * Save protein goal to storage
 */
export const saveProteinGoal = async (goal: string): Promise<boolean> => {
  console.log(`Saving protein goal: ${goal}`);
  return await storeWithRetry(STORAGE_KEYS.PROTEIN_GOAL, goal);
};

/**
 * Load protein goal from storage
 */
export const loadProteinGoal = async (): Promise<string | null> => {
  console.log("Loading protein goal...");
  return await retrieveWithRetry<string>(STORAGE_KEYS.PROTEIN_GOAL);
};

/**
 * Save both goals at once
 */
export const saveGoals = async (
  calorieGoal: string,
  proteinGoal: string,
): Promise<boolean> => {
  console.log("Saving both goals...");
  const calorieSuccess = await saveCalorieGoal(calorieGoal);
  const proteinSuccess = await saveProteinGoal(proteinGoal);
  return calorieSuccess && proteinSuccess;
};

/**
 * Mark onboarding as complete
 */
export const setOnboardingComplete = async (): Promise<boolean> => {
  console.log("Marking onboarding as complete");
  return await storeWithRetry(STORAGE_KEYS.ONBOARDING_COMPLETE, "true");
};

/**
 * Check if onboarding has been completed
 */
export const isOnboardingComplete = async (): Promise<boolean> => {
  console.log("Checking if onboarding is complete");
  const result = await retrieveWithRetry<string>(STORAGE_KEYS.ONBOARDING_COMPLETE);
  return result === "true";
};

/**
 * Clear all stored data (use with caution)
 */
export const clearAllData = async (): Promise<boolean> => {
  console.log("⚠️ Clearing all stored data...");
  try {
    await AsyncStorage.clear();
    console.log("All data cleared successfully");
    return true;
  } catch (error) {
    console.error("Failed to clear data:", error);
    return false;
  }
};
