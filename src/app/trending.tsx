import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    getHighestRatedDishes,
    getMostReviewedDishes,
    getMostSavedDishes,
    getTrendingDishes,
    TrendingDish,
} from "../lib/trending";

export default function TrendingScreen() {
  const router = useRouter();

  const [trending, setTrending] = useState<
    TrendingDish[]
  >([]);

  const [highestRated, setHighestRated] =
    useState<TrendingDish[]>([]);

  const [mostReviewed, setMostReviewed] =
    useState<TrendingDish[]>([]);

  const [mostSaved, setMostSaved] =
    useState<TrendingDish[]>([]);

  const [loading, setLoading] =
    useState(true);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      setLoading(true);

      const [
        trendingData,
        ratedData,
        reviewedData,
        savedData,
      ] = await Promise.all([
        getTrendingDishes(),
        getHighestRatedDishes(),
        getMostReviewedDishes(),
        getMostSavedDishes(),
      ]);

      setTrending(trendingData);
      setHighestRated(ratedData);
      setMostReviewed(reviewedData);
      setMostSaved(savedData);
    } catch (error) {
      console.log(
        "Trending page error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // OPEN DISH
  // ==========================================================

  const openDish = (dishId: number) => {
    router.push(
      `/restaurant?id=${dishId}`
    );
  };

  // ==========================================================
  // RANKING CARD
  // ==========================================================

  const RankingCard = ({
    dish,
    index,
  }: {
    dish: TrendingDish;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={styles.rankingCard}
        activeOpacity={0.85}
        onPress={() =>
          openDish(dish.id)
        }
      >
        {/* RANK */}

        <View
          style={[
            styles.rankBox,
            index === 0 &&
              styles.firstRank,
          ]}
        >
          <Text
            style={styles.rankNumber}
          >
            #{index + 1}
          </Text>
        </View>

        {/* DISH INFO */}

        <View
          style={styles.dishInfo}
        >
          <Text
            style={styles.dishName}
            numberOfLines={1}
          >
            {dish.name}
          </Text>

          <Text
            style={styles.restaurantName}
            numberOfLines={1}
          >
            {dish.restaurant_name}
          </Text>

          <View
            style={styles.metricsRow}
          >
            <Text
              style={styles.ratingText}
            >
              ★{" "}
              {dish.rating > 0
                ? dish.rating.toFixed(1)
                : "—"}
            </Text>

            <Text
              style={styles.metricText}
            >
              {dish.reviewCount}{" "}
              reviews
            </Text>

            <Text
              style={styles.metricText}
            >
              ♥{" "}
              {dish.favoriteCount}
            </Text>
          </View>
        </View>

        {/* ARROW */}

        <Text
          style={styles.arrow}
        >
          →
        </Text>
      </TouchableOpacity>
    );
  };

  // ==========================================================
  // HORIZONTAL CARD
  // ==========================================================

  const HorizontalCard = ({
    dish,
    index,
  }: {
    dish: TrendingDish;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        activeOpacity={0.85}
        onPress={() =>
          openDish(dish.id)
        }
      >
        <View
          style={styles.horizontalRank}
        >
          <Text
            style={styles.horizontalRankText}
          >
            #{index + 1}
          </Text>
        </View>

        <View
          style={styles.horizontalContent}
        >
          <Text
            style={styles.horizontalName}
            numberOfLines={1}
          >
            {dish.name}
          </Text>

          <Text
            style={styles.horizontalRestaurant}
            numberOfLines={1}
          >
            {dish.restaurant_name}
          </Text>

          <View
            style={styles.horizontalMetrics}
          >
            <Text
              style={styles.horizontalRating}
            >
              ★{" "}
              {dish.rating > 0
                ? dish.rating.toFixed(1)
                : "—"}
            </Text>

            <Text
              style={styles.horizontalReviews}
            >
              {dish.reviewCount} reviews
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
        />

        <Text
          style={styles.loadingText}
        >
          Calculating community rankings...
        </Text>
      </View>
    );
  }

  // ==========================================================
  // MAIN SCREEN
  // ==========================================================

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text
              style={styles.backText}
            >
              ‹
            </Text>
          </TouchableOpacity>

          <Text
            style={styles.headerTitle}
          >
            Community
          </Text>

          <View
            style={styles.headerSpacer}
          />
        </View>

        {/* ====================================================
            HERO
        ==================================================== */}

        <View
          style={styles.heroCard}
        >
          <View
            style={styles.heroIcon}
          >
            <Text
              style={styles.heroIconText}
            >
              ↗
            </Text>
          </View>

          <Text
            style={styles.heroTitle}
          >
            What's Trending
          </Text>

          <Text
            style={styles.heroSubtitle}
          >
            Discover what the FoodReview
            community is loving right now.
          </Text>
        </View>

        {/* ====================================================
            TRENDING NOW
        ==================================================== */}

        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Trending Now
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Based on recent community
                activity
              </Text>
            </View>

            <Text
              style={styles.sectionBadge}
            >
              LIVE
            </Text>
          </View>

          {trending.length === 0 ? (
            <View
              style={styles.emptyCard}
            >
              <Text
                style={styles.emptyTitle}
              >
                Not enough activity yet
              </Text>

              <Text
                style={styles.emptyText}
              >
                Start reviewing and saving
                dishes to create community
                trends.
              </Text>
            </View>
          ) : (
            trending
              .slice(0, 5)
              .map(
                (dish, index) => (
                  <RankingCard
                    key={dish.id}
                    dish={dish}
                    index={index}
                  />
                )
              )
          )}
        </View>

        {/* ====================================================
            HIGHEST RATED
        ==================================================== */}

        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Highest Rated
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Community favourites by
                rating
              </Text>
            </View>

            <Text
              style={styles.sectionIcon}
            >
              ★
            </Text>
          </View>

          {highestRated.length === 0 ? (
            <View
              style={styles.emptyCard}
            >
              <Text
                style={styles.emptyTitle}
              >
                No ratings yet
              </Text>

              <Text
                style={styles.emptyText}
              >
                Be one of the first people
                to rate a dish.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.horizontalList
              }
            >
              {highestRated
                .slice(0, 6)
                .map(
                  (dish, index) => (
                    <HorizontalCard
                      key={dish.id}
                      dish={dish}
                      index={index}
                    />
                  )
                )}
            </ScrollView>
          )}
        </View>

        {/* ====================================================
            MOST REVIEWED
        ==================================================== */}

        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Most Reviewed
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Dishes getting the most
                attention
              </Text>
            </View>

            <Text
              style={styles.sectionIcon}
            >
              ●
            </Text>
          </View>

          {mostReviewed.length === 0 ? (
            <View
              style={styles.emptyCard}
            >
              <Text
                style={styles.emptyTitle}
              >
                No reviews yet
              </Text>

              <Text
                style={styles.emptyText}
              >
                Reviews will appear here
                as the community grows.
              </Text>
            </View>
          ) : (
            mostReviewed
              .slice(0, 5)
              .map(
                (dish, index) => (
                  <RankingCard
                    key={dish.id}
                    dish={dish}
                    index={index}
                  />
                )
              )
          )}
        </View>

        {/* ====================================================
            MOST SAVED
        ==================================================== */}

        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Most Saved
              </Text>

              <Text
                style={styles.sectionSubtitle}
              >
                Dishes people want to try
                again
              </Text>
            </View>

            <Text
              style={styles.sectionIcon}
            >
              ♥
            </Text>
          </View>

          {mostSaved.length === 0 ? (
            <View
              style={styles.emptyCard}
            >
              <Text
                style={styles.emptyTitle}
              >
                No favorites yet
              </Text>

              <Text
                style={styles.emptyText}
              >
                Save your favourite dishes
                to build the community
                rankings.
              </Text>
            </View>
          ) : (
            mostSaved
              .slice(0, 5)
              .map(
                (dish, index) => (
                  <RankingCard
                    key={dish.id}
                    dish={dish}
                    index={index}
                  />
                )
              )
          )}
        </View>

        {/* ====================================================
            CALL TO ACTION
        ==================================================== */}

        <View
          style={styles.ctaCard}
        >
          <Text
            style={styles.ctaTitle}
          >
            Make your mark
          </Text>

          <Text
            style={styles.ctaText}
          >
            Review dishes, save your
            favourites, and help the
            community discover great food.
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={() =>
              router.push("/explore")
            }
          >
            <Text
              style={styles.ctaButtonText}
            >
              Explore Dishes
            </Text>

            <Text
              style={styles.ctaArrow}
            >
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <Text
          style={styles.footer}
        >
          FoodReview Community
        </Text>

        <Text
          style={styles.footerSmall}
        >
          Discover • Review • Rank
        </Text>
      </ScrollView>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingContainer: {
    flex: 1,
    backgroundColor: "#080808",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#777777",
    fontSize: 13,
    marginTop: 14,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    height: 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#151515",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#292929",
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 32,
    marginTop: -3,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  headerSpacer: {
    width: 42,
  },

  // ==========================================================
  // HERO
  // ==========================================================

  heroCard: {
    backgroundColor: "#111111",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#292929",
  },

  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#1D1D1D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#303030",
  },

  heroIconText: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  heroSubtitle: {
    color: "#777777",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 320,
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  section: {
    marginTop: 32,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent:
      "space-between",
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#707070",
    fontSize: 11,
    marginTop: 5,
  },

  sectionBadge: {
    color: "#FFFFFF",
    backgroundColor: "#1B1B1B",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  sectionIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  // ==========================================================
  // RANKING CARD
  // ==========================================================

  rankingCard: {
    backgroundColor: "#111111",
    borderRadius: 18,
    minHeight: 82,
    padding: 14,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#242424",
  },

  rankBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },

  firstRank: {
    backgroundColor: "#222222",
    borderColor: "#444444",
  },

  rankNumber: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  dishInfo: {
    flex: 1,
    marginLeft: 13,
  },

  dishName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  restaurantName: {
    color: "#707070",
    fontSize: 11,
    marginTop: 3,
  },

  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 12,
  },

  ratingText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  metricText: {
    color: "#666666",
    fontSize: 10,
  },

  arrow: {
    color: "#666666",
    fontSize: 20,
    marginLeft: 8,
  },

  // ==========================================================
  // HORIZONTAL CARDS
  // ==========================================================

  horizontalList: {
    paddingRight: 10,
  },

  horizontalCard: {
    width: 190,
    minHeight: 145,
    backgroundColor: "#111111",
    borderRadius: 19,
    padding: 15,
    marginRight: 11,
    borderWidth: 1,
    borderColor: "#242424",
  },

  horizontalRank: {
    width: 38,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#1D1D1D",
    justifyContent: "center",
    alignItems: "center",
  },

  horizontalRankText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  horizontalContent: {
    marginTop: 14,
  },

  horizontalName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  horizontalRestaurant: {
    color: "#707070",
    fontSize: 10,
    marginTop: 4,
  },

  horizontalMetrics: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  horizontalRating: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  horizontalReviews: {
    color: "#666666",
    fontSize: 10,
    marginLeft: 10,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyCard: {
    backgroundColor: "#111111",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#242424",
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  emptyText: {
    color: "#707070",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },

  // ==========================================================
  // CTA
  // ==========================================================

  ctaCard: {
    marginTop: 34,
    backgroundColor: "#111111",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "#292929",
  },

  ctaTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  ctaText: {
    color: "#777777",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  ctaButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    marginTop: 17,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  ctaButtonText: {
    color: "#080808",
    fontSize: 13,
    fontWeight: "900",
  },

  ctaArrow: {
    color: "#080808",
    fontSize: 17,
    fontWeight: "900",
    marginLeft: 9,
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    color: "#333333",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 38,
  },

  footerSmall: {
    color: "#292929",
    textAlign: "center",
    fontSize: 10,
    marginTop: 5,
  },
});