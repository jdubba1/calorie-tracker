import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useFocusEffect } from "@react-navigation/native";
import {
  calculateDailyStats,
  calculateAverages,
  EntryStat,
  formatDateForDisplay,
} from "../utils/dateUtils";
import { Entry, loadEntries, loadCalorieGoal, loadProteinGoal } from "../utils/storageService";
import { historyScreenStyles as styles } from "../styles/historyScreenStyles";
import { colors, getColorForPercentage } from "../styles/theme";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

export default function HistoryScreen({ navigation }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [dailyStats, setDailyStats] = useState<Record<string, EntryStat>>({});
  const [averages, setAverages] = useState({ avgCalories: 0, avgProtein: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState("");
  const [proteinGoal, setProteinGoal] = useState("");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        try {
          console.log("HistoryScreen: Screen focused, loading fresh data");
          const loadedEntries = await loadEntries();
          setEntries(loadedEntries);

          // Calculate daily stats
          const stats = calculateDailyStats(loadedEntries);
          setDailyStats(stats);

          // Calculate averages
          const avgs = calculateAverages(stats);
          setAverages(avgs);
          
          // Load goals
          const storedCalorieGoal = await loadCalorieGoal();
          const storedProteinGoal = await loadProteinGoal();
          
          if (storedCalorieGoal) {
            setCalorieGoal(storedCalorieGoal);
          }
          
          if (storedProteinGoal) {
            setProteinGoal(storedProteinGoal);
          }
        } catch (error) {
          console.error("Failed to load history data:", error);
          Alert.alert("Error", "Failed to load history data");
        } finally {
          setIsLoading(false);
        }
      };
      load();
    }, []),
  );

  // Convert daily stats object to array and sort by date (newest first)
  const dailyStatsArray = Object.values(dailyStats).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  const renderDailyStatItem = ({ item }: { item: EntryStat }) => {
    const date = new Date(item.date);
    
    // Calculate percentages for coloring
    const caloriePercentage = calorieGoal && item.totalCalories > 0
      ? Math.round((item.totalCalories / parseInt(calorieGoal)) * 100)
      : 0;
    
    const proteinPercentage = proteinGoal && item.totalProtein > 0
      ? Math.round((item.totalProtein / parseInt(proteinGoal)) * 100)
      : 0;

    return (
      <View style={styles.statCard}>
        <Text style={styles.dateText}>{formatDateForDisplay(date)}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text 
              style={[
                styles.statValue, 
                calorieGoal && { color: getColorForPercentage(caloriePercentage) }
              ]}
            >
              {item.totalCalories}
            </Text>
            <Text style={styles.statLabel}>calories</Text>
          </View>
          <View style={styles.statItem}>
            <Text 
              style={[
                styles.statValue, 
                proteinGoal && { color: getColorForPercentage(proteinPercentage, true) }
              ]}
            >
              {item.totalProtein}
            </Text>
            <Text style={styles.statLabel}>g protein</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.count}</Text>
            <Text style={styles.statLabel}>meals</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dailyStatsArray}
        keyExtractor={(item) => item.date}
        renderItem={renderDailyStatItem}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Daily Stats</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <>
            <View style={styles.averagesHeader}>
              <Text style={styles.headerTitle}>Averages</Text>
            </View>
            <View style={styles.footer}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{averages.avgCalories}</Text>
                  <Text style={styles.statLabel}>calories</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{averages.avgProtein}</Text>
                  <Text style={styles.statLabel}>g protein</Text>
                </View>
                <View style={styles.statItem}>
                  {/* Empty view to maintain layout */}
                </View>
              </View>
            </View>
            <Text style={styles.tooltipText}>*averages exclude the current day</Text>
          </>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No history data available.</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}
