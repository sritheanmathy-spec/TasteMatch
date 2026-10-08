import { useEffect, useMemo, useState } from "react";

import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { router } from "expo-router";

import { supabase } from "../lib/supabase";
import { backend } from "../lib/backend";

import {
    COLORS,
    RADIUS,
    SPACING,
    TYPOGRAPHY,
} from "../lib/theme";

import PremiumCard from "../components/ui/PremiumCard";

import {
    getRecommendations,
    RecommendedDish,
} from "../lib/recommendations";

type Review = {
  id: number | string;
  user_id?: string | null;
  rating: number | null;
  overall_rating: number | null;
  spice_level: number | null;
  salt_level: number | null;
  sugar_level: number | null;
  sweetness_level: number | null;
};

function average(values: number[]) {
  if (values.length === 0) return 0;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function percentage(value: number) {
  return Math.round((value / 5) * 100);
}

function getPersonality(
  spice: number,
  sweetness: number,
  rating: number
) {
  if (spice >= 4) {
    return {
      title: "SPICE EXPLORER",
      icon: "🔥",
      description:
        "You enjoy bold, spicy flavours and dishes with a strong kick.",
    };
  }

  if (sweetness >= 4) {
    return {
      title: "SWEET SEEKER",
      icon: "🍯",
      description:
        "You tend to enjoy sweeter flavours and indulgent dishes.",
    };
  }

  if (rating >= 4.3) {
    return {
      title: "FOOD CRITIC",
      icon: "⭐",
      description:
        "You have strong opinions about food and tend to rate dishes carefully.",
    };
  }

  if (spice >= 3 && sweetness >= 3) {
    return {
      title: "BALANCED FOODIE",
      icon: "🍽️",
      description:
        "You enjoy a balanced combination of different taste profiles.",
    };
  }

  return {
    title: "CURIOUS FOODIE",
    icon: "✨",
    description:
      "You are exploring different flavours and discovering your preferences.",
  };
}

function TasteBar({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <View style={styles.tasteBlock}>
      <View style={styles.tasteHeader}>
        <Text style={styles.tasteLabel}>{label}</Text>

        <Text style={styles.tasteValue}>
          {value}%
        </Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            { width: `${value}%` },
          ]}
        />
      </View>

      <Text style={styles.tasteDescription}>
        {description}
      </Text>
    </View>
  );
}

export default function FoodProfileScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] =
    useState<RecommendedDish[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFoodProfile();
  }, []);

  async function loadFoodProfile() {
    try {
      setLoading(true);

      const userReviews = backend.getReviews();
      setReviews((userReviews as unknown as Review[]) || []);

      const recommended = await getRecommendations();
      setRecommendations(recommended || []);
    } catch (error) {
      console.log("Food profile error:", error);
    } finally {
      setLoading(false);
    }
  }

  const profile = useMemo(() => {
    const ratingValues = reviews
      .map((review) =>
        Number(
          review.overall_rating ??
            review.rating ??
            0
        )
      )
      .filter((value) => value > 0);

    const spiceValues = reviews
      .map((review) =>
        Number(review.spice_level ?? 0)
      )
      .filter((value) => value > 0);

    const saltValues = reviews
      .map((review) =>
        Number(review.salt_level ?? 0)
      )
      .filter((value) => value > 0);

    const sweetnessValues = reviews
      .map((review) =>
        Number(
          review.sugar_level ??
            review.sweetness_level ??
            0
        )
      )
      .filter((value) => value > 0);

    const averageRating = average(ratingValues);
    const averageSpice = average(spiceValues);
    const averageSalt = average(saltValues);
    const averageSweetness =
      average(sweetnessValues);

    return {
      averageRating,
      averageSpice,
      averageSalt,
      averageSweetness,

      ratingPercentage: percentage(
        averageRating
      ),

      spicePercentage: percentage(
        averageSpice
      ),

      saltPercentage: percentage(
        averageSalt
      ),

      sweetnessPercentage: percentage(
        averageSweetness
      ),
    };
  }, [reviews]);

  const personality = getPersonality(
    profile.averageSpice,
    profile.averageSweetness,
    profile.averageRating
  );

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color={COLORS.accent}
        />

        <Text style={styles.loadingText}>
          ANALYZING YOUR TASTE...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >

        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              FOOD INTELLIGENCE
            </Text>

            <Text style={styles.title}>
              Taste DNA
            </Text>

            <Text style={styles.subtitle}>
              Your personal flavour profile
            </Text>
          </View>

          <View style={styles.dnaIcon}>
            <Text style={styles.dnaIconText}>
              DNA
            </Text>
          </View>
        </View>


        {/* MAIN DNA CARD */}

        <PremiumCard
          elevated
          style={styles.mainCard}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardEyebrow}>
                YOUR TASTE
              </Text>

              <Text style={styles.cardTitle}>
                Food DNA
              </Text>
            </View>

            <View style={styles.reviewBadge}>
              <Text style={styles.reviewBadgeNumber}>
                {reviews.length}
              </Text>

              <Text style={styles.reviewBadgeText}>
                REVIEWS
              </Text>
            </View>
          </View>


          {/* SPICE */}

          <TasteBar
            label="SPICE"
            value={profile.spicePercentage}
            description={
              profile.spicePercentage >= 70
                ? "You enjoy bold heat."
                : profile.spicePercentage >= 40
                ? "You prefer moderate spice."
                : "You usually prefer mild flavours."
            }
          />


          {/* SALT */}

          <TasteBar
            label="SALT"
            value={profile.saltPercentage}
            description={
              profile.saltPercentage >= 70
                ? "You enjoy strongly seasoned dishes."
                : profile.saltPercentage >= 40
                ? "You prefer balanced seasoning."
                : "You prefer lighter seasoning."
            }
          />


          {/* SWEETNESS */}

          <TasteBar
            label="SWEETNESS"
            value={profile.sweetnessPercentage}
            description={
              profile.sweetnessPercentage >= 70
                ? "Sweet flavours are a big part of your taste."
                : profile.sweetnessPercentage >= 40
                ? "You enjoy some sweetness."
                : "You generally prefer less sweetness."
            }
          />

        </PremiumCard>


        {/* PERSONALITY */}

        <Text style={styles.sectionLabel}>
          FOOD PERSONALITY
        </Text>

        <PremiumCard
          elevated
          style={styles.personalityCard}
        >
          <View style={styles.personalityIcon}>
            <Text style={styles.personalityEmoji}>
              {personality.icon}
            </Text>
          </View>

          <View style={styles.personalityContent}>
            <Text style={styles.personalityTitle}>
              {personality.title}
            </Text>

            <Text style={styles.personalityDescription}>
              {personality.description}
            </Text>
          </View>
        </PremiumCard>


        {/* STATS */}

        <Text style={styles.sectionLabel}>
          YOUR FOOD STATS
        </Text>

        <View style={styles.statsRow}>

          <PremiumCard style={styles.statCard}>
            <Text style={styles.statNumber}>
              {profile.averageRating
                ? profile.averageRating.toFixed(1)
                : "—"}
            </Text>

            <Text style={styles.statLabel}>
              AVG RATING
            </Text>
          </PremiumCard>


          <PremiumCard style={styles.statCard}>
            <Text style={styles.statNumber}>
              {reviews.length}
            </Text>

            <Text style={styles.statLabel}>
              REVIEWS
            </Text>
          </PremiumCard>

        </View>


        {/* RECOMMENDATIONS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionLabel}>
              TASTE MATCHES
            </Text>

            <Text style={styles.sectionTitle}>
              Made for your palate
            </Text>
          </View>
        </View>


        {recommendations.length === 0 ? (

          <PremiumCard>
            <Text style={styles.emptyTitle}>
              More data needed
            </Text>

            <Text style={styles.emptyText}>
              Review a few more dishes and we'll
              build stronger recommendations for you.
            </Text>
          </PremiumCard>

        ) : (

          recommendations
            .slice(0, 5)
            .map((dish) => (

              <Pressable
                key={dish.id}
                onPress={() =>
                  router.push(
                    `/restaurant?id=${dish.id}`
                  )
                }
                style={({ pressed }) => [
                  styles.recommendation,
                  pressed && styles.pressed,
                ]}
              >

                <View style={styles.matchCircle}>
                  <Text style={styles.matchNumber}>
                    {dish.matchScore}%
                  </Text>

                  <Text style={styles.matchText}>
                    MATCH
                  </Text>
                </View>


                <View style={styles.recommendationInfo}>

                  <Text
                    style={styles.recommendationName}
                    numberOfLines={1}
                  >
                    {dish.name}
                  </Text>

                  <Text
                    style={styles.recommendationRestaurant}
                    numberOfLines={1}
                  >
                    {dish.restaurant_name}
                  </Text>

                  {dish.reasons &&
                  dish.reasons.length > 0 ? (

                    <Text
                      style={styles.reason}
                      numberOfLines={2}
                    >
                      {dish.reasons[0]}
                    </Text>

                  ) : null}

                </View>

                <Text style={styles.arrow}>
                  →
                </Text>

              </Pressable>

            ))

        )}


        {/* CALL TO ACTION */}

        <Pressable
          onPress={() =>
            router.push("/explore")
          }
          style={({ pressed }) => [
            styles.exploreButton,
            pressed && styles.pressed,
          ]}
        >
          <View>
            <Text style={styles.exploreEyebrow}>
              DISCOVER MORE
            </Text>

            <Text style={styles.exploreTitle}>
              Explore food for your taste
            </Text>
          </View>

          <Text style={styles.exploreArrow}>
            →
          </Text>
        </Pressable>


        <View style={styles.bottomSpace} />

      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: SPACING.lg,
  },

  container: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxxl,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xxl,
  },

  eyebrow: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 7,
  },

  title: {
    color: COLORS.white,
    ...TYPOGRAPHY.display,
  },

  subtitle: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    marginTop: 5,
  },

  dnaIcon: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },

  dnaIconText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  mainCard: {
    marginBottom: SPACING.xxxl,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },

  cardEyebrow: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  cardTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },

  reviewBadge: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 65,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  reviewBadgeNumber: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: "900",
  },

  reviewBadgeText: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 2,
  },

  tasteBlock: {
    marginBottom: SPACING.xxl,
  },

  tasteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },

  tasteLabel: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  tasteValue: {
    color: COLORS.accent,
    fontSize: 17,
    fontWeight: "900",
  },

  progressBackground: {
    height: 9,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.background,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.round,
  },

  tasteDescription: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 7,
  },

  sectionLabel: {
    color: COLORS.textMuted,
    ...TYPOGRAPHY.caption,
    marginBottom: SPACING.md,
  },

  personalityCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xxxl,
  },

  personalityIcon: {
    width: 62,
    height: 62,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.lg,
  },

  personalityEmoji: {
    fontSize: 29,
  },

  personalityContent: {
    flex: 1,
  },

  personalityTitle: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  personalityDescription: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.small,
    lineHeight: 19,
    marginTop: 5,
  },

  statsRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.xxxl,
  },

  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },

  statNumber: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "900",
  },

  statLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 5,
  },

  sectionHeader: {
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "800",
    marginTop: 2,
  },

  recommendation: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },

  matchCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accentDark,
    alignItems: "center",
    justifyContent: "center",
  },

  matchNumber: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: "900",
  },

  matchText: {
    color: COLORS.textMuted,
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 1,
  },

  recommendationInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },

  recommendationName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },

  recommendationRestaurant: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },

  reason: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 5,
  },

  arrow: {
    color: COLORS.accent,
    fontSize: 23,
    fontWeight: "700",
  },

  emptyTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
  },

  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  exploreButton: {
    marginTop: SPACING.lg,
    padding: SPACING.xxl,
    borderRadius: RADIUS.xxl,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accentDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  exploreEyebrow: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  exploreTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 5,
  },

  exploreArrow: {
    color: COLORS.accent,
    fontSize: 27,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },

  bottomSpace: {
    height: 40,
  },

});