import React from "react";
import Svg, { Rect } from "react-native-svg";

interface StopIconProps {
  size: number;
  color?: string;
}

const StopIcon: React.FC<StopIconProps> = ({ size, color = "#f43f5e" }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="5" width="14" height="14" rx="2" fill={color} />
    </Svg>
  );
};

export default StopIcon;
