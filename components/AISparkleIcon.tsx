import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';

type AISparkleIconProps = {
  size?: number;
  color?: string;
};

export default function AISparkleIcon({ size = 24, color = '#f4f4f5' }: AISparkleIconProps) {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9.813 15.904L9 18.75l-.813-2.846L6 15.091l2.188-.813L9 11.25l.813 2.846L12 15.091l-2.187.813zM18.259 8.063l-.591 2.063-.592-2.063L15 7.47l2.076-.591L17.668 4.75l.591 2.063L20.335 7.47l-2.076.591zM16.902 18.644l-.517 1.814-.516-1.814-1.814-.516 1.814-.517 .516-1.814l.517 1.814 1.814.517-1.814.516zM15.041 2.439l-.789 2.764-.787-2.764-2.765-.787 2.765-.788 .787-2.765.789 2.765 2.764.788-2.764.787z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  }
}); 