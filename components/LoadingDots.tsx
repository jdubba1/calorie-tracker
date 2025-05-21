import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

type LoadingDotsProps = {
  color?: string;
};

export default function LoadingDots({ color = "#f4f4f5" }: LoadingDotsProps) {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      // Reset values
      dot1Opacity.setValue(0.3);
      dot2Opacity.setValue(0.3);
      dot3Opacity.setValue(0.3);

      // Sequence animation
      Animated.sequence([
        // Dot 1
        Animated.timing(dot1Opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Dot 2
        Animated.timing(dot2Opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Dot 3
        Animated.timing(dot3Opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Loop the animation
        setTimeout(animateDots, 500);
      });
    };

    animateDots();

    return () => {
      // Cleanup
      dot1Opacity.stopAnimation();
      dot2Opacity.stopAnimation();
      dot3Opacity.stopAnimation();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.dot, { color, opacity: dot1Opacity }]}>
        .
      </Animated.Text>
      <Animated.Text style={[styles.dot, { color, opacity: dot2Opacity }]}>
        .
      </Animated.Text>
      <Animated.Text style={[styles.dot, { color, opacity: dot3Opacity }]}>
        .
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 20,
  },
  dot: {
    fontSize: 30,
    marginHorizontal: 2,
    lineHeight: 30,
  },
});
