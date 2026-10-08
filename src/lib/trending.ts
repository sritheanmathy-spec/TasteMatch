import { supabase } from "./supabase";
import { MOCK_DISHES } from "./mockData";

// ============================================================
// TYPES
// ============================================================

export type TrendingDish = {
  id: number;
  name: string;
  restaurant_name: string;
  category: string | null;
  description: string | null;
  image_url: string | null;

  rating: number;
  reviewCount: number;
  favoriteCount: number;

  trendingScore: number;

  rank: number;
  label: string;
};

// ============================================================
// INTERNAL TYPES
// ============================================================

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
  overall_rating: number | null;
  created_at: string | null;
};

type Favorite = {
  dish_id: number;
  created_at: string | null;
};

// ============================================================
// AVERAGE
// ============================================================

function average(values: number[]): number {
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

// ============================================================
// DAYS SINCE DATE
// ============================================================

function daysSince(dateString: string | null): number {
  if (!dateString) {
    return 999;
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 999;
  }

  const now = new Date();

  const difference =
    now.getTime() -
    date.getTime();

  return Math.max(
    0,
    difference /
      (1000 * 60 * 60 * 24)
  );
}

// ============================================================
// GET TRENDING DISHES
// ============================================================

export async function getTrendingDishes(): Promise<
  TrendingDish[]
> {
  try {
    // ========================================================
    // 1. LOAD DISHES
    // ========================================================

    let dishes: Dish[] = [];
    try {
      const {
        data: dishesData,
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

      if (!dishesError && dishesData && dishesData.length > 0) {
        dishes = dishesData as Dish[];
      }
    } catch {}

    if (dishes.length === 0) {
      dishes = MOCK_DISHES;
    }

    // ========================================================
    // 2. LOAD REVIEWS
    // ========================================================

    const {
      data: reviewsData,
      error: reviewsError,
    } = await supabase
      .from("reviews")
      .select(
        `
        dish_id,
        overall_rating,
        created_at
        `
      );

    if (reviewsError) {
      console.log(
        "Trending reviews error:",
        reviewsError.message
      );
    }

    const reviews: Review[] =
      (reviewsData || []) as Review[];

    // ========================================================
    // 3. LOAD FAVORITES
    // ========================================================

    const {
      data: favoritesData,
      error: favoritesError,
    } = await supabase
      .from("favorites")
      .select(
        `
        dish_id,
        created_at
        `
      );

    if (favoritesError) {
      console.log(
        "Trending favorites error:",
        favoritesError.message
      );
    }

    const favorites: Favorite[] =
      (favoritesData || []) as Favorite[];

    // ========================================================
    // 4. CALCULATE DISH SCORES
    // ========================================================

    const results: TrendingDish[] = [];

    dishes.forEach((dish) => {
      // ------------------------------------------------------
      // REVIEWS FOR THIS DISH
      // ------------------------------------------------------

      const dishReviews =
        reviews.filter(
          (review) =>
            review.dish_id ===
            dish.id
        );

      // ------------------------------------------------------
      // FAVORITES FOR THIS DISH
      // ------------------------------------------------------

      const dishFavorites =
        favorites.filter(
          (favorite) =>
            favorite.dish_id ===
            dish.id
        );

      // ------------------------------------------------------
      // RATINGS
      // ------------------------------------------------------

      const ratings =
        dishReviews
          .map(
            (review) =>
              review.overall_rating
          )
          .filter(
            (
              value
            ): value is number =>
              typeof value ===
              "number"
          );

      const rating =
        average(ratings);

      // ------------------------------------------------------
      // REVIEW COUNT
      // ------------------------------------------------------

      const reviewCount =
        dishReviews.length;

      // ------------------------------------------------------
      // FAVORITE COUNT
      // ------------------------------------------------------

      const favoriteCount =
        dishFavorites.length;

      // ======================================================
      // TRENDING SCORE
      // ======================================================

      let score = 0;

      // ------------------------------------------------------
      // QUALITY
      // Maximum roughly 35 points
      // ------------------------------------------------------

      score += rating * 7;

      // ------------------------------------------------------
      // REVIEW ACTIVITY
      // ------------------------------------------------------

      score += Math.min(
        reviewCount * 4,
        25
      );

      // ------------------------------------------------------
      // FAVORITE ACTIVITY
      // ------------------------------------------------------

      score += Math.min(
        favoriteCount * 3,
        20
      );

      // ------------------------------------------------------
      // RECENT REVIEW ACTIVITY
      // ------------------------------------------------------

      dishReviews.forEach(
        (review) => {
          const days =
            daysSince(
              review.created_at
            );

          if (days <= 1) {
            score += 8;
          } else if (days <= 3) {
            score += 5;
          } else if (days <= 7) {
            score += 3;
          }
        }
      );

      // ------------------------------------------------------
      // RECENT FAVORITE ACTIVITY
      // ------------------------------------------------------

      dishFavorites.forEach(
        (favorite) => {
          const days =
            daysSince(
              favorite.created_at
            );

          if (days <= 1) {
            score += 5;
          } else if (days <= 3) {
            score += 3;
          } else if (days <= 7) {
            score += 2;
          }
        }
      );

      // ------------------------------------------------------
      // FINAL SCORE
      // ------------------------------------------------------

      const trendingScore =
        Math.min(
          Math.round(score),
          100
        );

      results.push({
        id: dish.id,
        name: dish.name,
        restaurant_name:
          dish.restaurant_name,
        category: dish.category,
        description:
          dish.description,
        image_url:
          dish.image_url,

        rating:
          Math.round(
            rating * 10
          ) / 10,

        reviewCount,

        favoriteCount,

        trendingScore,

        rank: 0,

        label:
          "Trending Now",
      });
    });

    // ========================================================
    // SORT
    // ========================================================

    results.sort(
      (a, b) =>
        b.trendingScore -
        a.trendingScore
    );

    // ========================================================
    // ASSIGN RANKS
    // ========================================================

    results.forEach(
      (dish, index) => {
        dish.rank =
          index + 1;
      }
    );

    // ========================================================
    // RETURN TOP 10
    // ========================================================

    if (results.length === 0) {
      return MOCK_DISHES.slice(0, 10).map((d, index) => ({
        id: d.id,
        name: d.name,
        restaurant_name: d.restaurant_name,
        category: d.category,
        description: d.description,
        image_url: d.image_url,
        rating: d.averageRating || 4.8,
        reviewCount: d.reviewCount || 10,
        favoriteCount: 20 - index,
        trendingScore: 98 - index * 3,
        rank: index + 1,
        label: index === 0 ? "🔥 Stall #1 Favorite" : "Campus Hit",
      }));
    }

    return results.slice(
      0,
      10
    );
  } catch (error) {
    console.log(
      "Trending engine error:",
      error
    );

    return MOCK_DISHES.slice(0, 10).map((d, index) => ({
      id: d.id,
      name: d.name,
      restaurant_name: d.restaurant_name,
      category: d.category,
      description: d.description,
      image_url: d.image_url,
      rating: d.averageRating || 4.8,
      reviewCount: d.reviewCount || 10,
      favoriteCount: 20 - index,
      trendingScore: 98 - index * 3,
      rank: index + 1,
      label: "Campus Hit",
    }));
  }
}

// ============================================================
// HIGHEST RATED
// ============================================================

export async function getHighestRatedDishes(): Promise<
  TrendingDish[]
> {
  const dishes =
    await getTrendingDishes();

  return dishes
    .filter(
      (dish) =>
        dish.rating > 0
    )
    .sort(
      (a, b) =>
        b.rating -
        a.rating
    )
    .slice(0, 10)
    .map(
      (dish, index) => ({
        ...dish,
        rank: index + 1,
        label: "Highest Rated",
      })
    );
}

// ============================================================
// MOST REVIEWED
// ============================================================

export async function getMostReviewedDishes(): Promise<
  TrendingDish[]
> {
  const dishes =
    await getTrendingDishes();

  return dishes
    .sort(
      (a, b) =>
        b.reviewCount -
        a.reviewCount
    )
    .slice(0, 10)
    .map(
      (dish, index) => ({
        ...dish,
        rank: index + 1,
        label: "Most Reviewed",
      })
    );
}

// ============================================================
// MOST SAVED
// ============================================================

export async function getMostSavedDishes(): Promise<
  TrendingDish[]
> {
  const dishes =
    await getTrendingDishes();

  return dishes
    .sort(
      (a, b) =>
        b.favoriteCount -
        a.favoriteCount
    )
    .slice(0, 10)
    .map(
      (dish, index) => ({
        ...dish,
        rank: index + 1,
        label: "Most Saved",
      })
    );
}