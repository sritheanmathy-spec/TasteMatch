// src/lib/backend.ts
// Robust, offline-first Hybrid Backend Service for TasteMatch
import { supabase } from "./supabase";
import { MOCK_DISHES, MockDish, FRIEND_VISITS, FriendVisit } from "./mockData";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  grade?: string;
  badge?: string;
  avatar?: string;
  createdAt: string;
};

export type AppReview = {
  id: string | number;
  dish_id: string | number;
  user_id?: string | null;
  user_name?: string | null;
  rating?: number | null;
  overall_rating?: number | null;
  spice_level?: number | null;
  salt_level?: number | null;
  sugar_level?: number | null;
  sweetness_level?: number | null;
  review_text?: string | null;
  what_was_best?: string | null;
  what_to_improve?: string | null;
  created_at?: string;
};

// Initial in-memory student seed reviews
const INITIAL_REVIEWS: AppReview[] = [
  {
    id: "rev-1",
    dish_id: 101,
    user_name: "Karthik R. (10-A)",
    rating: 5,
    overall_rating: 5,
    spice_level: 4,
    salt_level: 3,
    sugar_level: 1,
    sweetness_level: 1,
    review_text: "Incredible basmati fragrance, huge portion for after-school feasts!",
    what_was_best: "Tender chicken and fried onions",
    what_to_improve: "A bit more salan would be great",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "rev-2",
    dish_id: 102,
    user_name: "Priya Sharma (10-C)",
    rating: 5,
    overall_rating: 5,
    spice_level: 2,
    salt_level: 3,
    sugar_level: 2,
    sweetness_level: 2,
    review_text: "The cheese burst crust literally saved our mood after coaching!",
    what_was_best: "Cheese pull and garlic seasoning",
    what_to_improve: "Nothing, it's perfect",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "rev-3",
    dish_id: 103,
    user_name: "Rohan M. (11-A)",
    rating: 5,
    overall_rating: 5,
    spice_level: 4,
    salt_level: 3,
    sugar_level: 1,
    sweetness_level: 1,
    review_text: "Top-tier crunch and generous peri-peri seasoning.",
    what_was_best: "Garlic mayo dip",
    what_to_improve: "Can be slightly less salty",
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: "rev-4",
    dish_id: 104,
    user_name: "Aryan K. (12-B)",
    rating: 5,
    overall_rating: 5,
    spice_level: 5,
    salt_level: 3,
    sugar_level: 1,
    sweetness_level: 1,
    review_text: "The spicy garlic chutney is fiery! Absolute adrenaline wake-up.",
    what_was_best: "Kurkure crust texture",
    what_to_improve: "Serve with cold water ready!",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "rev-5",
    dish_id: 105,
    user_name: "Sneha Patel (11-B)",
    rating: 5,
    overall_rating: 5,
    spice_level: 1,
    salt_level: 2,
    sugar_level: 5,
    sweetness_level: 5,
    review_text: "Warm flowing dark chocolate centre is pure exam therapy.",
    what_was_best: "Molten centre",
    what_to_improve: "Larger size please!",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

class BackendService {
  private currentUser: UserProfile | null = {
    id: "student-stall-demo",
    name: "Sri Thean (Stall Host)",
    email: "srith@school.edu",
    grade: "Class 12-Tech",
    badge: "Stall Host & Food Creator 🏆",
    avatar: "🧑‍💻",
    createdAt: new Date().toISOString(),
  };

  private localReviews: AppReview[] = [...INITIAL_REVIEWS];
  private favoriteDishIds: Set<number> = new Set([101, 103, 105]);
  private registeredUsers: UserProfile[] = [];

  constructor() {
    this.registeredUsers.push(this.currentUser!);
  }

  // ==========================================
  // AUTH METHODS
  // ==========================================
  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  async login(email: string, password?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Supabase silently with 2s timeout
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase timeout")), 2000)
      );
      const supabasePromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password || "password123",
      });

      const { data, error }: any = await Promise.race([supabasePromise, timeoutPromise]);
      if (!error && data?.session?.user) {
        this.currentUser = {
          id: data.session.user.id,
          name: data.session.user.user_metadata?.name || cleanEmail.split("@")[0],
          email: cleanEmail,
          grade: "Student VIP",
          badge: "Verified Foodie ⭐",
          avatar: "🎓",
          createdAt: new Date().toISOString(),
        };
        return { success: true, user: this.currentUser };
      }
    } catch {
      // Supabase unavailable - seamlessly proceed to local auth
    }

    // 2. Offline / Local fallback authentication
    const existing = this.registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      this.currentUser = existing;
      return { success: true, user: existing };
    }

    // Auto-create local account for students at stall
    const newUser: UserProfile = {
      id: `student-${Date.now()}`,
      name: cleanEmail.split("@")[0].toUpperCase(),
      email: cleanEmail,
      grade: "Stall Visitor",
      badge: "School Stall VIP 🎟️",
      avatar: "🎒",
      createdAt: new Date().toISOString(),
    };
    this.registeredUsers.push(newUser);
    this.currentUser = newUser;
    return { success: true, user: newUser };
  }

  async signup(name: string, email: string, password?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 1. Try Supabase silently with 2s timeout
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase timeout")), 2000)
      );
      const supabasePromise = supabase.auth.signUp({
        email: cleanEmail,
        password: password || "password123",
        options: { data: { name: cleanName } },
      });

      const { data, error }: any = await Promise.race([supabasePromise, timeoutPromise]);
      if (!error && data?.user) {
        this.currentUser = {
          id: data.user.id,
          name: cleanName,
          email: cleanEmail,
          grade: "Class 11/12",
          badge: "New Food Explorer 🌟",
          avatar: "🎒",
          createdAt: new Date().toISOString(),
        };
        return { success: true, user: this.currentUser };
      }
    } catch {
      // Supabase offline - fallback to local registration
    }

    const newUser: UserProfile = {
      id: `student-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      grade: "Class 11/12",
      badge: "New Food Explorer 🌟",
      avatar: "🎒",
      createdAt: new Date().toISOString(),
    };
    this.registeredUsers.push(newUser);
    this.currentUser = newUser;
    return { success: true, user: newUser };
  }

  quickGuestLogin(studentName = "Stall Guest", grade = "Student"): UserProfile {
    this.currentUser = {
      id: `guest-${Date.now()}`,
      name: studentName,
      email: `${studentName.toLowerCase().replace(/\s+/g, "")}@stall.event`,
      grade: grade,
      badge: "Stall Challenger 🎮",
      avatar: "🧑‍🎓",
      createdAt: new Date().toISOString(),
    };
    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    try {
      supabase.auth.signOut().catch(() => {});
    } catch {}
  }

  // ==========================================
  // DISHES METHODS
  // ==========================================
  async getDishes(): Promise<MockDish[]> {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase timeout")), 2000)
      );
      const supabasePromise = supabase
        .from("dishes")
        .select("*")
        .order("id", { ascending: true });

      const { data, error }: any = await Promise.race([supabasePromise, timeoutPromise]);
      if (!error && data && data.length > 0) {
        return data.map((d: any) => {
          const ratingData = this.getDishRatingStats(d.id);
          return {
            ...d,
            averageRating: ratingData.averageRating || 4.8,
            reviewCount: ratingData.reviewCount || 12,
            spice_level: d.spice_level ?? 3,
            sweetness_level: d.sweetness_level ?? 2,
          };
        });
      }
    } catch {
      // Fallback
    }

    // Return rich mock catalog with dynamically updated ratings
    return MOCK_DISHES.map((dish) => {
      const ratingData = this.getDishRatingStats(dish.id);
      return {
        ...dish,
        averageRating: ratingData.reviewCount > 0 ? ratingData.averageRating : dish.averageRating,
        reviewCount: ratingData.reviewCount > 0 ? ratingData.reviewCount : dish.reviewCount,
      };
    });
  }

  getDishById(dishId: string | number): MockDish {
    const idNum = Number(dishId) || 101;
    const foundDish = MOCK_DISHES.find((d) => d.id === idNum);
    
    // Create fallback dish with the provided ID so review/dish pages never crash
    const dish: MockDish = foundDish || {
      id: idNum,
      name: `Special Dish #${idNum}`,
      restaurant_name: "Campus Food Stall",
      category: "Stall Special",
      description: "Freshly prepared campus delicacy packed with bold flavors.",
      image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
      price: "₹120",
      spice_level: 3,
      sweetness_level: 2,
      averageRating: 4.8,
      reviewCount: 5,
      tag: "Popular Choice 🌟",
    };

    const ratingData = this.getDishRatingStats(dish.id);
    return {
      ...dish,
      averageRating: ratingData.reviewCount > 0 ? ratingData.averageRating : dish.averageRating,
      reviewCount: ratingData.reviewCount > 0 ? ratingData.reviewCount : dish.reviewCount,
    };
  }

  async fetchDishById(dishId: string | number): Promise<MockDish> {
    const idNum = Number(dishId) || 101;
    const local = MOCK_DISHES.find((d) => d.id === idNum);
    if (local) {
      return this.getDishById(idNum);
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 2000)
      );
      const supabasePromise = supabase
        .from("dishes")
        .select("*")
        .eq("id", idNum)
        .maybeSingle();

      const { data, error }: any = await Promise.race([supabasePromise, timeoutPromise]);
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          restaurant_name: data.restaurant_name || "Campus Stall",
          category: data.category || "Popular",
          description: data.description || "",
          image_url: data.image_url || "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
          price: data.price || "₹120",
          spice_level: data.spice_level ?? 3,
          sweetness_level: data.sweetness_level ?? 2,
          averageRating: 4.8,
          reviewCount: 6,
          tag: "Stall Choice ✨",
        };
      }
    } catch {}

    return this.getDishById(dishId);
  }

  // ==========================================
  // REVIEWS METHODS
  // ==========================================
  getReviews(dishId?: string | number): AppReview[] {
    if (!dishId) return [...this.localReviews];
    const targetId = String(dishId);
    return this.localReviews.filter((r) => String(r.dish_id) === targetId);
  }

  async fetchReviewsForDish(dishId?: string | number): Promise<AppReview[]> {
    const local = this.getReviews(dishId);
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 2000)
      );
      let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (dishId) {
        query = query.eq("dish_id", Number(dishId));
      }
      const { data, error }: any = await Promise.race([query, timeoutPromise]);
      if (!error && data && data.length > 0) {
        const map = new Map<string | number, AppReview>();
        local.forEach((r) => map.set(r.id, r));
        data.forEach((r: any) => {
          if (!map.has(r.id)) {
            map.set(r.id, {
              id: r.id,
              dish_id: r.dish_id,
              user_id: r.user_id,
              user_name: r.user_name || "School Foodie",
              rating: r.rating ?? r.overall_rating,
              overall_rating: r.overall_rating ?? r.rating,
              spice_level: r.spice_level,
              salt_level: r.salt_level,
              sugar_level: r.sugar_level,
              sweetness_level: r.sweetness_level,
              review_text: r.review_text,
              what_was_best: r.what_was_best,
              what_to_improve: r.what_to_improve,
              created_at: r.created_at,
            });
          }
        });
        return Array.from(map.values());
      }
    } catch {}
    return local;
  }

  async addReview(review: Omit<AppReview, "id" | "created_at">): Promise<AppReview> {
    const newReview: AppReview = {
      ...review,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
      user_name: review.user_name || this.currentUser?.name || "Stall Visitor",
      user_id: review.user_id || this.currentUser?.id || "guest",
    };

    // Store in local reviews immediately
    this.localReviews.unshift(newReview);

    // Try sending to Supabase silently
    try {
      supabase
        .from("reviews")
        .insert([
          {
            dish_id: Number(newReview.dish_id),
            rating: newReview.rating ?? newReview.overall_rating,
            overall_rating: newReview.overall_rating ?? newReview.rating,
            spice_level: newReview.spice_level,
            salt_level: newReview.salt_level,
            sugar_level: newReview.sugar_level,
            sweetness_level: newReview.sweetness_level,
            review_text: newReview.review_text,
            what_was_best: newReview.what_was_best,
            what_to_improve: newReview.what_to_improve,
          },
        ])
        .then(() => {}, () => {});
    } catch {}

    return newReview;
  }

  getDishRatingStats(dishId: string | number): { averageRating: number; reviewCount: number } {
    const reviews = this.getReviews(dishId);
    if (reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    const ratings = reviews
      .map((r) => Number(r.overall_rating ?? r.rating ?? 0))
      .filter((r) => r > 0);

    if (ratings.length === 0) return { averageRating: 0, reviewCount: reviews.length };

    const sum = ratings.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round((sum / ratings.length) * 10) / 10;
    return { averageRating: avg, reviewCount: reviews.length };
  }

  // ==========================================
  // FAVORITES METHODS
  // ==========================================
  getFavoriteDishIds(): number[] {
    return Array.from(this.favoriteDishIds);
  }

  getFavoriteDishes(): MockDish[] {
    const ids = this.getFavoriteDishIds();
    return MOCK_DISHES.filter((d) => ids.includes(d.id));
  }

  isFavorite(dishId: string | number): boolean {
    return this.favoriteDishIds.has(Number(dishId));
  }

  toggleFavorite(dishId: string | number): boolean {
    const id = Number(dishId);
    if (this.favoriteDishIds.has(id)) {
      this.favoriteDishIds.delete(id);
      return false;
    } else {
      this.favoriteDishIds.add(id);
      return true;
    }
  }

  // ==========================================
  // SOCIAL FRIEND BUZZ
  // ==========================================
  getFriendVisits(): FriendVisit[] {
    return [...FRIEND_VISITS];
  }
}

export const backend = new BackendService();
