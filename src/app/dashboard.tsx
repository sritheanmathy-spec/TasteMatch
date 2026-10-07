import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { supabase } from "../lib/supabase";

import {
  COLORS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
} from "../lib/theme";

import Rating from "../components/ui/Rating";
import BottomNav from "../components/ui/BottomNav";
import { MOCK_DISHES, FRIEND_VISITS } from "../lib/mockData";

type Dish = {
  id: string | number;
  name?: string | null;
  restaurant_name?: string | null;
  category?: string | null;
  description?: string | null;
  image_url?: string | null;
};

type Review = {
  dish_id: string | number;
  rating?: number | null;
  overall_rating?: number | null;
};

type DishWithRating = Dish & {
  averageRating: number;
  reviewCount: number;
};

const categories = [
  "All",
  "Indian",
  "South Indian",
  "Chinese",
  "Italian",
  "Fast Food",
  "Dessert",
  "Beverage",
  "Japanese",
  "Middle Eastern",
  "Breakfast",
];

export default function Dashboard() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [dishesResult, reviewsResult] =
        await Promise.all([
          supabase
            .from("dishes")
            .select("*")
            .order("id", { ascending: true }),

          supabase
            .from("reviews")
            .select("dish_id, rating, overall_rating"),
        ]);

      if (dishesResult.error || !dishesResult.data || dishesResult.data.length === 0) {
        console.log(
          "Using rich fallback dishes database for stall presentation"
        );
        setDishes(MOCK_DISHES as any);
      } else {
        setDishes(
          (dishesResult.data as Dish[]) || []
        );
      }

      if (reviewsResult.error) {
        console.log(
          "Reviews error:",
          reviewsResult.error.message
        );

        setReviews([]);
      } else {
        setReviews(
          (reviewsResult.data as Review[]) || []
        );
      }
    } catch (error) {
      console.log("Unexpected error:", error);

      setDishes([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  async function refreshData() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function getDishRating(
    dishId: string | number
  ) {
    const dishReviews = reviews.filter(
      (review) =>
        String(review.dish_id) ===
        String(dishId)
    );

    if (dishReviews.length === 0) {
      return {
        averageRating: 0,
        reviewCount: 0,
      };
    }

    const ratings = dishReviews
      .map((review) =>
        Number(
          review.overall_rating ??
            review.rating ??
            0
        )
      )
      .filter((rating) => rating > 0);

    if (ratings.length === 0) {
      return {
        averageRating: 0,
        reviewCount: dishReviews.length,
      };
    }

    const total = ratings.reduce(
      (sum, rating) => sum + rating,
      0
    );

    return {
      averageRating:
        total / ratings.length,
      reviewCount: dishReviews.length,
    };
  }

  const dishesWithRatings =
    useMemo<DishWithRating[]>(() => {
      return dishes.map((dish) => {
        const result =
          getDishRating(dish.id);

        return {
          ...dish,
          averageRating:
            result.averageRating,
          reviewCount:
            result.reviewCount,
        };
      });
    }, [dishes, reviews]);

  const filteredDishes = useMemo(() => {
    return dishesWithRatings.filter(
      (dish) => {
        const query =
          search.trim().toLowerCase();

        const matchesSearch =
          query.length === 0 ||
          (dish.name || "")
            .toLowerCase()
            .includes(query) ||
          (dish.restaurant_name || "")
            .toLowerCase()
            .includes(query) ||
          (dish.category || "")
            .toLowerCase()
            .includes(query) ||
          (dish.description || "")
            .toLowerCase()
            .includes(query);

        const matchesCategory =
          selectedCategory === "All" ||
          (dish.category || "")
            .toLowerCase()
            .includes(
              selectedCategory.toLowerCase()
            );

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    dishesWithRatings,
    search,
    selectedCategory,
  ]);

  const topRatedDishes = useMemo(() => {
    return [...dishesWithRatings]
      .filter(
        (dish) =>
          dish.reviewCount > 0
      )
      .sort((a, b) => {
        if (
          b.averageRating !==
          a.averageRating
        ) {
          return (
            b.averageRating -
            a.averageRating
          );
        }

        return (
          b.reviewCount -
          a.reviewCount
        );
      })
      .slice(0, 5);
  }, [dishesWithRatings]);

  function openDish(dish: Dish) {
    router.push({
      pathname: "/restaurant",
      params: {
        id: String(dish.id),
      },
    });
  }

  /*
   * IMPORTANT:
   * review.tsx expects the dish ID
   * through the "id" parameter.
   */
  function openReview(dish: Dish) {
    if (!dish.id) {
      console.log(
        "Cannot open review: dish ID missing"
      );
      return;
    }

    router.push({
      pathname: "/review",
      params: {
        id: String(dish.id),
      },
    });
  }

  function openExplore() {
    router.push("/explore");
  }

  function openProfile() {
    router.push("/profile");
  }

  function openTrending() {
    router.push("/trending");
  }

  function renderTopCard(
    dish: DishWithRating,
    index: number
  ) {
    return (
      <Pressable
        key={String(dish.id)}
        style={styles.topCard}
        onPress={() => openDish(dish)}
      >
        <View
          style={
            styles.topImageContainer
          }
        >
          {dish.image_url ? (
            <Image
              source={{
                uri: dish.image_url,
              }}
              style={styles.topImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={
                styles.imagePlaceholder
              }
            >
              <Text
                style={
                  styles.placeholderText
                }
              >
                FOOD
              </Text>
            </View>
          )}

          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>
              #{index + 1}
            </Text>
          </View>
        </View>

        <View style={styles.topContent}>
          <Text
            style={styles.topCategory}
            numberOfLines={1}
          >
            {(dish.category ||
              "FOOD").toUpperCase()}
          </Text>

          <Text
            style={styles.topName}
            numberOfLines={1}
          >
            {dish.name ||
              "Unnamed Dish"}
          </Text>

          <Text
            style={styles.topRestaurant}
            numberOfLines={1}
          >
            {dish.restaurant_name ||
              "Restaurant"}
          </Text>

          <View style={styles.topRating}>
            <Rating
              rating={
                dish.averageRating
              }
              reviewCount={
                dish.reviewCount
              }
              size="small"
            />
          </View>
        </View>
      </Pressable>
    );
  }

  function renderDish(
    dish: DishWithRating
  ) {
    return (
      <View
        key={String(dish.id)}
        style={styles.dishCard}
      >
        <Pressable
          style={styles.dishMain}
          onPress={() => openDish(dish)}
        >
          <View
            style={
              styles.dishImageContainer
            }
          >
            {dish.image_url ? (
              <Image
                source={{
                  uri: dish.image_url,
                }}
                style={styles.dishImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={
                  styles.dishPlaceholder
                }
              >
                <Text
                  style={
                    styles.placeholderText
                  }
                >
                  FOOD
                </Text>
              </View>
            )}

            {dish.category ? (
              <View
                style={
                  styles.dishCategory
                }
              >
                <Text
                  style={
                    styles.dishCategoryText
                  }
                >
                  {dish.category}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.dishInfo}>
            <Text
              style={styles.dishName}
              numberOfLines={2}
            >
              {dish.name ||
                "Unnamed Dish"}
            </Text>

            <Text
              style={
                styles.dishRestaurant
              }
              numberOfLines={1}
            >
              {dish.restaurant_name ||
                "Restaurant"}
            </Text>

            {dish.description ? (
              <Text
                style={
                  styles.dishDescription
                }
                numberOfLines={2}
              >
                {dish.description}
              </Text>
            ) : null}

            <View
              style={
                styles.dishRatingRow
              }
            >
              <Rating
                rating={
                  dish.averageRating
                }
                reviewCount={
                  dish.reviewCount
                }
                size="small"
              />
            </View>
          </View>
        </Pressable>

        <Pressable
          style={styles.reviewButton}
          onPress={() =>
            openReview(dish)
          }
          android_ripple={{
            color: COLORS.accentSoft,
          }}
        >
          <Text
            style={
              styles.reviewButtonText
            }
          >
            WRITE A REVIEW
          </Text>

          <Text
            style={
              styles.reviewArrow
            }
          >
            →
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            tintColor={COLORS.accent}
          />
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              FOOD REVIEW
            </Text>

            <Text style={styles.brand}>
              DISCOVER
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={openProfile}
          >
            <Text
              style={
                styles.profileLetter
              }
            >
              P
            </Text>
          </Pressable>
        </View>

        {/* STALL GAME BANNER */}
        <Pressable
          style={styles.stallBanner}
          onPress={() => router.push("/games" as any)}
        >
          <View style={styles.stallBannerLeft}>
            <Text style={styles.stallBannerBadge}>🎮 STALL ATTRACTION ZONE</Text>
            <Text style={styles.stallBannerTitle}>Mindset & Food Games</Text>
            <Text style={styles.stallBannerSubtitle}>Scanner • Spin Wheel • Food Clash</Text>
          </View>
          <View style={styles.stallBannerButton}>
            <Text style={styles.stallBannerButtonText}>PLAY →</Text>
          </View>
        </Pressable>

        {/* FRIEND BUZZ: Visited & Found Interesting */}
        <View style={styles.friendBuzzSection}>
          <View style={styles.friendBuzzHeader}>
            <View>
              <Text style={styles.friendBuzzBadge}>👥 FRIEND ACTIVITY</Text>
              <Text style={styles.friendBuzzTitle}>Visited & Found Interesting</Text>
            </View>
            <Text style={styles.liveIndicator}>🟢 LIVE</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendList}
          >
            {FRIEND_VISITS.map((visit) => (
              <Pressable
                key={visit.id}
                style={styles.friendCard}
                onPress={() =>
                  router.push({
                    pathname: "/restaurant",
                    params: { id: String(visit.dishId) },
                  })
                }
              >
                <View style={styles.friendCardTop}>
                  <Text style={styles.friendAvatar}>{visit.avatar}</Text>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.friendName}>{visit.friendName}</Text>
                    <Text style={styles.friendGrade}>{visit.schoolGrade} • {visit.timeAgo}</Text>
                  </View>
                  <View style={styles.friendRatingBadge}>
                    <Text style={styles.friendRatingText}>⭐ {visit.rating}</Text>
                  </View>
                </View>

                <View style={styles.reactionBadge}>
                  <Text style={styles.reactionText}>{visit.reaction}</Text>
                </View>

                <Text style={styles.friendComment} numberOfLines={2}>
                  "{visit.comment}"
                </Text>

                <View style={styles.friendDishRow}>
                  <Image source={{ uri: visit.imageUrl }} style={styles.friendDishThumb} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.friendDishName} numberOfLines={1}>
                      {visit.dishName}
                    </Text>
                    <Text style={styles.friendRestaurantName} numberOfLines={1}>
                      📍 {visit.restaurantName}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* HERO */}

        <View style={styles.hero}>
          <Text
            style={styles.heroLabel}
          >
            FOOD INTELLIGENCE
          </Text>

          <Text
            style={styles.heroTitle}
          >
            Find food{"\n"}
            worth remembering.
          </Text>

          <Text
            style={
              styles.heroDescription
            }
          >
            Discover highly rated
            dishes, explore restaurants
            and share your food
            experience.
          </Text>

          <Pressable
            style={styles.heroButton}
            onPress={openExplore}
          >
            <Text
              style={
                styles.heroButtonText
              }
            >
              EXPLORE FOOD
            </Text>

            <Text
              style={
                styles.heroButtonArrow
              }
            >
              →
            </Text>
          </Pressable>
        </View>

        {/* STATISTICS */}

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text
              style={styles.statNumber}
            >
              {dishes.length}
            </Text>

            <Text
              style={styles.statLabel}
            >
              DISHES
            </Text>
          </View>

          <View style={styles.stat}>
            <Text
              style={styles.statNumber}
            >
              {reviews.length}
            </Text>

            <Text
              style={styles.statLabel}
            >
              REVIEWS
            </Text>
          </View>

          <View style={styles.stat}>
            <Text
              style={styles.statNumber}
            >
              {categories.length - 1}
            </Text>

            <Text
              style={styles.statLabel}
            >
              CATEGORIES
            </Text>
          </View>
        </View>

        {/* SEARCH */}

        <View
          style={
            styles.searchContainer
          }
        >
          <Text
            style={styles.searchIcon}
          >
            ⌕
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search dishes or restaurants"
            placeholderTextColor={
              COLORS.textDim
            }
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {search.length > 0 ? (
            <Pressable
              onPress={() =>
                setSearch("")
              }
            >
              <Text
                style={styles.clearText}
              >
                ×
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* CATEGORIES */}

        <View style={styles.section}>
          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                BROWSE
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Explore by category
              </Text>
            </View>

            <Pressable
              onPress={openExplore}
            >
              <Text
                style={styles.seeAll}
              >
                VIEW ALL
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.categoryList
            }
          >
            {categories.map(
              (category) => {
                const active =
                  category ===
                  selectedCategory;

                return (
                  <Pressable
                    key={category}
                    onPress={() =>
                      setSelectedCategory(
                        category
                      )
                    }
                    style={[
                      styles.categoryChip,
                      active &&
                        styles.categoryChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        active &&
                          styles.categoryTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </ScrollView>
        </View>

        {/* TOP RATED */}

        <View style={styles.section}>
          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                TOP RATED
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Highest rated by the community
              </Text>
            </View>

            <Pressable
              onPress={openTrending}
            >
              <Text
                style={styles.seeAll}
              >
                TRENDING
              </Text>
            </Pressable>
          </View>

          {loading ? (
            <View
              style={
                styles.loadingSmall
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  COLORS.accent
                }
              />
            </View>
          ) : topRatedDishes.length ===
            0 ? (
            <View
              style={
                styles.noRatingBox
              }
            >
              <Text
                style={
                  styles.noRatingText
                }
              >
                Be the first to rate
                a dish.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.topList
              }
            >
              {topRatedDishes.map(
                renderTopCard
              )}
            </ScrollView>
          )}
        </View>

        {/* ALL DISHES */}

        <View style={styles.allHeader}>
          <View>
            <Text
              style={
                styles.allTitle
              }
            >
              ALL DISHES
            </Text>

            <Text
              style={
                styles.allSubtitle
              }
            >
              {selectedCategory ===
              "All"
                ? "Everything on the menu"
                : `Showing ${selectedCategory}`}
            </Text>
          </View>

          <Text
            style={styles.allCount}
          >
            {filteredDishes.length}
          </Text>
        </View>

        {/* SEARCH RESULT */}

        {search.length > 0 ? (
          <Text
            style={styles.searchResult}
          >
            {filteredDishes.length} result
            {filteredDishes.length !==
            1
              ? "s"
              : ""}{" "}
            found
          </Text>
        ) : null}

        {/* DISHES */}

        <View style={styles.dishList}>
          {loading ? (
            <View
              style={
                styles.loadingContainer
              }
            >
              <ActivityIndicator
                size="large"
                color={
                  COLORS.accent
                }
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Loading dishes...
              </Text>
            </View>
          ) : filteredDishes.length ===
            0 ? (
            <View
              style={
                styles.emptyContainer
              }
            >
              <Text
                style={styles.emptyTitle}
              >
                NO DISHES FOUND
              </Text>

              <Text
                style={
                  styles.emptyDescription
                }
              >
                Try another search or
                category.
              </Text>

              <Pressable
                style={
                  styles.clearButton
                }
                onPress={() => {
                  setSearch("");
                  setSelectedCategory(
                    "All"
                  );
                }}
              >
                <Text
                  style={
                    styles.clearButtonText
                  }
                >
                  CLEAR FILTERS
                </Text>
              </Pressable>
            </View>
          ) : (
            filteredDishes.map(
              renderDish
            )
          )}
        </View>

        {/* FOOTER */}

        <View style={styles.footer}>
          <Text
            style={styles.footerBrand}
          >
            FOOD REVIEW
          </Text>

          <Text
            style={styles.footerText}
          >
            Better food decisions
            start here.
          </Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FLOATING BOTTOM NAV */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  stallBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(245, 185, 66, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(245, 185, 66, 0.4)",
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginHorizontal: SPACING.xxl,
    marginBottom: SPACING.xl,
  },

  stallBannerLeft: {
    flex: 1,
    paddingRight: SPACING.sm,
  },

  stallBannerBadge: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 4,
  },

  stallBannerTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 2,
  },

  stallBannerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },

  stallBannerButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },

  stallBannerButtonText: {
    color: "#18181B",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  friendBuzzSection: {
    marginBottom: SPACING.xxl,
  },

  friendBuzzHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
    marginBottom: SPACING.md,
  },

  friendBuzzBadge: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 2,
  },

  friendBuzzTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
  },

  liveIndicator: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "800",
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
  },

  friendList: {
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.md,
  },

  friendCard: {
    width: 280,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
  },

  friendCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },

  friendAvatar: {
    fontSize: 28,
  },

  friendName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },

  friendGrade: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },

  friendRatingBadge: {
    backgroundColor: "rgba(245, 185, 66, 0.15)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },

  friendRatingText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "800",
  },

  reactionBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.sm,
  },

  reactionText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "800",
  },

  friendComment: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: "italic",
    marginBottom: SPACING.md,
  },

  friendDishRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  friendDishThumb: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
  },

  friendDishName: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },

  friendRestaurantName: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },

  header: {
    paddingTop: 55,
    paddingHorizontal:
      SPACING.xxl,
    paddingBottom:
      SPACING.xl,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  eyebrow: {
    color: COLORS.textMuted,
    ...TYPOGRAPHY.caption,
  },

  brand: {
    color: COLORS.white,
    fontSize: 31,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 3,
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor:
      COLORS.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },

  profileLetter: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },

  hero: {
    marginHorizontal:
      SPACING.lg,
    padding:
      SPACING.xxl,
    borderRadius:
      RADIUS.xxl,
    backgroundColor:
      COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor:
      COLORS.borderLight,
  },

  heroLabel: {
    color: COLORS.accent,
    ...TYPOGRAPHY.caption,
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 34,
    lineHeight: 37,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 18,
  },

  heroDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 15,
  },

  heroButton: {
    height: 50,
    marginTop: 21,
    paddingHorizontal: 17,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  heroButtonText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  heroButtonArrow: {
    color: COLORS.background,
    fontSize: 22,
    fontWeight: "800",
  },

  stats: {
    flexDirection: "row",
    marginHorizontal:
      SPACING.lg,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },

  stat: {
    flex: 1,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius:
      RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  statNumber: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
  },

  statLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 4,
  },

  searchContainer: {
    height: 53,
    marginHorizontal:
      SPACING.lg,
    marginTop:
      SPACING.xxl,
    paddingHorizontal:
      SPACING.md,
    borderRadius:
      RADIUS.lg,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  searchIcon: {
    color: COLORS.textSecondary,
    fontSize: 23,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
  },

  clearText: {
    color: COLORS.textSecondary,
    fontSize: 25,
  },

  section: {
    marginTop:
      SPACING.xxxl,
  },

  sectionHeader: {
    paddingHorizontal:
      SPACING.xxl,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom:
      SPACING.md,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },

  seeAll: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  categoryList: {
    paddingHorizontal:
      SPACING.xxl,
  },

  categoryChip: {
    paddingHorizontal: 16,
    height: 38,
    marginRight: 8,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryChipActive: {
    backgroundColor:
      COLORS.accent,
    borderColor:
      COLORS.accent,
  },

  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },

  categoryTextActive: {
    color: COLORS.background,
  },

  topList: {
    paddingHorizontal:
      SPACING.lg,
  },

  topCard: {
    width: 220,
    marginRight:
      SPACING.md,
    backgroundColor:
      COLORS.surface,
    borderRadius:
      RADIUS.xl,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    overflow: "hidden",
  },

  topImageContainer: {
    height: 145,
    position: "relative",
    backgroundColor:
      COLORS.surfaceLight,
  },

  topImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    backgroundColor:
      COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },

  rankBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.accent,
  },

  rankText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: "900",
  },

  topContent: {
    padding: 15,
  },

  topCategory: {
    color: COLORS.accent,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.3,
  },

  topName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 5,
  },

  topRestaurant: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },

  topRating: {
    marginTop: 12,
  },

  loadingSmall: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },

  noRatingBox: {
    marginHorizontal:
      SPACING.lg,
    padding: 20,
    backgroundColor:
      COLORS.surface,
    borderRadius:
      RADIUS.lg,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  noRatingText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },

  allHeader: {
    marginTop:
      SPACING.xxxl,
    paddingHorizontal:
      SPACING.xxl,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  allTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },

  allSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },

  allCount: {
    color: COLORS.accent,
    fontSize: 25,
    fontWeight: "800",
  },

  searchResult: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 10,
    paddingHorizontal:
      SPACING.xxl,
  },

  dishList: {
    marginTop: 15,
    paddingHorizontal:
      SPACING.lg,
  },

  dishCard: {
    backgroundColor:
      COLORS.surface,
    borderRadius:
      RADIUS.xl,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    marginBottom:
      SPACING.md,
    overflow: "hidden",
  },

  dishMain: {
    flexDirection: "row",
  },

  dishImageContainer: {
    width: 125,
    height: 155,
    backgroundColor:
      COLORS.surfaceLight,
    position: "relative",
  },

  dishImage: {
    width: "100%",
    height: "100%",
  },

  dishPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      COLORS.surfaceLight,
  },

  dishCategory: {
    position: "absolute",
    left: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      "rgba(9,9,11,0.85)",
  },

  dishCategoryText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  dishInfo: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },

  dishName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
  },

  dishRestaurant: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  dishDescription: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  dishRatingRow: {
    marginTop: 10,
  },

  reviewButton: {
    height: 42,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor:
      COLORS.borderLight,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  reviewButtonText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  reviewArrow: {
    color: COLORS.accent,
    fontSize: 19,
    fontWeight: "700",
  },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },

  loadingText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 10,
  },

  emptyContainer: {
    padding: 35,
    backgroundColor:
      COLORS.surface,
    borderRadius:
      RADIUS.xl,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: "center",
  },

  emptyTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
  },

  emptyDescription: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 7,
  },

  clearButton: {
    marginTop: 17,
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.accent,
  },

  clearButtonText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  footer: {
    paddingTop: 45,
    paddingBottom: 25,
    alignItems: "center",
  },

  footerBrand: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
  },

  footerText: {
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 6,
  },
});