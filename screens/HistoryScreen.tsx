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
import { Entry, loadEntries } from "../utils/storageService";
import { historyScreenStyles as styles } from "../styles/historyScreenStyles";
import { colors } from "../styles/theme";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

export default function HistoryScreen({ navigation }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [dailyStats, setDailyStats] = useState<Record<string, EntryStat>>({});
  const [averages, setAverages] = useState({ avgCalories: 0, avgProtein: 0 });
  const [isLoading, setIsLoading] = useState(false);

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

          // Calculate averages (excluding today)
          const avgs = calculateAverages(stats);
          setAverages(avgs);
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

    return (
      <View style={styles.statCard}>
        <Text style={styles.dateText}>{formatDateForDisplay(date)}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.totalCalories}</Text>
            <Text style={styles.statLabel}>calories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.totalProtein}</Text>
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
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>Averages (excluding today)</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{averages.avgCalories}</Text>
                <Text style={styles.statLabel}>calories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{averages.avgProtein}</Text>
                <Text style={styles.statLabel}>g protein</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No history data available.</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}
