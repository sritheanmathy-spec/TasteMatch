import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    COLORS,
    RADIUS,
    SPACING,
    TYPOGRAPHY,
} from "../../lib/theme";

import Rating from "./Rating";

type FoodCardProps = {
  id: number;
  name: string;
  restaurantName: string;
  category?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  rating?: number;
  reviewCount?: number;
  onPress: () => void;
  horizontal?: boolean;
};

export default function FoodCard({
  name,
  restaurantName,
  category,
  description,
  imageUrl,
  rating = 0,
  reviewCount = 0,
  onPress,
  horizontal = false,
}: FoodCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        horizontal && styles.horizontalCard,
      ]}
    >
      {/* FOOD IMAGE */}

      <View
        style={[
          styles.imageContainer,
          horizontal && styles.horizontalImage,
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>
              FOOD
            </Text>
          </View>
        )}

        {category ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {category.toUpperCase()}
            </Text>
          </View>
        ) : null}
      </View>

      {/* CONTENT */}

      <View
        style={[
          styles.content,
          horizontal && styles.horizontalContent,
        ]}
      >
        <Text
          style={styles.name}
          numberOfLines={1}
        >
          {name}
        </Text>

        <Text
          style={styles.restaurant}
          numberOfLines={1}
        >
          {restaurantName}
        </Text>

        {description ? (
          <Text
            style={styles.description}
            numberOfLines={2}
          >
            {description}
          </Text>
        ) : null}

        <View style={styles.ratingRow}>
          <Rating
            rating={rating}
            reviewCount={reviewCount}
            size="small"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 250,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  horizontalCard: {
    width: "100%",
    flexDirection: "row",
    minHeight: 130,
  },

  imageContainer: {
    width: "100%",
    height: 170,
    position: "relative",
    backgroundColor: COLORS.surfaceLight,
  },

  horizontalImage: {
    width: 125,
    height: "100%",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceLight,
  },

  placeholderText: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },

  categoryBadge: {
    position: "absolute",
    left: SPACING.md,
    bottom: SPACING.md,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: RADIUS.round,

    backgroundColor: "rgba(9, 9, 11, 0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  categoryText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  content: {
    padding: SPACING.lg,
  },

  horizontalContent: {
    flex: 1,
    justifyContent: "center",
  },

  name: {
    color: COLORS.white,
    ...TYPOGRAPHY.subheading,
  },

  restaurant: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.small,
    marginTop: 4,
  },

  description: {
    color: COLORS.textMuted,
    ...TYPOGRAPHY.small,
    lineHeight: 18,
    marginTop: SPACING.sm,
  },

  ratingRow: {
    marginTop: SPACING.md,
  },
});