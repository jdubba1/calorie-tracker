import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated as RNAnimated,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { Swipeable } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import {
  isFromDate,
  formatDateForDisplay,
  getOffsetDate,
} from "../utils/dateUtils";
import { Entry, loadEntries, saveEntries } from "../utils/storageService";
import { mealScreenStyles as styles } from "../styles/mealScreenStyles";
import { colors } from "../styles/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Meals">;

export default function MealsScreen({ navigation }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const swipeableRefs = useRef<Swipeable[]>([]);
  const [itemsBeingDeleted, setItemsBeingDeleted] = useState<{
    [key: string]: RNAnimated.Value;
  }>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const loadMealEntries = async () => {
    setIsLoading(true);
    try {
      const allEntries = await loadEntries();
      console.log(
        `MealScreen: Loaded ${allEntries.length} entries from storage`,
      );

      // Only update entries if we actually got some or if entries state is already empty
      // This prevents overwriting existing entries with an empty array
      if (allEntries.length > 0 || entries.length === 0) {
        setEntries(allEntries);
        filterEntriesByDate(allEntries, currentDate);
      }
    } catch (error) {
      console.error("Failed to load entries:", error);
      Alert.alert("Error", "Failed to load your meal data");
    } finally {
      setIsLoading(false);
    }
  };

  const filterEntriesByDate = (allEntries: Entry[], date: Date) => {
    setFilteredEntries(
      allEntries.filter((entry) => isFromDate(entry.timestamp, date)),
    );
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const prevDate = getOffsetDate(currentDate, -1);
    setCurrentDate(prevDate);
    filterEntriesByDate(entries, prevDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const nextDate = getOffsetDate(currentDate, 1);
    setCurrentDate(nextDate);
    filterEntriesByDate(entries, nextDate);
  };

  // Load entries on initial mount
  useEffect(() => {
    loadMealEntries();
    // Don't set entries to empty array on mount, which would trigger a save of empty data
  }, []);

  // When current date changes, filter entries
  useEffect(() => {
    // Only filter if we have entries to filter
    if (entries.length > 0 || filteredEntries.length > 0) {
      filterEntriesByDate(entries, currentDate);
    }
  }, [currentDate, entries]);

  // Reload entries whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // CRITICAL FIX: Skip if we're already in a loading cycle to prevent infinite loops
      if (!isLoadingRef.current) {
        isLoadingRef.current = true;

        // Load fresh data when screen appears, but only if really needed
        console.log("MealScreen (focus): Checking for new data");
        const checkForChanges = async () => {
          try {
            const freshEntries = await loadEntries();
            // Only update if data actually changed to avoid re-render loops
            const currentIds = entries
              .map((e) => e.id)
              .sort()
              .join(",");
            const newIds = freshEntries
              .map((e) => e.id)
              .sort()
              .join(",");

            if (currentIds !== newIds) {
              console.log("MealScreen: Entry data changed, updating");
              setEntries(freshEntries);
              filterEntriesByDate(freshEntries, currentDate);
            } else {
              console.log("MealScreen: No change in data, skipping update");
            }
          } catch (error) {
            console.error("Failed to check for changes:", error);
          } finally {
            isLoadingRef.current = false;
          }
        };

        checkForChanges();
      }

      // Close any open swipeables
      swipeableRefs.current.forEach((ref) => {
        if (ref && typeof ref.close === "function") {
          ref.close();
        }
      });
    }, []), // REMOVING entries dependency to prevent infinite loops
  );

  const deleteEntry = async (id: string) => {
    // Create new animated value for this item if it doesn't exist
    if (!itemsBeingDeleted[id]) {
      const newAnimValue = new RNAnimated.Value(1);
      setItemsBeingDeleted((prev) => ({ ...prev, [id]: newAnimValue }));

      // Close the swipeable if still open
      const index = filteredEntries.findIndex((e) => e.id === id);
      if (index !== -1 && swipeableRefs.current[index]) {
        swipeableRefs.current[index].close();
      }

      // Start the animation
      RNAnimated.timing(newAnimValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(async () => {
        // After animation completes, update the data
        const updated = entries.filter((e) => e.id !== id);
        setEntries(updated);

        // Persist changes - with better error handling and retry
        try {
          console.log(
            `Deleting entry ${id} and saving updated entries array (${updated.length} entries)`,
          );
          const saveSuccess = await saveEntries(updated);

          if (!saveSuccess) {
            // If the initial save failed, try once more
            console.log("First save attempt failed, retrying...");
            await saveEntries(updated);
          }
        } catch (error) {
          console.error("Failed to save after delete:", error);
          Alert.alert("Error", "Failed to delete meal. Please try again.");
        }

        // Remove this item from being tracked
        setItemsBeingDeleted((prev) => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      });
    }
  };

  const editEntry = (entry: Entry) => {
    navigation.navigate("EditMeal", {
      id: entry.id,
      label: entry.label,
      calories: entry.calories,
      protein: entry.protein,
      timestamp: entry.timestamp,
    });
  };

  const renderRightActions = (item: Entry) => {
    return (
      <View style={styles.rightAction}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteEntry(item.id)}
        >
          <Text style={styles.actionText}>Tap to Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLeftActions = (item: Entry) => {
    return (
      <View style={styles.leftAction}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => editEntry(item)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: Entry; index: number }) => {
    // Get animation value for this item if it exists
    const animValue = itemsBeingDeleted[item.id];

    // Create animated style if this item is being deleted
    const animatedStyle = animValue
      ? {
          opacity: animValue,
          transform: [
            {
              translateX: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
        }
      : {};

    return (
      <RNAnimated.View style={animatedStyle}>
        <Swipeable
          ref={(ref) => {
            if (ref) {
              swipeableRefs.current[index] = ref;
            }
          }}
          renderRightActions={() => renderRightActions(item)}
          renderLeftActions={() => renderLeftActions(item)}
          overshootRight={false}
          overshootLeft={false}
          friction={1} // Lower = less resistance (more responsive)
          rightThreshold={30} // Trigger right action sooner
          leftThreshold={30} // Trigger left action sooner
          enableTrackpadTwoFingerGesture // Support trackpad gestures on web/iOS
          hitSlop={{ left: 10, right: 10 }} // Increase touch area
        >
          <View style={styles.row}>
            <Text style={styles.label}>{item.label || "Untitled"}</Text>
            <Text style={styles.values}>
              {item.calories} kcal / {item.protein}g protein
            </Text>
          </View>
        </Swipeable>
      </RNAnimated.View>
    );
  };

  // Calculate daily totals
  const dailyCalories = filteredEntries.reduce((sum, e) => sum + e.calories, 0);
  const dailyProtein = filteredEntries.reduce((sum, e) => sum + e.protein, 0);

  return (
    <View style={styles.container}>
      <View style={styles.dateNavigation}>
        <TouchableOpacity style={styles.navButton} onPress={goToPreviousDay}>
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.dateText}>{formatDateForDisplay(currentDate)}</Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={goToNextDay}
          disabled={
            new Date(currentDate).setHours(0, 0, 0, 0) >=
            new Date().setHours(0, 0, 0, 0)
          }
        >
          <Text
            style={[
              styles.navButtonText,
              new Date(currentDate).setHours(0, 0, 0, 0) >=
              new Date().setHours(0, 0, 0, 0)
                ? styles.disabledText
                : {},
            ]}
          >
            →
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dailyTotals}>
        <Text style={styles.totalValue}>
          {dailyCalories} kcal / {dailyProtein}g protein
        </Text>
      </View>

      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No meals logged on this day.</Text>
        }
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.historyButtonContainer}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate("History")}
        >
          <Text style={styles.historyButtonText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
