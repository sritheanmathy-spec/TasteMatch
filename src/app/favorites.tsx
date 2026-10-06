import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../lib/supabase";

type FavoriteDish = {
  id: number;
  name: string;
  restaurant_name: string;
  category: string;
  description: string;
  image_url: string | null;
};

export default function FavoritesScreen() {
  const [dishes, setDishes] = useState<FavoriteDish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          dish_id,
          dishes (
            id,
            name,
            restaurant_name,
            category,
            description,
            image_url
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.log("Favorites error:", error);
        return;
      }

      const favoriteDishes = (data || [])
        .map((item: any) => item.dishes)
        .filter(Boolean);

      setDishes(favoriteDishes);
    } catch (error) {
      console.log("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDish = (dishId: number) => {
    router.push({
      pathname: "/restaurant",
      params: { id: String(dishId) },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>My Favorites</Text>
          <Text style={styles.subtitle}>
            {dishes.length} saved dish{dishes.length !== 1 ? "es" : ""}
          </Text>
        </View>
      </View>

      {/* EMPTY STATE */}
      {dishes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyHeart}>♡</Text>

          <Text style={styles.emptyTitle}>
            No favorites yet
          </Text>

          <Text style={styles.emptyText}>
            Save dishes you love and they will appear here.
          </Text>

          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push("/explore")}
          >
            <Text style={styles.exploreButtonText}>
              Explore Dishes
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => openDish(item.id)}
            >
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>
                    🍽
                  </Text>
                </View>
              )}

              <View style={styles.cardContent}>
                <Text style={styles.category}>
                  {item.category || "FOOD"}
                </Text>

                <Text style={styles.dishName}>
                  {item.name}
                </Text>

                <Text style={styles.restaurant}>
                  {item.restaurant_name}
                </Text>

                <Text
                  style={styles.description}
                  numberOfLines={2}
                >
                  {item.description || "No description available."}
                </Text>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => openDish(item.id)}
                >
                  <Text style={styles.viewButtonText}>
                    View Dish →
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B0B0F",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#999",
    marginTop: 12,
    fontSize: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#17171D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 32,
    marginTop: -4,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    color: "#777",
    marginTop: 3,
    fontSize: 13,
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#15151B",
    borderRadius: 20,
    marginBottom: 18,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 190,
  },

  imagePlaceholder: {
    width: "100%",
    height: 190,
    backgroundColor: "#202027",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    fontSize: 50,
  },

  cardContent: {
    padding: 18,
  },

  category: {
    color: "#888",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },

  dishName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  restaurant: {
    color: "#B5B5BD",
    fontSize: 14,
    marginTop: 5,
  },

  description: {
    color: "#777",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },

  viewButton: {
    marginTop: 15,
    backgroundColor: "#24242C",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 80,
  },

  emptyHeart: {
    color: "#555",
    fontSize: 80,
    marginBottom: 15,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  emptyText: {
    color: "#777",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 25,
  },

  exploreButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 14,
  },

  exploreButtonText: {
    color: "#0B0B0F",
    fontWeight: "800",
    fontSize: 14,
  },
});