import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { calculateDailyStats, calculateAverages, EntryStat, formatDateForDisplay } from '../utils/dateUtils';

// Define theme colors
const colors = {
  background: '#18181b', // dark zinc-900
  card: '#27272a',      // dark zinc-800
  text: '#f4f4f5',      // zinc-100
  textSecondary: '#a1a1aa', // zinc-400
  border: '#3f3f46',    // zinc-700
  green: '#10b981',     // emerald-500
};

type Entry = {
  id: string;
  label?: string;
  calories: number;
  protein: number;
  timestamp: number;
};

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [dailyStats, setDailyStats] = useState<Record<string, EntryStat>>({});
  const [averages, setAverages] = useState({ avgCalories: 0, avgProtein: 0 });

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem('entries');
      if (stored) {
        const loadedEntries = JSON.parse(stored);
        setEntries(loadedEntries);
        
        // Calculate daily stats
        const stats = calculateDailyStats(loadedEntries);
        setDailyStats(stats);
        
        // Calculate averages (excluding today)
        const avgs = calculateAverages(stats);
        setAverages(avgs);
      }
    };
    load();
  }, []);

  // Convert daily stats object to array and sort by date (newest first)
  const dailyStatsArray = Object.values(dailyStats).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
        keyExtractor={item => item.date}
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
        ListEmptyComponent={<Text style={styles.emptyText}>No history data available.</Text>}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  footer: {
    marginTop: 30,
    padding: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statCard: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  }
}); 