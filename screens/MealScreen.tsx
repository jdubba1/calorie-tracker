import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Animated as RNAnimated, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { isFromDate, formatDateForDisplay, getOffsetDate } from '../utils/dateUtils';

// Define theme colors
const colors = {
  background: '#18181b', // dark zinc-900
  card: '#27272a',      // dark zinc-800
  text: '#f4f4f5',      // zinc-100
  textSecondary: '#a1a1aa', // zinc-400
  border: '#3f3f46',    // zinc-700
  green: '#10b981',     // emerald-500
  red: '#ef4444',       // red-500
};

type Entry = {
  id: string;
  label?: string;
  calories: number;
  protein: number;
  timestamp: number;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Meals'>;

export default function MealsScreen({ navigation }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const swipeableRefs = useRef<Swipeable[]>([]);
  const [itemsBeingDeleted, setItemsBeingDeleted] = useState<{[key: string]: RNAnimated.Value}>({});
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadEntries = async () => {
    const stored = await AsyncStorage.getItem('entries');
    if (stored) {
      const allEntries = JSON.parse(stored);
      setEntries(allEntries);
      filterEntriesByDate(allEntries, currentDate);
    }
  };

  const filterEntriesByDate = (allEntries: Entry[], date: Date) => {
    setFilteredEntries(
      allEntries.filter(entry => isFromDate(entry.timestamp, date))
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
    loadEntries();
  }, []);

  // When current date changes, filter entries
  useEffect(() => {
    filterEntriesByDate(entries, currentDate);
  }, [currentDate, entries]);

  // Reload entries whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadEntries();
      
      // Close any open swipeables
      swipeableRefs.current.forEach(ref => {
        if (ref && typeof ref.close === 'function') {
          ref.close();
        }
      });
    }, [])
  );

  const deleteEntry = (id: string) => {
    // Create new animated value for this item if it doesn't exist
    if (!itemsBeingDeleted[id]) {
      const newAnimValue = new RNAnimated.Value(1);
      setItemsBeingDeleted(prev => ({...prev, [id]: newAnimValue}));
      
      // Close the swipeable if still open
      const index = filteredEntries.findIndex(e => e.id === id);
      if (index !== -1 && swipeableRefs.current[index]) {
        swipeableRefs.current[index].close();
      }
      
      // Start the animation
      RNAnimated.timing(newAnimValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        // After animation completes, update the data
        const updated = entries.filter(e => e.id !== id);
        setEntries(updated);
        AsyncStorage.setItem('entries', JSON.stringify(updated));
        
        // Remove this item from being tracked
        setItemsBeingDeleted(prev => {
          const newState = {...prev};
          delete newState[id];
          return newState;
        });
      });
    }
  };

  const editEntry = (entry: Entry) => {
    navigation.navigate('EditMeal', {
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

  const renderItem = ({ item, index }: { item: Entry, index: number }) => {
    // Get animation value for this item if it exists
    const animValue = itemsBeingDeleted[item.id];
    
    // Create animated style if this item is being deleted
    const animatedStyle = animValue ? {
      opacity: animValue,
      transform: [{
        translateX: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 0]
        })
      }]
    } : {};

    return (
      <RNAnimated.View style={animatedStyle}>
        <Swipeable
          ref={ref => {
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
            <Text style={styles.label}>{item.label || 'Untitled'}</Text>
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
          disabled={new Date(currentDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)}
        >
          <Text style={[
            styles.navButtonText,
            new Date(currentDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0) ? styles.disabledText : {}
          ]}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dailyTotals}>
        <Text style={styles.totalValue}>{dailyCalories} kcal / {dailyProtein}g protein</Text>
      </View>
      
      <FlatList
        data={filteredEntries}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No meals logged on this day.</Text>}
        contentContainerStyle={styles.listContent}
      />
      
      <View style={styles.historyButtonContainer}>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.historyButtonText}>View History</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100, // Extra padding at bottom
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  navButton: {
    padding: 10,
    width: 44,
    alignItems: 'center',
  },
  navButtonText: {
    color: colors.text,
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  disabledText: {
    color: colors.border,
  },
  dateText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  dailyTotals: {
    padding: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  totalValue: {
    color: colors.text,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  row: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 0,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  values: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 0,
    marginBottom: 12,
    backgroundColor: colors.red,
  },
  leftAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 0,
    marginBottom: 12,
    backgroundColor: colors.green,
  },
  actionButton: {
    padding: 16,
    width: 100,
    alignItems: 'center',
  },
  actionText: {
    color: colors.text,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  historyButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButton: {
    backgroundColor: colors.card,
    padding: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyButtonText: {
    color: colors.text,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});