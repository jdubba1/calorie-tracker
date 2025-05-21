import React from "react";
import { View, StyleSheet } from "react-native";
import { Svg, Path } from "react-native-svg";

type MicrophoneIconProps = {
  size?: number;
  color?: string;
  isRecording?: boolean;
};

export default function MicrophoneIcon({
  size = 24,
  color = "#f4f4f5",
  isRecording = false,
}: MicrophoneIconProps) {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
          fill={isRecording ? "#ef4444" : color}
        />
        <Path
          d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
          fill={isRecording ? "#ef4444" : color}
        />
      </Svg>
      {isRecording && <View style={styles.recordingIndicator} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  recordingIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
});
