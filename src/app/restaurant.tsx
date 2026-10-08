import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { supabase } from "../lib/supabase";
import { backend } from "../lib/backend";

import {
  COLORS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
} from "../lib/theme";

import Rating from "../components/ui/Rating";

type Dish = {
  id: string | number;
  name?: string | null;
  restaurant_name?: string | null;
  category?: string | null;
  description?: string | null;
  image_url?: string | null;
};

type Review = {
  id: string | number;
  dish_id: string | number;
  user_id?: string | null;

  rating?: number | null;
  overall_rating?: number | null;

  spice_level?: number | null;
  salt_level?: number | null;
  sugar_level?: number | null;
  sweetness_level?: number | null;

  review_text?: string | null;
  what_was_best?: string | null;
  what_to_improve?: string | null;

  created_at?: string | null;
};

export default function RestaurantScreen() {
  const params =
    useLocalSearchParams<{
      id?: string | string[];
      dishId?: string | string[];
    }>();

  /*
   * Accept both id and dishId.
   */

  const rawDishId =
    params.id ?? params.dishId;

  const dishId = Number(
    Array.isArray(rawDishId)
      ? rawDishId[0]
      : rawDishId
  ) || 101;

  const [dish, setDish] =
    useState<Dish | null>(null);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [favorite, setFavorite] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  useEffect(() => {
    loadDishPage();
  }, [dishId]);

  async function loadDishPage() {
    try {
      setLoading(true);

      /*
       * Load dish safely via hybrid backend.
       */
      const dishData = await backend.fetchDishById(dishId);
      setDish(dishData as Dish);

      /*
       * Load community reviews.
       */
      const reviewData = await backend.fetchReviewsForDish(dishId);
      setReviews((reviewData as unknown as Review[]) || []);

      /*
       * Check favorite status.
       */
      setFavorite(backend.isFavorite(dishId));
    } catch (error) {
      console.log(
        "Restaurant page error:",
        error
      );
      setDish(backend.getDishById(dishId) as Dish);
      setReviews(backend.getReviews(dishId) as unknown as Review[]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * Calculate the overall community rating.
   */

  const ratingStats = useMemo(() => {
    const values = reviews
      .map((review) =>
        Number(
          review.overall_rating ??
            review.rating ??
            0
        )
      )
      .filter(
        (value) =>
          value > 0 &&
          value <= 5
      );

    if (values.length === 0) {
      return {
        average: 0,
        count: 0,
      };
    }

    const total = values.reduce(
      (sum, value) =>
        sum + value,
      0
    );

    return {
      average:
        total / values.length,
      count: values.length,
    };
  }, [reviews]);

  /*
   * Rating distribution.
   */

  const ratingDistribution =
    useMemo(() => {
      const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      reviews.forEach(
        (review) => {
          const value = Math.round(
            Number(
              review.overall_rating ??
                review.rating ??
                0
            )
          );

          if (
            value >= 1 &&
            value <= 5
          ) {
            distribution[
              value as keyof typeof distribution
            ]++;
          }
        }
      );

      return distribution;
    }, [reviews]);

  /*
   * Taste analytics.
   */

  const tasteStats = useMemo(() => {
    function average(
      values: number[]
    ) {
      if (
        values.length === 0
      ) {
        return 0;
      }

      return (
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / values.length
      );
    }

    const spiceValues =
      reviews
        .map((review) =>
          Number(
            review.spice_level ??
              0
          )
        )
        .filter(
          (value) =>
            value > 0
        );

    const saltValues =
      reviews
        .map((review) =>
          Number(
            review.salt_level ??
              0
          )
        )
        .filter(
          (value) =>
            value > 0
        );

    const sweetnessValues =
      reviews
        .map((review) =>
          Number(
            review.sugar_level ??
              review.sweetness_level ??
              0
          )
        )
        .filter(
          (value) =>
            value > 0
        );

    return {
      spice: average(
        spiceValues
      ),
      salt: average(
        saltValues
      ),
      sweetness: average(
        sweetnessValues
      ),
    };
  }, [reviews]);

  /*
   * Community verdict.
   */

  const communityVerdict =
    useMemo(() => {
      if (
        ratingStats.count === 0
      ) {
        return {
          title:
            "No community verdict yet",
          description:
            "Be the first person to review this dish.",
        };
      }

      if (
        ratingStats.average >=
        4.5
      ) {
        return {
          title:
            "Highly rated by the community",
          description:
            "This dish is receiving consistently strong ratings.",
        };
      }

      if (
        ratingStats.average >=
        4
      ) {
        return {
          title:
            "A popular community choice",
          description:
            "Most reviewers have had a positive experience.",
        };
      }

      if (
        ratingStats.average >=
        3
      ) {
        return {
          title:
            "A mixed community response",
          description:
            "Reviews suggest that experiences vary between diners.",
        };
      }

      return {
        title:
          "Mixed reviews from the community",
        description:
          "Check individual reviews before making your choice.",
      };
    }, [ratingStats]);

  /*
   * Best-for tags.
   */

  const bestFor =
    useMemo(() => {
      const tags: string[] =
        [];

      if (
        tasteStats.spice >=
        4
      ) {
        tags.push(
          "Spice lovers"
        );
      }

      if (
        tasteStats.spice > 0 &&
        tasteStats.spice <=
          2.5
      ) {
        tags.push(
          "Mild flavour"
        );
      }

      if (
        tasteStats.sweetness >=
        4
      ) {
        tags.push(
          "Sweet flavour"
        );
      }

      if (
        ratingStats.average >=
        4
      ) {
        tags.push(
          "Community favourite"
        );
      }

      if (
        tags.length === 0
      ) {
        tags.push(
          "Food explorers"
        );
      }

      return tags;
    }, [
      tasteStats,
      ratingStats,
    ]);

  /*
   * Things to know.
   */

  const thingsToKnow =
    useMemo(() => {
      const items: string[] =
        [];

      if (
        tasteStats.spice > 0
      ) {
        items.push(
          `Average spice level: ${tasteStats.spice.toFixed(
            1
          )}/5`
        );
      }

      if (
        tasteStats.salt > 0
      ) {
        items.push(
          `Average salt level: ${tasteStats.salt.toFixed(
            1
          )}/5`
        );
      }

      if (
        tasteStats.sweetness > 0
      ) {
        items.push(
          `Average sweetness: ${tasteStats.sweetness.toFixed(
            1
          )}/5`
        );
      }

      if (
        ratingStats.count > 0
      ) {
        items.push(
          `${ratingStats.count} community review${
            ratingStats.count ===
            1
              ? ""
              : "s"
          }`
        );
      }

      return items;
    }, [
      tasteStats,
      ratingStats,
    ]);

  /*
   * Add / remove favorite.
   */

  async function toggleFavorite() {
    if (
      favoriteLoading
    ) {
      return;
    }

    try {
      setFavoriteLoading(true);
      const isFav = backend.toggleFavorite(dishId);
      setFavorite(isFav);
    } catch (error) {
      console.log(
        "Favorite error:",
        error
      );
    } finally {
      setFavoriteLoading(false);
    }
  }

  /*
   * Open review page.
   */

  function openReview() {
    if (
      !Number.isFinite(dishId) ||
      dishId <= 0
    ) {
      Alert.alert(
        "Invalid dish",
        "This dish cannot be reviewed."
      );

      return;
    }

    router.push({
      pathname: "/review",
      params: {
        id: String(dishId),
        dishId: String(dishId),
        dishName:
          dish?.name || "Food",
      },
    });
  }

  /*
   * Open all reviews.
   */

  function openAllReviews() {
    router.push({
      pathname: "/reviews",
      params: {
        dishId: String(
          dishId
        ),
      },
    });
  }

  /*
   * Format date.
   */

  function formatDate(
    date?: string | null
  ) {
    if (!date) {
      return "";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "";
    }

    return parsed.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  /*
   * Loading screen.
   */

  if (loading) {
    return (
      <View
        style={
          styles.loadingScreen
        }
      >
        <ActivityIndicator
          size="large"
          color={COLORS.accent}
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading dish...
        </Text>
      </View>
    );
  }

  /*
   * Invalid dish.
   */

  if (!dish) {
    return (
      <View
        style={
          styles.loadingScreen
        }
      >
        <Text
          style={
            styles.errorTitle
          }
        >
          DISH NOT FOUND
        </Text>

        <Text
          style={
            styles.errorDescription
          }
        >
          The selected dish could not
          be loaded.
        </Text>

        <Pressable
          style={
            styles.backButtonLarge
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            GO BACK
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ================================= */}
        {/* HERO IMAGE                         */}
        {/* ================================= */}

        <View
          style={styles.heroImageContainer}
        >
          {dish.image_url ? (
            <Image
              source={{
                uri: dish.image_url,
              }}
              style={
                styles.heroImage
              }
              resizeMode="cover"
            />
          ) : (
            <View
              style={
                styles.heroPlaceholder
              }
            >
              <Text
                style={
                  styles.heroPlaceholderText
                }
              >
                FOOD
              </Text>
            </View>
          )}

          <View
            style={
              styles.heroOverlay
            }
          />

          <Pressable
            style={
              styles.floatingBack
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.floatingBackText
              }
            >
              ←
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.favoriteButton,
              favorite &&
                styles.favoriteButtonActive,
            ]}
            onPress={
              toggleFavorite
            }
            disabled={
              favoriteLoading
            }
          >
            <Text
              style={[
                styles.favoriteIcon,
                favorite &&
                  styles.favoriteIconActive,
              ]}
            >
              {favorite
                ? "♥"
                : "♡"}
            </Text>
          </Pressable>

          {dish.category ? (
            <View
              style={
                styles.heroCategory
              }
            >
              <Text
                style={
                  styles.heroCategoryText
                }
              >
                {dish.category.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ================================= */}
        {/* DISH INTRO                         */}
        {/* ================================= */}

        <View
          style={styles.intro}
        >
          <Text
            style={styles.restaurantName}
          >
            {dish.restaurant_name ||
              "Restaurant"}
          </Text>

          <Text
            style={styles.dishName}
          >
            {dish.name ||
              "Unnamed Dish"}
          </Text>

          {dish.description ? (
            <Text
              style={
                styles.description
              }
            >
              {dish.description}
            </Text>
          ) : null}

          <View
            style={
              styles.ratingSummary
            }
          >
            <View
              style={
                styles.ratingNumberBox
              }
            >
              <Text
                style={
                  styles.ratingNumber
                }
              >
                {ratingStats.average >
                0
                  ? ratingStats.average.toFixed(
                      1
                    )
                  : "—"}
              </Text>

              <Text
                style={
                  styles.ratingOutOf
                }
              >
                /5
              </Text>
            </View>

            <View
              style={
                styles.ratingDetails
              }
            >
              <Rating
                rating={
                  ratingStats.average
                }
                reviewCount={
                  ratingStats.count
                }
                size="medium"
              />

              <Text
                style={
                  styles.communityText
                }
              >
                Community rating
              </Text>
            </View>
          </View>

          <Pressable
            style={
              styles.reviewButton
            }
            onPress={openReview}
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
                styles.reviewButtonArrow
              }
            >
              →
            </Text>
          </Pressable>
        </View>

        {/* ================================= */}
        {/* COMMUNITY VERDICT                  */}
        {/* ================================= */}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionLabel
            }
          >
            COMMUNITY VERDICT
          </Text>

          <View
            style={
              styles.verdictCard
            }
          >
            <View
              style={
                styles.verdictIcon
              }
            >
              <Text
                style={
                  styles.verdictIconText
                }
              >
                ★
              </Text>
            </View>

            <View
              style={
                styles.verdictContent
              }
            >
              <Text
                style={
                  styles.verdictTitle
                }
              >
                {
                  communityVerdict.title
                }
              </Text>

              <Text
                style={
                  styles.verdictDescription
                }
              >
                {
                  communityVerdict.description
                }
              </Text>
            </View>
          </View>
        </View>

        {/* ================================= */}
        {/* RATING BREAKDOWN                   */}
        {/* ================================= */}

        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={
                  styles.sectionLabel
                }
              >
                RATING BREAKDOWN
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                How the community rated it
              </Text>
            </View>
          </View>

          <View
            style={
              styles.breakdownCard
            }
          >
            {[5, 4, 3, 2, 1].map(
              (rating) => {
                const count =
                  ratingDistribution[
                    rating as keyof typeof ratingDistribution
                  ];

                const percentage =
                  ratingStats.count >
                  0
                    ? count /
                      ratingStats.count
                    : 0;

                return (
                  <View
                    key={rating}
                    style={
                      styles.breakdownRow
                    }
                  >
                    <Text
                      style={
                        styles.breakdownNumber
                      }
                    >
                      {rating}
                    </Text>

                    <Text
                      style={
                        styles.breakdownStar
                      }
                    >
                      ★
                    </Text>

                    <View
                      style={
                        styles.progressBackground
                      }
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${
                              percentage *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={
                        styles.breakdownCount
                      }
                    >
                      {count}
                    </Text>
                  </View>
                );
              }
            )}
          </View>
        </View>

        {/* ================================= */}
        {/* TASTE PROFILE                      */}
        {/* ================================= */}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionLabel
            }
          >
            TASTE PROFILE
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Based on community feedback
          </Text>

          <View
            style={
              styles.tasteCard
            }
          >
            {[
              {
                name: "Spice",
                value:
                  tasteStats.spice,
              },
              {
                name: "Salt",
                value:
                  tasteStats.salt,
              },
              {
                name: "Sweetness",
                value:
                  tasteStats.sweetness,
              },
            ].map((item) => (
              <View
                key={item.name}
                style={
                  styles.tasteRow
                }
              >
                <View
                  style={
                    styles.tasteHeader
                  }
                >
                  <Text
                    style={
                      styles.tasteName
                    }
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.tasteValue
                    }
                  >
                    {item.value > 0
                      ? `${item.value.toFixed(
                          1
                        )}/5`
                      : "No data"}
                  </Text>
                </View>

                <View
                  style={
                    styles.tasteBarBackground
                  }
                >
                  <View
                    style={[
                      styles.tasteBarFill,
                      {
                        width: `${
                          (item.value /
                            5) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ================================= */}
        {/* BEST FOR                            */}
        {/* ================================= */}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionLabel
            }
          >
            BEST FOR
          </Text>

          <View
            style={
              styles.tagContainer
            }
          >
            {bestFor.map(
              (tag) => (
                <View
                  key={tag}
                  style={
                    styles.tag
                  }
                >
                  <Text
                    style={
                      styles.tagText
                    }
                  >
                    {tag}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* ================================= */}
        {/* THINGS TO KNOW                      */}
        {/* ================================= */}

        {thingsToKnow.length >
        0 ? (
          <View
            style={
              styles.section
            }
          >
            <Text
              style={
                styles.sectionLabel
              }
            >
              THINGS TO KNOW
            </Text>

            <View
              style={
                styles.infoCard
              }
            >
              {thingsToKnow.map(
                (
                  item,
                  index
                ) => (
                  <View
                    key={item}
                    style={[
                      styles.infoRow,
                      index >
                        0 &&
                        styles.infoRowBorder,
                    ]}
                  >
                    <Text
                      style={
                        styles.infoDot
                      }
                    >
                      •
                    </Text>

                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      {item}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        ) : null}

        {/* ================================= */}
        {/* COMMUNITY REVIEWS                   */}
        {/* ================================= */}

        <View
          style={
            styles.section
          }
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <View>
              <Text
                style={
                  styles.sectionLabel
                }
              >
                COMMUNITY REVIEWS
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                What other diners said
              </Text>
            </View>

            {reviews.length >
            3 ? (
              <Pressable
                onPress={
                  openAllReviews
                }
              >
                <Text
                  style={
                    styles.viewAll
                  }
                >
                  VIEW ALL
                </Text>
              </Pressable>
            ) : null}
          </View>

          {reviews.length ===
          0 ? (
            <View
              style={
                styles.emptyReviewCard
              }
            >
              <Text
                style={
                  styles.emptyReviewTitle
                }
              >
                NO REVIEWS YET
              </Text>

              <Text
                style={
                  styles.emptyReviewText
                }
              >
                Be the first person to
                share an experience with
                this dish.
              </Text>

              <Pressable
                style={
                  styles.emptyReviewButton
                }
                onPress={
                  openReview
                }
              >
                <Text
                  style={
                    styles.emptyReviewButtonText
                  }
                >
                  WRITE FIRST REVIEW
                </Text>
              </Pressable>
            </View>
          ) : (
            reviews
              .slice(0, 3)
              .map(
                (
                  review
                ) => {
                  const reviewRating =
                    Number(
                      review.overall_rating ??
                        review.rating ??
                        0
                    );

                  return (
                    <View
                      key={String(
                        review.id
                      )}
                      style={
                        styles.reviewCard
                      }
                    >
                      <View
                        style={
                          styles.reviewTop
                        }
                      >
                        <View
                          style={
                            styles.reviewerAvatar
                          }
                        >
                          <Text
                            style={
                              styles.reviewerAvatarText
                            }
                          >
                            C
                          </Text>
                        </View>

                        <View
                          style={
                            styles.reviewerInfo
                          }
                        >
                          <Text
                            style={
                              styles.reviewerName
                            }
                          >
                            Community Member
                          </Text>

                          {review.created_at ? (
                            <Text
                              style={
                                styles.reviewDate
                              }
                            >
                              {formatDate(
                                review.created_at
                              )}
                            </Text>
                          ) : null}
                        </View>

                        <View
                          style={
                            styles.reviewRating
                          }
                        >
                          <Text
                            style={
                              styles.reviewRatingStar
                            }
                          >
                            ★
                          </Text>

                          <Text
                            style={
                              styles.reviewRatingValue
                            }
                          >
                            {reviewRating.toFixed(
                              1
                            )}
                          </Text>
                        </View>
                      </View>

                      {review.review_text ? (
                        <Text
                          style={
                            styles.reviewText
                          }
                        >
                          {
                            review.review_text
                          }
                        </Text>
                      ) : null}

                      {review.what_was_best ? (
                        <View
                          style={
                            styles.reviewHighlight
                          }
                        >
                          <Text
                            style={
                              styles.highlightLabel
                            }
                          >
                            BEST
                          </Text>

                          <Text
                            style={
                              styles.highlightText
                            }
                          >
                            {
                              review.what_was_best
                            }
                          </Text>
                        </View>
                      ) : null}

                      {review.what_to_improve ? (
                        <View
                          style={
                            styles.reviewImprove
                          }
                        >
                          <Text
                            style={
                              styles.improveLabel
                            }
                          >
                            COULD IMPROVE
                          </Text>

                          <Text
                            style={
                              styles.improveText
                            }
                          >
                            {
                              review.what_to_improve
                            }
                          </Text>
                        </View>
                      ) : null}

                      <View
                        style={
                          styles.miniTasteRow
                        }
                      >
                        {review.spice_level ? (
                          <View
                            style={
                              styles.miniTaste
                            }
                          >
                            <Text
                              style={
                                styles.miniTasteLabel
                              }
                            >
                              SPICE
                            </Text>

                            <Text
                              style={
                                styles.miniTasteValue
                              }
                            >
                              {
                                review.spice_level
                              }
                              /5
                            </Text>
                          </View>
                        ) : null}

                        {review.salt_level ? (
                          <View
                            style={
                              styles.miniTaste
                            }
                          >
                            <Text
                              style={
                                styles.miniTasteLabel
                              }
                            >
                              SALT
                            </Text>

                            <Text
                              style={
                                styles.miniTasteValue
                              }
                            >
                              {
                                review.salt_level
                              }
                              /5
                            </Text>
                          </View>
                        ) : null}

                        {(review.sugar_level ??
                          review.sweetness_level) ? (
                          <View
                            style={
                              styles.miniTaste
                            }
                          >
                            <Text
                              style={
                                styles.miniTasteLabel
                              }
                            >
                              SWEET
                            </Text>

                            <Text
                              style={
                                styles.miniTasteValue
                              }
                            >
                              {Number(
                                review.sugar_level ??
                                  review.sweetness_level
                              )}
                              /5
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                }
              )
          )}
        </View>

        {/* ================================= */}
        {/* BOTTOM CTA                          */}
        {/* ================================= */}

        <View
          style={
            styles.bottomCTA
          }
        >
          <Text
            style={
              styles.bottomCTALabel
            }
          >
            HAD THIS DISH?
          </Text>

          <Text
            style={
              styles.bottomCTATitle
            }
          >
            Share your experience.
          </Text>

          <Text
            style={
              styles.bottomCTADescription
            }
          >
            Your review helps the
            community make better food
            decisions.
          </Text>

          <Pressable
            style={
              styles.bottomCTAButton
            }
            onPress={openReview}
          >
            <Text
              style={
                styles.bottomCTAButtonText
              }
            >
              WRITE A REVIEW
            </Text>

            <Text
              style={
                styles.bottomCTAArrow
              }
            >
              →
            </Text>
          </Pressable>
        </View>

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  content: {
    paddingBottom: 30,
  },

  /* ============================= */
  /* LOADING                        */
  /* ============================= */

  loadingScreen: {
    flex: 1,
    backgroundColor:
      COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 12,
  },

  errorTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
  },

  errorDescription: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },

  backButtonLarge: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.accent,
  },

  backButtonText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  /* ============================= */
  /* HERO                           */
  /* ============================= */

  heroImageContainer: {
    width: "100%",
    height: 360,
    position: "relative",
    backgroundColor:
      COLORS.surface,
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  heroPlaceholder: {
    flex: 1,
    backgroundColor:
      COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },

  heroPlaceholderText: {
    color: COLORS.textDim,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 3,
  },

  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
    backgroundColor:
      "rgba(0,0,0,0.35)",
  },

  floatingBack: {
    position: "absolute",
    top: 52,
    left: SPACING.lg,
    width: 44,
    height: 44,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      "rgba(9,9,11,0.82)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  floatingBackText: {
    color: COLORS.white,
    fontSize: 22,
  },

  favoriteButton: {
    position: "absolute",
    top: 52,
    right: SPACING.lg,
    width: 44,
    height: 44,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      "rgba(9,9,11,0.82)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  favoriteButtonActive: {
    backgroundColor:
      COLORS.accentSoft,
    borderColor:
      COLORS.accent,
  },

  favoriteIcon: {
    color: COLORS.white,
    fontSize: 24,
  },

  favoriteIconActive: {
    color: COLORS.accent,
  },

  heroCategory: {
    position: "absolute",
    left: SPACING.lg,
    bottom: SPACING.lg,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      "rgba(9,9,11,0.88)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.12)",
  },

  heroCategoryText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  /* ============================= */
  /* INTRO                          */
  /* ============================= */

  intro: {
    paddingHorizontal:
      SPACING.xxl,
    paddingTop: SPACING.xxl,
  },

  restaurantName: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  dishName: {
    color: COLORS.white,
    fontSize: 31,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginTop: 5,
  },

  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 11,
  },

  ratingSummary: {
    marginTop: SPACING.xxl,
    padding: SPACING.lg,
    borderRadius:
      RADIUS.xl,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  ratingNumberBox: {
    flexDirection: "row",
    alignItems: "baseline",
    marginRight: 18,
  },

  ratingNumber: {
    color: COLORS.white,
    fontSize: 35,
    fontWeight: "800",
    letterSpacing: -1,
  },

  ratingOutOf: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginLeft: 2,
  },

  ratingDetails: {
    flex: 1,
  },

  communityText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },

  reviewButton: {
    height: 54,
    marginTop: SPACING.md,
    backgroundColor:
      COLORS.accent,
    borderRadius:
      RADIUS.lg,
    paddingHorizontal:
      SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  reviewButtonText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  reviewButtonArrow: {
    color: COLORS.background,
    fontSize: 22,
    fontWeight: "800",
  },

  /* ============================= */
  /* SECTIONS                       */
  /* ============================= */

  section: {
    marginTop: SPACING.xxxl,
    paddingHorizontal:
      SPACING.lg,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent:
      "space-between",
    marginBottom: SPACING.md,
  },

  sectionLabel: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },

  viewAll: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  /* ============================= */
  /* VERDICT                        */
  /* ============================= */

  verdictCard: {
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius:
      RADIUS.xl,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: "row",
  },

  verdictIcon: {
    width: 42,
    height: 42,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  verdictIconText: {
    color: COLORS.accent,
    fontSize: 20,
  },

  verdictContent: {
    flex: 1,
    marginLeft: 13,
  },

  verdictTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },

  verdictDescription: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  /* ============================= */
  /* BREAKDOWN                      */
  /* ============================= */

  breakdownCard: {
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius:
      RADIUS.xl,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 30,
  },

  breakdownNumber: {
    width: 13,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },

  breakdownStar: {
    color: COLORS.accent,
    fontSize: 12,
    marginRight: 8,
  },

  progressBackground: {
    flex: 1,
    height: 6,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.backgroundSoft,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor:
      COLORS.accent,
    borderRadius:
      RADIUS.round,
  },

  breakdownCount: {
    width: 25,
    marginLeft: 8,
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: "right",
  },

  /* ============================= */
  /* TASTE                          */
  /* ============================= */

  tasteCard: {
    marginTop: SPACING.md,
    padding: SPACING.lg,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius:
      RADIUS.xl,
  },

  tasteRow: {
    marginBottom: SPACING.lg,
  },

  tasteRowLast: {
    marginBottom: 0,
  },

  tasteHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  tasteName: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },

  tasteValue: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "800",
  },

  tasteBarBackground: {
    height: 7,
    backgroundColor:
      COLORS.backgroundSoft,
    borderRadius:
      RADIUS.round,
    overflow: "hidden",
  },

  tasteBarFill: {
    height: "100%",
    backgroundColor:
      COLORS.accent,
    borderRadius:
      RADIUS.round,
  },

  /* ============================= */
  /* TAGS                           */
  /* ============================= */

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: SPACING.md,
  },

  tag: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  tagText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },

  /* ============================= */
  /* INFO                           */
  /* ============================= */

  infoCard: {
    marginTop: SPACING.md,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius:
      RADIUS.xl,
    overflow: "hidden",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal:
      SPACING.lg,
    paddingVertical: 14,
  },

  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
  },

  infoDot: {
    color: COLORS.accent,
    fontSize: 16,
    marginRight: 10,
  },

  infoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 12,
  },

  /* ============================= */
  /* REVIEWS                        */
  /* ============================= */

  reviewCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    backgroundColor:
      COLORS.surface,
    borderRadius:
      RADIUS.xl,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  reviewTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  reviewerAvatar: {
    width: 38,
    height: 38,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },

  reviewerAvatarText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },

  reviewerInfo: {
    flex: 1,
    marginLeft: 10,
  },

  reviewerName: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },

  reviewDate: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 3,
  },

  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.accentSoft,
  },

  reviewRatingStar: {
    color: COLORS.accent,
    fontSize: 12,
  },

  reviewRatingValue: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
  },

  reviewText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 15,
  },

  reviewHighlight: {
    marginTop: 13,
    padding: 11,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.backgroundSoft,
  },

  highlightLabel: {
    color: COLORS.accent,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  highlightText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  reviewImprove: {
    marginTop: 8,
    padding: 11,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.backgroundSoft,
  },

  improveLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  improveText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  miniTasteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 13,
  },

  miniTaste: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },

  miniTasteLabel: {
    color: COLORS.textDim,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  miniTasteValue: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 5,
  },

  emptyReviewCard: {
    marginTop: SPACING.md,
    padding: 24,
    borderRadius:
      RADIUS.xl,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: "center",
  },

  emptyReviewTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },

  emptyReviewText: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 6,
  },

  emptyReviewButton: {
    marginTop: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.accent,
  },

  emptyReviewButtonText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  /* ============================= */
  /* BOTTOM CTA                     */
  /* ============================= */

  bottomCTA: {
    marginHorizontal:
      SPACING.lg,
    marginTop: SPACING.xxxl,
    padding: SPACING.xxl,
    borderRadius:
      RADIUS.xxl,
    backgroundColor:
      COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor:
      COLORS.borderLight,
  },

  bottomCTALabel: {
    color: COLORS.accent,
    ...TYPOGRAPHY.caption,
  },

  bottomCTATitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "800",
    marginTop: 8,
  },

  bottomCTADescription: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  bottomCTAButton: {
    height: 50,
    marginTop: 18,
    paddingHorizontal: 15,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  bottomCTAButtonText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  bottomCTAArrow: {
    color: COLORS.background,
    fontSize: 21,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 30,
  },
});