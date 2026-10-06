import { ReactNode } from "react";
import {
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";

import {
    COLORS,
    RADIUS,
    SHADOWS,
    SPACING,
} from "../../lib/theme";

type PremiumCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  padding?: number;
};

export default function PremiumCard({
  children,
  style,
  elevated = false,
  padding = SPACING.lg,
}: PremiumCardProps) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,

    ...SHADOWS.card,
  },

  elevated: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.borderLight,

    ...SHADOWS.floating,
  },
});