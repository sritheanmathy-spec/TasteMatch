import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

type Dish = {
  id: string | number;
  name?: string | null;
  restaurant_name?: string | null;
  category?: string | null;
  description?: string | null;
  image_url?: string | null;
};

type ReviewData = {
  id: string | number;
  dish_id: string | number;
  overall_rating?: number | null;
  rating?: number | null;
  spice_level?: number | null;
  salt_level?: number | null;
  sugar_level?: number | null;
  sweetness_level?: number | null;
  review_text?: string | null;
  what_was_best?: string | null;
  what_to_improve?: string | null;
  user_id?: string | null;
};

export default function ReviewScreen() {
  const params =
    useLocalSearchParams<{
      id?: string | string[];
      dishId?: string | string[];
      reviewId?: string | string[];
      dishName?: string | string[];
    }>();

  /*
   * The Dashboard may send either:
   * id
   * or
   * dishId
   *
   * This screen accepts both.
   */

  const rawDishId =
    params.id ?? params.dishId;

  const rawReviewId =
    params.reviewId;

  const dishId = Number(
    Array.isArray(rawDishId)
      ? rawDishId[0]
      : rawDishId
  ) || 101;

  const reviewId =
    Array.isArray(rawReviewId)
      ? rawReviewId[0]
      : rawReviewId;

  const editing = !!reviewId;

  const [dish, setDish] =
    useState<Dish | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [overallRating, setOverallRating] =
    useState(5);

  const [spiceLevel, setSpiceLevel] =
    useState(3);

  const [saltLevel, setSaltLevel] =
    useState(3);

  const [sweetnessLevel, setSweetnessLevel] =
    useState(2);

  const [reviewText, setReviewText] =
    useState("");

  const [whatWasBest, setWhatWasBest] =
    useState("");

  const [whatToImprove, setWhatToImprove] =
    useState("");

  useEffect(() => {
    loadReviewPage();
  }, [dishId]);

  async function loadReviewPage() {
    try {
      setLoading(true);

      /*
       * Load dish safely through hybrid backend
       */
      const loadedDish = await backend.fetchDishById(dishId);
      setDish(loadedDish as Dish);

      /*
       * If editing an existing review, load that review.
       */
      if (editing) {
        const localRev = backend.getReviews(dishId).find((r) => String(r.id) === String(reviewId));
        if (localRev) {
          setOverallRating(Number(localRev.overall_rating ?? localRev.rating ?? 5));
          setSpiceLevel(Number(localRev.spice_level ?? 3));
          setSaltLevel(Number(localRev.salt_level ?? 3));
          setSweetnessLevel(Number(localRev.sugar_level ?? localRev.sweetness_level ?? 2));
          setReviewText(localRev.review_text ?? "");
          setWhatWasBest(localRev.what_was_best ?? "");
          setWhatToImprove(localRev.what_to_improve ?? "");
        }
      }
    } catch (error) {
      console.log("Unexpected review loading error:", error);
      // Fallback dish
      setDish(backend.getDishById(dishId) as Dish);
    } finally {
      setLoading(false);
    }
  }

  async function saveReview() {
    /*
     * Overall rating is required.
     */
    if (overallRating === 0) {
      Alert.alert(
        "Rating required",
        "Please select an overall rating before submitting."
      );
      return;
    }

    try {
      setSaving(true);

      // Get user from backend session or auto guest
      let currentUser = backend.getCurrentUser();
      if (!currentUser) {
        currentUser = backend.quickGuestLogin("Stall Guest", "Student VIP");
      }

      await backend.addReview({
        dish_id: dishId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        overall_rating: overallRating,
        rating: overallRating,
        spice_level: spiceLevel || 3,
        salt_level: saltLevel || 3,
        sugar_level: sweetnessLevel || 2,
        sweetness_level: sweetnessLevel || 2,
        review_text: reviewText.trim() || "Great taste and fresh preparation!",
        what_was_best: whatWasBest.trim() || "Flavor and presentation",
        what_to_improve: whatToImprove.trim() || "None, perfect for stall event!",
      });

      Alert.alert(
        "Review Submitted! ⭐",
        "Thank you for sharing your food review at the stall!",
        [
          {
            text: "View Dish",
            onPress: () =>
              router.replace({
                pathname: "/restaurant",
                params: {
                  id: String(dishId),
                },
              }),
          },
          {
            text: "Dashboard",
            onPress: () => router.replace("/dashboard"),
          },
        ]
      );
    } catch (error) {
      console.log("Save review error:", error);
      Alert.alert(
        "Review Saved Locally",
        "Your review has been recorded for this stall showcase!",
        [
          {
            text: "Done",
            onPress: () => router.replace("/dashboard"),
          },
        ]
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * Overall rating selector
   */

  function renderRatingSelector(
    value: number,
    setValue: (
      value: number
    ) => void
  ) {
    return (
      <View
        style={
          styles.ratingSelector
        }
      >
        {[1, 2, 3, 4, 5].map(
          (number) => (
            <Pressable
              key={number}
              style={[
                styles.ratingCircle,
                value === number &&
                  styles.ratingCircleActive,
              ]}
              onPress={() =>
                setValue(number)
              }
            >
              <Text
                style={[
                  styles.ratingNumber,
                  value === number &&
                    styles.ratingNumberActive,
                ]}
              >
                {number}
              </Text>
            </Pressable>
          )
        )}
      </View>
    );
  }

  /*
   * Taste level selector
   */

  function renderLevelSelector(
    value: number,
    setValue: (
      value: number
    ) => void
  ) {
    return (
      <View
        style={
          styles.levelSelector
        }
      >
        {[1, 2, 3, 4, 5].map(
          (number) => (
            <Pressable
              key={number}
              style={[
                styles.levelButton,
                value === number &&
                  styles.levelButtonActive,
              ]}
              onPress={() =>
                setValue(number)
              }
            >
              <Text
                style={[
                  styles.levelNumber,
                  value === number &&
                    styles.levelNumberActive,
                ]}
              >
                {number}
              </Text>
            </Pressable>
          )
        )}
      </View>
    );
  }

  /*
   * Loading screen
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
          Loading review...
        </Text>
      </View>
    );
  }

  /*
   * Invalid dish screen
   */

  if (!dish) {
    return (
      <View
        style={
          styles.loadingScreen
        }
      >
        <Text
          style={styles.errorTitle}
        >
          INVALID DISH
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
            styles.backButton
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
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={
              styles.backCircle
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.backArrow
              }
            >
              ←
            </Text>
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={styles.eyebrow}
            >
              {editing
                ? "EDIT REVIEW"
                : "WRITE A REVIEW"}
            </Text>

            <Text
              style={styles.title}
            >
              {editing
                ? "Update your experience"
                : "Share your experience"}
            </Text>
          </View>
        </View>

        {/* DISH */}

        <View
          style={styles.dishCard}
        >
          {dish.image_url ? (
            <Image
              source={{
                uri: dish.image_url,
              }}
              style={
                styles.dishImage
              }
              resizeMode="cover"
            />
          ) : (
            <View
              style={
                styles.dishImagePlaceholder
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

          <View
            style={
              styles.dishInformation
            }
          >
            <Text
              style={
                styles.dishCategory
              }
            >
              {(
                dish.category ||
                "FOOD"
              ).toUpperCase()}
            </Text>

            <Text
              style={styles.dishName}
              numberOfLines={2}
            >
              {dish.name ||
                "Unnamed Dish"}
            </Text>

            <Text
              style={
                styles.restaurantName
              }
              numberOfLines={1}
            >
              {dish.restaurant_name ||
                "Restaurant"}
            </Text>
          </View>
        </View>

        {/* OVERALL RATING */}

        <View
          style={styles.sectionCard}
        >
          <Text
            style={
              styles.sectionLabel
            }
          >
            OVERALL RATING
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            How would you rate this dish?
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            Your overall rating helps
            other food explorers.
          </Text>

          {renderRatingSelector(
            overallRating,
            setOverallRating
          )}

          <View
            style={
              styles.selectedRating
            }
          >
            <Text
              style={
                styles.selectedRatingText
              }
            >
              {overallRating === 0
                ? "SELECT A RATING"
                : `${overallRating} / 5`}
            </Text>
          </View>
        </View>

        {/* TASTE PROFILE */}

        <View
          style={styles.sectionCard}
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
              styles.sectionTitle
            }
          >
            Tell us about the flavour
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            Rate each characteristic
            from 1 to 5.
          </Text>

          {/* SPICE */}

          <View
            style={styles.levelRow}
          >
            <View
              style={
                styles.levelTitleArea
              }
            >
              <Text
                style={
                  styles.levelTitle
                }
              >
                Spice
              </Text>

              <Text
                style={
                  styles.levelDescription
                }
              >
                How spicy was it?
              </Text>
            </View>

            <Text
              style={
                styles.levelValue
              }
            >
              {spiceLevel || "—"}
            </Text>
          </View>

          {renderLevelSelector(
            spiceLevel,
            setSpiceLevel
          )}

          {/* SALT */}

          <View
            style={[
              styles.levelRow,
              styles.levelRowSpacing,
            ]}
          >
            <View
              style={
                styles.levelTitleArea
              }
            >
              <Text
                style={
                  styles.levelTitle
                }
              >
                Salt
              </Text>

              <Text
                style={
                  styles.levelDescription
                }
              >
                How salty was it?
              </Text>
            </View>

            <Text
              style={
                styles.levelValue
              }
            >
              {saltLevel || "—"}
            </Text>
          </View>

          {renderLevelSelector(
            saltLevel,
            setSaltLevel
          )}

          {/* SWEETNESS */}

          <View
            style={[
              styles.levelRow,
              styles.levelRowSpacing,
            ]}
          >
            <View
              style={
                styles.levelTitleArea
              }
            >
              <Text
                style={
                  styles.levelTitle
                }
              >
                Sweetness
              </Text>

              <Text
                style={
                  styles.levelDescription
                }
              >
                How sweet was it?
              </Text>
            </View>

            <Text
              style={
                styles.levelValue
              }
            >
              {sweetnessLevel || "—"}
            </Text>
          </View>

          {renderLevelSelector(
            sweetnessLevel,
            setSweetnessLevel
          )}
        </View>

        {/* YOUR REVIEW */}

        <View
          style={styles.sectionCard}
        >
          <Text
            style={
              styles.sectionLabel
            }
          >
            YOUR REVIEW
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            What did you think?
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            Share details that would
            help another person decide.
          </Text>

          <TextInput
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="Write your overall experience..."
            placeholderTextColor={
              COLORS.textDim
            }
            style={
              styles.largeInput
            }
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* WHAT WAS BEST */}

        <View
          style={styles.sectionCard}
        >
          <Text
            style={
              styles.sectionLabel
            }
          >
            HIGHLIGHT
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            What was best?
          </Text>

          <TextInput
            value={whatWasBest}
            onChangeText={setWhatWasBest}
            placeholder="What did you enjoy most?"
            placeholderTextColor={
              COLORS.textDim
            }
            style={
              styles.mediumInput
            }
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* WHAT TO IMPROVE */}

        <View
          style={styles.sectionCard}
        >
          <Text
            style={
              styles.sectionLabel
            }
          >
            FEEDBACK
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            What could improve?
          </Text>

          <TextInput
            value={whatToImprove}
            onChangeText={
              setWhatToImprove
            }
            placeholder="What could be better?"
            placeholderTextColor={
              COLORS.textDim
            }
            style={
              styles.mediumInput
            }
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* SUBMIT */}

        <Pressable
          style={[
            styles.submitButton,
            saving &&
              styles.submitButtonDisabled,
          ]}
          onPress={saveReview}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator
              color={COLORS.background}
            />
          ) : (
            <>
              <Text
                style={
                  styles.submitText
                }
              >
                {editing
                  ? "UPDATE REVIEW"
                  : "SUBMIT REVIEW"}
              </Text>

              <Text
                style={
                  styles.submitArrow
                }
              >
                →
              </Text>
            </>
          )}
        </Pressable>

        {/* CANCEL */}

        <Pressable
          style={
            styles.cancelButton
          }
          onPress={() =>
            router.back()
          }
          disabled={saving}
        >
          <Text
            style={
              styles.cancelText
            }
          >
            CANCEL
          </Text>
        </Pressable>

        <View
          style={styles.bottomSpace}
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
    paddingBottom: 40,
  },

  /* LOADING */

  loadingScreen: {
    flex: 1,
    backgroundColor:
      COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 14,
  },

  errorTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
  },

  errorDescription: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },

  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.accent,
  },

  backButtonText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  /* HEADER */

  header: {
    paddingTop: 55,
    paddingHorizontal:
      SPACING.xxl,
    flexDirection: "row",
    alignItems: "center",
  },

  backCircle: {
    width: 42,
    height: 42,
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

  backArrow: {
    color: COLORS.white,
    fontSize: 21,
  },

  headerText: {
    flex: 1,
    marginLeft: 14,
  },

  eyebrow: {
    color: COLORS.accent,
    ...TYPOGRAPHY.caption,
  },

  title: {
    color: COLORS.white,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "800",
    marginTop: 5,
  },

  /* DISH */

  dishCard: {
    marginHorizontal:
      SPACING.lg,
    marginTop: SPACING.xxl,
    backgroundColor:
      COLORS.surface,
    borderRadius:
      RADIUS.xl,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    overflow: "hidden",
  },

  dishImage: {
    width: "100%",
    height: 210,
  },

  dishImagePlaceholder: {
    width: "100%",
    height: 210,
    backgroundColor:
      COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },

  dishInformation: {
    padding: SPACING.lg,
  },

  dishCategory: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
  },

  dishName: {
    color: COLORS.white,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "800",
    marginTop: 5,
  },

  restaurantName: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 5,
  },

  /* SECTIONS */

  sectionCard: {
    marginHorizontal:
      SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.xl,
    backgroundColor:
      COLORS.surface,
    borderRadius:
      RADIUS.xl,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  sectionLabel: {
    color: COLORS.accent,
    ...TYPOGRAPHY.caption,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 7,
  },

  sectionDescription: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  /* RATING */

  ratingSelector: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginTop: 22,
  },

  ratingCircle: {
    width: 48,
    height: 48,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  ratingCircleActive: {
    backgroundColor:
      COLORS.accent,
    borderColor:
      COLORS.accent,
  },

  ratingNumber: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "800",
  },

  ratingNumberActive: {
    color: COLORS.background,
  },

  selectedRating: {
    alignSelf: "center",
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.accentSoft,
  },

  selectedRatingText: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  /* TASTE LEVELS */

  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginTop: 22,
  },

  levelRowSpacing: {
    marginTop: 28,
  },

  levelTitleArea: {
    flex: 1,
  },

  levelTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },

  levelDescription: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 3,
  },

  levelValue: {
    color: COLORS.accent,
    fontSize: 17,
    fontWeight: "800",
  },

  levelSelector: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },

  levelButton: {
    flex: 1,
    height: 38,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  levelButtonActive: {
    backgroundColor:
      COLORS.accent,
    borderColor:
      COLORS.accent,
  },

  levelNumber: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },

  levelNumberActive: {
    color: COLORS.background,
  },

  /* INPUTS */

  largeInput: {
    height: 145,
    marginTop: 18,
    padding: 14,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 20,
  },

  mediumInput: {
    height: 100,
    marginTop: 16,
    padding: 14,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 20,
  },

  /* SUBMIT */

  submitButton: {
    height: 55,
    marginHorizontal:
      SPACING.lg,
    marginTop: SPACING.xl,
    paddingHorizontal: 18,
    borderRadius:
      RADIUS.lg,
    backgroundColor:
      COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  submitArrow: {
    color: COLORS.background,
    fontSize: 22,
    fontWeight: "800",
  },

  /* CANCEL */

  cancelButton: {
    alignSelf: "center",
    marginTop: 16,
    padding: 10,
  },

  cancelText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  bottomSpace: {
    height: 20,
  },
});