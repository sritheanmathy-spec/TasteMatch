import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    COLORS,
    SPACING,
    TYPOGRAPHY,
} from "../../lib/theme";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
};

export default function SectionHeader({
  title,
  subtitle,
  actionText,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>

        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>

      {actionText && onActionPress ? (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.7}
        >
          <Text style={styles.action}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    color: COLORS.white,
    ...TYPOGRAPHY.heading,
  },

  subtitle: {
    color: COLORS.textMuted,
    ...TYPOGRAPHY.small,
    marginTop: 3,
  },

  action: {
    color: COLORS.accent,
    ...TYPOGRAPHY.smallBold,
    marginLeft: SPACING.md,
  },
});