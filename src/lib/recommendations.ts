import { supabase } from "./supabase";
import { MOCK_DISHES } from "./mockData";

export type RecommendedDish = {
  id: number;
  name: string;
  restaurant_name: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  matchScore: number;
  reasons: string[];
  communityRating: number;
};

type Review = {
  dish_id: number;
  user_id: string;
  rating: number | null;
  overall_rating: number | null;
  spice_level: number | null;
  salt_level: number | null;
  sugar_level: number | null;
  sweetness_level: number | null;
};

type Dish = {
  id: number;
  name: string;
  restaurant_name: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
};

type Favorite = {
  dish_id: number;
};


/* =====================================================
   GET RECOMMENDATIONS
===================================================== */

export async function getRecommendations(
  userId?: string
): Promise<RecommendedDish[]> {

  try {

    /* -------------------------------------------------
       GET CURRENT USER IF ID WAS NOT PROVIDED
    ------------------------------------------------- */

    let currentUserId = userId;

    if (!currentUserId) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        currentUserId = user?.id;
      } catch {}
    }


    /* -------------------------------------------------
       GET ALL DISHES
    ------------------------------------------------- */
    let dishes: Dish[] = [];

    try {
      const {
        data,
        error: dishesError,
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
      if (!dishesError && data && data.length > 0) {
        dishes = data;
      }
    } catch {}

    if (!dishes || dishes.length === 0) {
      dishes = MOCK_DISHES;
    }


    /* -------------------------------------------------
       GET REVIEWS
    ------------------------------------------------- */

    const {
      data: reviews,
      error: reviewsError,
    } = await supabase
      .from("reviews")
      .select(
        `
          dish_id,
          user_id,
          rating,
          overall_rating,
          spice_level,
          salt_level,
          sugar_level,
          sweetness_level
        `
      );


    if (reviewsError) {
      console.log(
        "Recommendation reviews error:",
        reviewsError
      );
    }


    /* -------------------------------------------------
       GET FAVORITES
    ------------------------------------------------- */

    let favorites: Favorite[] = [];

    if (currentUserId) {

      const {
        data: favoriteData,
        error: favoriteError,
      } = await supabase
        .from("favorites")
        .select("dish_id")
        .eq(
          "user_id",
          currentUserId
        );

      if (favoriteError) {

        console.log(
          "Recommendation favorites error:",
          favoriteError
        );

      } else {

        favorites =
          favoriteData || [];

      }

    }


    /* -------------------------------------------------
       USER REVIEWS
    ------------------------------------------------- */

    const userReviews =
      currentUserId
        ? (reviews || []).filter(
            (review) =>
              review.user_id ===
              currentUserId
          )
        : [];


    /* -------------------------------------------------
       USER TASTE PROFILE
    ------------------------------------------------- */

    const ratingValues =
      userReviews
        .map((review) =>
          Number(
            review.overall_rating ??
              review.rating ??
              0
          )
        )
        .filter(
          (value) => value > 0
        );


    const spiceValues =
      userReviews
        .map((review) =>
          Number(
            review.spice_level ??
              0
          )
        )
        .filter(
          (value) => value > 0
        );


    const saltValues =
      userReviews
        .map((review) =>
          Number(
            review.salt_level ??
              0
          )
        )
        .filter(
          (value) => value > 0
        );


    const sweetnessValues =
      userReviews
        .map((review) =>
          Number(
            review.sugar_level ??
              review.sweetness_level ??
              0
          )
        )
        .filter(
          (value) => value > 0
        );


    const average = (
      values: number[]
    ) => {

      if (values.length === 0) {
        return 0;
      }

      return (
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / values.length
      );

    };


    const userRating =
      average(ratingValues);

    const userSpice =
      average(spiceValues);

    const userSalt =
      average(saltValues);

    const userSweetness =
      average(sweetnessValues);


    /* -------------------------------------------------
       FAVORITE SET
    ------------------------------------------------- */

    const favoriteDishIds =
      new Set(
        favorites.map(
          (favorite) =>
            favorite.dish_id
        )
      );


    /* -------------------------------------------------
       ALREADY REVIEWED SET
    ------------------------------------------------- */

    const reviewedDishIds =
      new Set(
        userReviews.map(
          (review) =>
            review.dish_id
        )
      );


    /* -------------------------------------------------
       SCORE EACH DISH
    ------------------------------------------------- */

    const results:
      RecommendedDish[] = [];


    for (const dish of dishes as Dish[]) {

      /* Don't recommend a dish already reviewed */

      if (
        reviewedDishIds.has(
          dish.id
        )
      ) {
        continue;
      }


      /* Reviews for this dish */

      const dishReviews =
        (reviews || []).filter(
          (review) =>
            review.dish_id ===
            dish.id
        );


      /* Community rating */

      const dishRatings =
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


      const communityRating =
        dishRatings.length > 0
          ? average(dishRatings)
          : 0;


      /* Taste values */

      const dishSpiceValues =
        dishReviews
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


      const dishSaltValues =
        dishReviews
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


      const dishSweetnessValues =
        dishReviews
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


      const dishSpice =
        average(
          dishSpiceValues
        );

      const dishSalt =
        average(
          dishSaltValues
        );

      const dishSweetness =
        average(
          dishSweetnessValues
        );


      /* -------------------------------------------------
         MATCH SCORE
      ------------------------------------------------- */

      let score = 50;

      const reasons: string[] =
        [];


      /* Community rating */

      if (
        communityRating >= 4.5
      ) {

        score += 15;

        reasons.push(
          "Highly rated by the community"
        );

      } else if (
        communityRating >= 4
      ) {

        score += 10;

        reasons.push(
          "Well rated by the community"
        );

      }


      /* Spice */

      if (
        userSpice > 0 &&
        dishSpice > 0
      ) {

        const difference =
          Math.abs(
            userSpice -
              dishSpice
          );

        if (
          difference <= 0.5
        ) {

          score += 10;

          reasons.push(
            "Matches your spice preference"
          );

        } else if (
          difference <= 1
        ) {

          score += 5;

        }

      }


      /* Salt */

      if (
        userSalt > 0 &&
        dishSalt > 0
      ) {

        const difference =
          Math.abs(
            userSalt -
              dishSalt
          );

        if (
          difference <= 0.5
        ) {

          score += 8;

          reasons.push(
            "Matches your seasoning preference"
          );

        } else if (
          difference <= 1
        ) {

          score += 4;

        }

      }


      /* Sweetness */

      if (
        userSweetness > 0 &&
        dishSweetness > 0
      ) {

        const difference =
          Math.abs(
            userSweetness -
              dishSweetness
          );

        if (
          difference <= 0.5
        ) {

          score += 8;

          reasons.push(
            "Matches your sweetness preference"
          );

        } else if (
          difference <= 1
        ) {

          score += 4;

        }

      }


      /* Favorite-related boost */

      if (
        favoriteDishIds.has(
          dish.id
        )
      ) {

        score += 5;

        reasons.push(
          "Related to dishes you saved"
        );

      }


      /* User's rating behaviour */

      if (
        userRating >= 4 &&
        communityRating >= 4
      ) {

        score += 5;

        reasons.push(
          "Fits your positive rating pattern"
        );

      }


      /* -------------------------------------------------
         LIMIT SCORE
      ------------------------------------------------- */

      score = Math.max(
        0,
        Math.min(
          99,
          Math.round(score)
        )
      );


      /* Default reason */

      if (
        reasons.length === 0
      ) {

        reasons.push(
          "Worth exploring based on community activity"
        );

      }


      results.push({

        id: dish.id,

        name: dish.name,

        restaurant_name:
          dish.restaurant_name,

        category:
          dish.category,

        description:
          dish.description,

        image_url:
          dish.image_url,

        matchScore:
          score,

        reasons,

        communityRating:
          Number(
            communityRating.toFixed(1)
          ),

      });

    }


    /* -------------------------------------------------
       SORT
    ------------------------------------------------- */

    results.sort(
      (a, b) =>
        b.matchScore -
        a.matchScore
    );


    /* -------------------------------------------------
       RETURN TOP RESULTS
    ------------------------------------------------- */

    if (results.length === 0) {
      return MOCK_DISHES.slice(0, 6).map((d, index) => ({
        id: d.id,
        name: d.name,
        restaurant_name: d.restaurant_name,
        category: d.category,
        description: d.description,
        image_url: d.image_url,
        matchScore: 95 - index * 3,
        reasons: ["Campus Favorite", "Stall Special Choice"],
        communityRating: d.averageRating || 4.8,
      }));
    }

    return results.slice(
      0,
      10
    );


  } catch (error) {

    console.log(
      "Recommendation error:",
      error
    );

    return MOCK_DISHES.slice(0, 6).map((d, index) => ({
      id: d.id,
      name: d.name,
      restaurant_name: d.restaurant_name,
      category: d.category,
      description: d.description,
      image_url: d.image_url,
      matchScore: 92 - index * 2,
      reasons: ["Popular on Campus"],
      communityRating: d.averageRating || 4.8,
    }));

  }

}