import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Svg, Rect } from 'react-native-svg';

type StopIconProps = {
  size?: number;
  color?: string;
};

export default function StopIcon({ size = 24, color = '#ef4444' }: StopIconProps) {
  // Create animated value for pulsing effect
  const pulseAnim = new Animated.Value(1);
  
  // Set up pulsing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.pulsingBorder,
          {
            width: size + 10,
            height: size + 10,
            borderRadius: 4,
            transform: [{ scale: pulseAnim }]
          }
        ]}
      />
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect
          x="5"
          y="5"
          width="14"
          height="14"
          fill={color}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  pulsingBorder: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#ef4444',
    opacity: 0.7,
  }
}); 