import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    COLORS,
    SPACING,
    TYPOGRAPHY,
} from "../../lib/theme";

type RatingProps = {
  rating: number;
  reviewCount?: number;
  size?: "small" | "medium" | "large";
  showValue?: boolean;
};

export default function Rating({
  rating,
  reviewCount,
  size = "medium",
  showValue = true,
}: RatingProps) {
  const safeRating = Math.max(0, Math.min(5, rating));

  const starSize =
    size === "small"
      ? 14
      : size === "large"
      ? 24
      : 18;

  const valueSize =
    size === "small"
      ? 12
      : size === "large"
      ? 18
      : 14;

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={[
              styles.star,
              {
                fontSize: starSize,
                color:
                  star <= Math.round(safeRating)
                    ? COLORS.rating
                    : COLORS.textDim,
              },
            ]}
          >
            ★
          </Text>
        ))}
      </View>

      {showValue && (
        <Text
          style={[
            styles.ratingValue,
            { fontSize: valueSize },
          ]}
        >
          {safeRating.toFixed(1)}
        </Text>
      )}

      {reviewCount !== undefined && (
        <Text style={styles.reviewCount}>
          ({reviewCount})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  stars: {
    flexDirection: "row",
    alignItems: "center",
  },

  star: {
    marginRight: 2,
  },

  ratingValue: {
    color: COLORS.white,
    fontWeight: "800",
    marginLeft: SPACING.sm,
  },

  reviewCount: {
    color: COLORS.textMuted,
    ...TYPOGRAPHY.small,
    marginLeft: 4,
  },
});