// src/app/favorites.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { backend } from "../lib/backend";
import { MockDish } from "../lib/mockData";
import { COLORS, RADIUS, SPACING } from "../lib/theme";
import BottomNav from "../components/ui/BottomNav";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<MockDish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setLoading(true);
    const list = backend.getFavoriteDishes();
    setFavorites(list);
    setLoading(false);
  };

  const removeFavorite = (dishId: number) => {
    backend.toggleFavorite(dishId);
    setFavorites(backend.getFavoriteDishes());
  };

  const renderFavoriteItem = ({ item }: { item: MockDish }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/restaurant",
          params: { id: String(item.id) },
        })
      }
    >
      <Image source={{ uri: item.image_url }} style={styles.dishImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.category}>{item.category.toUpperCase()}</Text>
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => removeFavorite(item.id)}
          >
            <Text style={styles.heartIcon}>❤️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.dishName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.restaurantName} numberOfLines={1}>
          📍 {item.restaurant_name}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.ratingText}>⭐ {item.averageRating} ({item.reviewCount})</Text>
          {item.price ? <Text style={styles.priceText}>{item.price}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerBadge}>⭐ SAVED COLLECTION</Text>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>
          Dishes you have bookmarked for your next food run
        </Text>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading saved dishes...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyTitle}>NO SAVED DISHES YET</Text>
          <Text style={styles.emptySubtitle}>
            Browse dishes in Feed or Explore, and tap the heart to save them here!
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push("/explore")}
          >
            <Text style={styles.exploreButtonText}>EXPLORE DISHES →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FLOATING BOTTOM NAV */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.backgroundSoft,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  headerBadge: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  listContainer: {
    padding: SPACING.xl,
    paddingBottom: 100,
    gap: SPACING.md,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
  },
  dishImage: {
    width: 110,
    height: 110,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heartButton: {
    padding: 2,
  },
  heartIcon: {
    fontSize: 16,
  },
  dishName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },
  restaurantName: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  priceText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: "800",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: SPACING.xl,
    maxWidth: 280,
  },
  exploreButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.round,
  },
  exploreButtonText: {
    color: "#18181B",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});