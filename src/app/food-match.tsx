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

import {
    COLORS,
    RADIUS,
    SPACING,
    TYPOGRAPHY,
} from "../lib/theme";

import PremiumCard from "../components/ui/PremiumCard";
import BottomNav from "../components/ui/BottomNav";
import { MOCK_DISHES } from "../lib/mockData";


type Dish = {
  id: number;
  name: string;
  restaurant_name: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
};


type Review = {
  dish_id: number;
  rating: number | null;
  overall_rating: number | null;
  spice_level: number | null;
  salt_level: number | null;
  sugar_level: number | null;
  sweetness_level: number | null;
};


type Mood =
  | "Comfort"
  | "Healthy"
  | "Spicy"
  | "Indulgent"
  | "Light";


type SpicePreference =
  | "Low"
  | "Medium"
  | "High";


type SweetnessPreference =
  | "Low"
  | "Medium"
  | "High";


const MOODS: Mood[] = [
  "Comfort",
  "Healthy",
  "Spicy",
  "Indulgent",
  "Light",
];


const SPICE_OPTIONS: SpicePreference[] = [
  "Low",
  "Medium",
  "High",
];


const SWEETNESS_OPTIONS: SweetnessPreference[] = [
  "Low",
  "Medium",
  "High",
];


const CUISINES = [
  "Any",
  "Indian",
  "South Indian",
  "Chinese",
  "Italian",
  "Biryani",
  "Fast Food",
  "Desserts",
  "Beverages",
];


function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length
  );
}


function getTargetValue(
  preference: string
) {
  if (preference === "Low") {
    return 1.7;
  }

  if (preference === "Medium") {
    return 3;
  }

  return 4.3;
}


function getMoodScore(
  mood: Mood,
  dish: Dish
) {
  const category =
    dish.category?.toLowerCase() || "";

  const name =
    dish.name.toLowerCase();

  const description =
    dish.description?.toLowerCase() || "";


  const text =
    `${category} ${name} ${description}`;


  if (mood === "Spicy") {

    if (
      text.includes("chilli") ||
      text.includes("spicy") ||
      text.includes("chicken 65") ||
      text.includes("biryani") ||
      text.includes("pepper")
    ) {
      return 20;
    }

    return 5;
  }


  if (mood === "Healthy") {

    if (
      text.includes("salad") ||
      text.includes("grill") ||
      text.includes("idli") ||
      text.includes("vegetable") ||
      text.includes("paneer")
    ) {
      return 20;
    }

    return 5;
  }


  if (mood === "Comfort") {

    if (
      text.includes("biryani") ||
      text.includes("pizza") ||
      text.includes("pasta") ||
      text.includes("burger") ||
      text.includes("rice")
    ) {
      return 18;
    }

    return 7;
  }


  if (mood === "Indulgent") {

    if (
      text.includes("pizza") ||
      text.includes("burger") ||
      text.includes("dessert") ||
      text.includes("chocolate") ||
      text.includes("ice cream") ||
      text.includes("brownie")
    ) {
      return 20;
    }

    return 6;
  }


  if (mood === "Light") {

    if (
      text.includes("idli") ||
      text.includes("dosa") ||
      text.includes("salad") ||
      text.includes("beverage")
    ) {
      return 18;
    }

    return 7;
  }


  return 0;
}


export default function FoodMatchScreen() {

  const [dishes, setDishes] =
    useState<Dish[]>([]);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [finding, setFinding] =
    useState(false);

  const [mood, setMood] =
    useState<Mood>("Comfort");

  const [spice, setSpice] =
    useState<SpicePreference>("Medium");

  const [sweetness, setSweetness] =
    useState<SweetnessPreference>("Medium");

  const [cuisine, setCuisine] =
    useState("Any");

  const [result, setResult] =
    useState<Dish | null>(null);

  const [matchScore, setMatchScore] =
    useState(0);

  const [resultReasons, setResultReasons] =
    useState<string[]>([]);


  /* =================================================
     LOAD DATA
  ================================================= */

  useEffect(() => {
    loadData();
  }, []);


  async function loadData() {

    try {

      setLoading(true);


      const {
        data: dishData,
        error: dishError,
      } = await supabase
        .from("dishes")
        .select(
          `
            id,
            name,
            restaurant_name,
            category,
            description,
            image_url
          `
        );


      if (dishError || !dishData || dishData.length === 0) {
        console.log("Using fallback dishes for food match");
        setDishes(MOCK_DISHES as any);
      } else {
        setDishes(dishData);
      }


      const {
        data: reviewData,
        error: reviewError,
      } = await supabase
        .from("reviews")
        .select(
          `
            dish_id,
            rating,
            overall_rating,
            spice_level,
            salt_level,
            sugar_level,
            sweetness_level
          `
        );


      if (reviewError) {
        console.log(
          "Food Match reviews error:",
          reviewError
        );
      }


      setReviews(
        reviewData || []
      );


    } catch (error) {

      console.log(
        "Food Match loading error:",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  /* =================================================
     COMMUNITY RATING
  ================================================= */

  function getDishRating(
    dishId: number
  ) {

    const dishReviews =
      reviews.filter(
        (review) =>
          review.dish_id ===
          dishId
      );


    const values =
      dishReviews
        .map((review) =>
          Number(
            review.overall_rating ??
              review.rating ??
              0
          )
        )
        .filter(
          (value) =>
            value > 0
        );


    return average(values);
  }


  /* =================================================
     DISH SPICE
  ================================================= */

  function getDishSpice(
    dishId: number
  ) {

    const values =
      reviews
        .filter(
          (review) =>
            review.dish_id ===
            dishId
        )
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


    return average(values);
  }


  /* =================================================
     DISH SWEETNESS
  ================================================= */

  function getDishSweetness(
    dishId: number
  ) {

    const values =
      reviews
        .filter(
          (review) =>
            review.dish_id ===
            dishId
        )
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


    return average(values);
  }


  /* =================================================
     FIND FOOD
  ================================================= */

  async function findMyFood() {

    if (dishes.length === 0) {
      return;
    }


    setFinding(true);


    /*
      Small delay makes the experience feel
      like the app is actually analysing the
      user's preferences.
    */

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 700)
    );


    let bestDish:
      Dish | null = null;

    let bestScore = -1;

    let bestReasons: string[] = [];


    const targetSpice =
      getTargetValue(spice);

    const targetSweetness =
      getTargetValue(sweetness);


    for (const dish of dishes) {

      let score = 40;

      const reasons: string[] =
        [];


      /* ---------------------------------------------
         CUISINE
      --------------------------------------------- */

      if (
        cuisine !== "Any"
      ) {

        const dishCategory =
          dish.category
            ?.toLowerCase() || "";

        const selectedCuisine =
          cuisine.toLowerCase();


        if (
          dishCategory.includes(
            selectedCuisine
          )
        ) {

          score += 25;

          reasons.push(
            `Matches your ${cuisine} preference`
          );

        } else {

          score -= 15;

        }

      }


      /* ---------------------------------------------
         MOOD
      --------------------------------------------- */

      const moodScore =
        getMoodScore(
          mood,
          dish
        );

      score += moodScore;


      if (
        moodScore >= 15
      ) {

        reasons.push(
          `Fits your ${mood.toLowerCase()} mood`
        );

      }


      /* ---------------------------------------------
         SPICE
      --------------------------------------------- */

      const dishSpice =
        getDishSpice(
          dish.id
        );


      if (
        dishSpice > 0
      ) {

        const difference =
          Math.abs(
            dishSpice -
              targetSpice
          );


        if (
          difference <= 0.5
        ) {

          score += 18;

          reasons.push(
            "Matches your spice preference"
          );

        } else if (
          difference <= 1
        ) {

          score += 9;

        }

      }


      /* ---------------------------------------------
         SWEETNESS
      --------------------------------------------- */

      const dishSweetness =
        getDishSweetness(
          dish.id
        );


      if (
        dishSweetness > 0
      ) {

        const difference =
          Math.abs(
            dishSweetness -
              targetSweetness
          );


        if (
          difference <= 0.5
        ) {

          score += 12;

          reasons.push(
            "Matches your sweetness preference"
          );

        } else if (
          difference <= 1
        ) {

          score += 6;

        }

      }


      /* ---------------------------------------------
         COMMUNITY RATING
      --------------------------------------------- */

      const rating =
        getDishRating(
          dish.id
        );


      if (
        rating >= 4.5
      ) {

        score += 12;

        reasons.push(
          "Highly rated by the community"
        );

      } else if (
        rating >= 4
      ) {

        score += 8;

        reasons.push(
          "Well rated by the community"
        );

      }


      /* ---------------------------------------------
         LIMIT SCORE
      --------------------------------------------- */

      score = Math.max(
        20,
        Math.min(
          99,
          Math.round(score)
        )
      );


      if (
        score > bestScore
      ) {

        bestScore =
          score;

        bestDish =
          dish;

        bestReasons =
          reasons;

      }

    }


    if (
      bestDish
    ) {

      setResult(
        bestDish
      );

      setMatchScore(
        bestScore
      );

      if (
        bestReasons.length === 0
      ) {

        bestReasons = [
          "Selected from your preferences",
          "Worth discovering",
        ];

      }

      setResultReasons(
        bestReasons.slice(
          0,
          3
        )
      );

    }


    setFinding(false);

  }


  /* =================================================
     RESULT RATING
  ================================================= */

  const resultRating =
    useMemo(() => {

      if (!result) {
        return 0;
      }

      return getDishRating(
        result.id
      );

    }, [
      result,
      reviews,
    ]);


  /* =================================================
     LOADING
  ================================================= */

  if (loading) {

    return (

      <View
        style={
          styles.loadingScreen
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
          PREPARING FOOD MATCH...
        </Text>

      </View>

    );

  }


  /* =================================================
     UI
  ================================================= */

  return (

    <View
      style={styles.screen}
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.container
        }
      >


        {/* ==========================================
            HEADER
        =========================================== */}

        <Pressable
          onPress={() =>
            router.back()
          }
          style={styles.backButton}
        >
          <Text
            style={
              styles.backText
            }
          >
            ← BACK
          </Text>
        </Pressable>


        <Text
          style={styles.eyebrow}
        >
          PERSONAL FOOD AI
        </Text>


        <Text
          style={styles.title}
        >
          What should I eat?
        </Text>


        <Text
          style={styles.subtitle}
        >
          Tell us what you're craving.
          We'll find a dish that fits.
        </Text>



        {/* ==========================================
            MOOD
        =========================================== */}

        <Text
          style={styles.sectionLabel}
        >
          WHAT'S YOUR MOOD?
        </Text>


        <View
          style={styles.optionGrid}
        >

          {MOODS.map(
            (item) => (

              <Pressable
                key={item}
                onPress={() =>
                  setMood(item)
                }
                style={[
                  styles.option,
                  mood === item &&
                    styles.optionSelected,
                ]}
              >

                <Text
                  style={[
                    styles.optionText,
                    mood === item &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>

              </Pressable>

            )
          )}

        </View>



        {/* ==========================================
            SPICE
        =========================================== */}

        <Text
          style={styles.sectionLabel}
        >
          SPICE LEVEL
        </Text>


        <View
          style={styles.threeOptions}
        >

          {SPICE_OPTIONS.map(
            (item) => (

              <Pressable
                key={item}
                onPress={() =>
                  setSpice(item)
                }
                style={[
                  styles.threeOption,
                  spice === item &&
                    styles.optionSelected,
                ]}
              >

                <Text
                  style={[
                    styles.optionText,
                    spice === item &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>

              </Pressable>

            )
          )}

        </View>



        {/* ==========================================
            SWEETNESS
        =========================================== */}

        <Text
          style={styles.sectionLabel}
        >
          SWEETNESS
        </Text>


        <View
          style={styles.threeOptions}
        >

          {SWEETNESS_OPTIONS.map(
            (item) => (

              <Pressable
                key={item}
                onPress={() =>
                  setSweetness(
                    item
                  )
                }
                style={[
                  styles.threeOption,
                  sweetness === item &&
                    styles.optionSelected,
                ]}
              >

                <Text
                  style={[
                    styles.optionText,
                    sweetness === item &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>

              </Pressable>

            )
          )}

        </View>



        {/* ==========================================
            CUISINE
        =========================================== */}

        <Text
          style={styles.sectionLabel}
        >
          CUISINE
        </Text>


        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.cuisineScroll
          }
        >

          {CUISINES.map(
            (item) => (

              <Pressable
                key={item}
                onPress={() =>
                  setCuisine(
                    item
                  )
                }
                style={[
                  styles.cuisineOption,
                  cuisine === item &&
                    styles.optionSelected,
                ]}
              >

                <Text
                  style={[
                    styles.optionText,
                    cuisine === item &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>

              </Pressable>

            )
          )}

        </ScrollView>



        {/* ==========================================
            FIND BUTTON
        =========================================== */}

        <Pressable
          onPress={
            findMyFood
          }
          disabled={finding}
          style={({ pressed }) => [
            styles.findButton,

            pressed &&
              styles.pressed,

            finding &&
              styles.findButtonDisabled,
          ]}
        >

          {finding ? (

            <View
              style={
                styles.findingRow
              }
            >

              <ActivityIndicator
                size="small"
                color={
                  COLORS.background
                }
              />

              <Text
                style={
                  styles.findButtonText
                }
              >
                FINDING YOUR MATCH...
              </Text>

            </View>

          ) : (

            <Text
              style={
                styles.findButtonText
              }
            >
              FIND MY FOOD →
            </Text>

          )}

        </Pressable>



        {/* ==========================================
            RESULT
        =========================================== */}

        {result ? (

          <View
            style={
              styles.resultSection
            }
          >

            <Text
              style={
                styles.sectionLabel
              }
            >
              YOUR MATCH
            </Text>


            <PremiumCard
              elevated
              style={
                styles.resultCard
              }
            >

              {/* MATCH SCORE */}

              <View
                style={
                  styles.resultTop
                }
              >

                <View
                  style={
                    styles.matchBadge
                  }
                >

                  <Text
                    style={
                      styles.matchScore
                    }
                  >
                    {matchScore}%
                  </Text>

                  <Text
                    style={
                      styles.matchLabel
                    }
                  >
                    MATCH
                  </Text>

                </View>


                <View
                  style={
                    styles.resultMeta
                  }
                >

                  <Text
                    style={
                      styles.resultCategory
                    }
                  >
                    {result.category
                      ?.toUpperCase() ||
                      "DISH"}
                  </Text>


                  <Text
                    style={
                      styles.resultName
                    }
                  >
                    {result.name}
                  </Text>


                  <Text
                    style={
                      styles.resultRestaurant
                    }
                  >
                    {result.restaurant_name}
                  </Text>

                </View>

              </View>



              {/* DESCRIPTION */}

              {result.description ? (

                <Text
                  style={
                    styles.resultDescription
                  }
                >
                  {result.description}
                </Text>

              ) : null}



              {/* RATING */}

              <View
                style={
                  styles.ratingRow
                }
              >

                <Text
                  style={
                    styles.stars
                  }
                >
                  ★★★★★
                </Text>

                <Text
                  style={
                    styles.ratingNumber
                  }
                >
                  {resultRating > 0
                    ? resultRating.toFixed(
                        1
                      )
                    : "New"}
                </Text>

              </View>



              {/* WHY */}

              <View
                style={
                  styles.whyBox
                }
              >

                <Text
                  style={
                    styles.whyTitle
                  }
                >
                  WHY THIS MATCH?
                </Text>


                {resultReasons.map(
                  (reason, index) => (

                    <View
                      key={index}
                      style={
                        styles.reasonRow
                      }
                    >

                      <Text
                        style={
                          styles.check
                        }
                      >
                        ✓
                      </Text>

                      <Text
                        style={
                          styles.reasonText
                        }
                      >
                        {reason}
                      </Text>

                    </View>

                  )
                )}

              </View>



              {/* VIEW DISH */}

              <Pressable
                onPress={() =>
                  router.push(
                    `/restaurant?id=${result.id}`
                  )
                }
                style={({ pressed }) => [
                  styles.viewDishButton,

                  pressed &&
                    styles.pressed,
                ]}
              >

                <Text
                  style={
                    styles.viewDishText
                  }
                >
                  VIEW DISH →
                </Text>

              </Pressable>

            </PremiumCard>

          </View>

        ) : null}



        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>

      {/* FLOATING BOTTOM NAV */}
      <BottomNav />
    </View>

  );
}


/* =====================================================
   STYLES
===================================================== */

const styles =
  StyleSheet.create({

    screen: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    container: {
      paddingHorizontal:
        SPACING.xl,

      paddingTop:
        SPACING.xl,

      paddingBottom:
        SPACING.xxxl,
    },


    /* LOADING */

    loadingScreen: {
      flex: 1,

      backgroundColor:
        COLORS.background,

      alignItems: "center",

      justifyContent:
        "center",
    },

    loadingText: {
      color:
        COLORS.textMuted,

      fontSize: 11,

      fontWeight: "800",

      letterSpacing: 1.5,

      marginTop:
        SPACING.lg,
    },


    /* HEADER */

    backButton: {
      alignSelf:
        "flex-start",

      marginBottom:
        SPACING.xxxl,
    },

    backText: {
      color:
        COLORS.textSecondary,

      fontSize: 11,

      fontWeight: "800",

      letterSpacing: 1,
    },

    eyebrow: {
      color:
        COLORS.accent,

      fontSize: 10,

      fontWeight: "900",

      letterSpacing: 1.8,

      marginBottom: 8,
    },

    title: {
      color:
        COLORS.white,

      ...TYPOGRAPHY.display,
    },

    subtitle: {
      color:
        COLORS.textSecondary,

      ...TYPOGRAPHY.body,

      marginTop: 7,

      marginBottom:
        SPACING.xxxl,
    },


    /* SECTIONS */

    sectionLabel: {
      color:
        COLORS.textMuted,

      ...TYPOGRAPHY.caption,

      marginBottom:
        SPACING.md,
    },


    /* OPTIONS */

    optionGrid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap: SPACING.sm,

      marginBottom:
        SPACING.xxxl,
    },

    option: {
      paddingHorizontal:
        SPACING.lg,

      paddingVertical:
        12,

      borderRadius:
        RADIUS.round,

      backgroundColor:
        COLORS.surface,

      borderWidth: 1,

      borderColor:
        COLORS.border,
    },

    optionSelected: {
      backgroundColor:
        COLORS.accentSoft,

      borderColor:
        COLORS.accentDark,
    },

    optionText: {
      color:
        COLORS.textSecondary,

      fontSize: 12,

      fontWeight: "700",
    },

    optionTextSelected: {
      color:
        COLORS.accent,

      fontWeight: "900",
    },


    /* THREE OPTIONS */

    threeOptions: {
      flexDirection:
        "row",

      gap: SPACING.sm,

      marginBottom:
        SPACING.xxxl,
    },

    threeOption: {
      flex: 1,

      alignItems:
        "center",

      paddingVertical:
        13,

      borderRadius:
        RADIUS.lg,

      backgroundColor:
        COLORS.surface,

      borderWidth: 1,

      borderColor:
        COLORS.border,
    },


    /* CUISINE */

    cuisineScroll: {
      gap: SPACING.sm,

      paddingBottom:
        SPACING.xxxl,
    },

    cuisineOption: {
      paddingHorizontal:
        SPACING.lg,

      paddingVertical:
        12,

      borderRadius:
        RADIUS.round,

      backgroundColor:
        COLORS.surface,

      borderWidth: 1,

      borderColor:
        COLORS.border,
    },


    /* FIND BUTTON */

    findButton: {
      backgroundColor:
        COLORS.accent,

      borderRadius:
        RADIUS.xl,

      minHeight: 58,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        SPACING.xxxl,
    },

    findButtonDisabled: {
      opacity: 0.8,
    },

    findButtonText: {
      color:
        COLORS.background,

      fontSize: 12,

      fontWeight: "900",

      letterSpacing: 1.1,
    },

    findingRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: SPACING.sm,
    },


    /* RESULT */

    resultSection: {
      marginTop:
        SPACING.sm,
    },

    resultCard: {
      marginBottom:
        SPACING.lg,
    },

    resultTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        SPACING.xl,
    },

    matchBadge: {
      width: 76,

      height: 76,

      borderRadius: 38,

      backgroundColor:
        COLORS.accentSoft,

      borderWidth: 1,

      borderColor:
        COLORS.accentDark,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        SPACING.lg,
    },

    matchScore: {
      color:
        COLORS.accent,

      fontSize: 20,

      fontWeight: "900",
    },

    matchLabel: {
      color:
        COLORS.textMuted,

      fontSize: 8,

      fontWeight: "900",

      letterSpacing: 1,
    },

    resultMeta: {
      flex: 1,
    },

    resultCategory: {
      color:
        COLORS.accent,

      fontSize: 9,

      fontWeight: "900",

      letterSpacing: 1.4,

      marginBottom: 4,
    },

    resultName: {
      color:
        COLORS.white,

      fontSize: 23,

      fontWeight: "900",
    },

    resultRestaurant: {
      color:
        COLORS.textSecondary,

      fontSize: 13,

      marginTop: 4,
    },

    resultDescription: {
      color:
        COLORS.textSecondary,

      fontSize: 13,

      lineHeight: 20,

      marginBottom:
        SPACING.lg,
    },


    /* RATING */

    ratingRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        SPACING.xl,
    },

    stars: {
      color:
        COLORS.accent,

      fontSize: 16,

      letterSpacing: 1,
    },

    ratingNumber: {
      color:
        COLORS.white,

      fontSize: 14,

      fontWeight: "800",

      marginLeft:
        SPACING.sm,
    },


    /* WHY */

    whyBox: {
      backgroundColor:
        COLORS.backgroundSoft,

      borderRadius:
        RADIUS.lg,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      padding:
        SPACING.lg,

      marginBottom:
        SPACING.lg,
    },

    whyTitle: {
      color:
        COLORS.textMuted,

      fontSize: 10,

      fontWeight: "900",

      letterSpacing: 1.4,

      marginBottom:
        SPACING.md,
    },

    reasonRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginBottom:
        SPACING.sm,
    },

    check: {
      color:
        COLORS.accent,

      fontSize: 14,

      fontWeight: "900",

      marginRight:
        SPACING.sm,
    },

    reasonText: {
      flex: 1,

      color:
        COLORS.textSecondary,

      fontSize: 12,

      lineHeight: 18,
    },


    /* VIEW DISH */

    viewDishButton: {
      backgroundColor:
        COLORS.surfaceLight,

      borderWidth: 1,

      borderColor:
        COLORS.borderLight,

      borderRadius:
        RADIUS.lg,

      paddingVertical:
        14,

      alignItems:
        "center",
    },

    viewDishText: {
      color:
        COLORS.white,

      fontSize: 11,

      fontWeight: "900",

      letterSpacing: 1,
    },


    /* GENERAL */

    pressed: {
      opacity: 0.7,

      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    bottomSpace: {
      height: 40,
    },

  });