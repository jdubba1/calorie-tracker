import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

type SquareSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
  activeColor?: string;
  inactiveColor?: string;
};

export default function SquareSwitch({
  value,
  onValueChange,
  leftLabel = "Off",
  rightLabel = "On",
  activeColor = "#a855f7", // purple-500
  inactiveColor = "#059669", // emerald-600r
}: SquareSwitchProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.option,
          !value && styles.activeOption,
          !value && { borderColor: inactiveColor },
        ]}
        onPress={() => onValueChange(false)}
      >
        <Text
          style={[
            styles.label,
            !value && styles.activeLabel,
            !value && { color: inactiveColor },
          ]}
        >
          {leftLabel}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          value && styles.activeOption,
          value && { borderColor: activeColor },
        ]}
        onPress={() => onValueChange(true)}
      >
        <Text
          style={[
            styles.label,
            value && styles.activeLabel,
            value && { color: activeColor },
          ]}
        >
          {rightLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0,
  },
  option: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#3f3f46", // zinc-700
    backgroundColor: "#27272a", // zinc-800
  },
  activeOption: {
    backgroundColor: "#18181b", // zinc-900
  },
  label: {
    color: "#a1a1aa", // zinc-400
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  activeLabel: {
    fontWeight: "bold",
  },
});
