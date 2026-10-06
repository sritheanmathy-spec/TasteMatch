import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
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


type Dish = {
  id: string | number;
  name?: string | null;
  restaurant_name?: string | null;
  category?: string | null;
  description?: string | null;
  image_url?: string | null;
};

const categories = [
  "All",
  "Indian",
  "South Indian",
  "Chinese",
  "Italian",
  "Biryani",
  "Pizza",
  "Burgers",
  "Desserts",
  "Beverages",
];

export default function ExploreScreen() {
  const [dishes, setDishes] =
    useState<Dish[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  useEffect(() => {
    loadDishes();
  }, []);

  async function loadDishes() {
    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("dishes")
        .select(
          "id, name, restaurant_name, category, description, image_url"
        )
        .order("id", {
          ascending: true,
        });

      if (error) {
        console.log(
          "Explore dishes error:",
          error.message
        );

        setDishes([]);
        return;
      }

      setDishes(
        (data as Dish[]) || []
      );
    } catch (error) {
      console.log(
        "Unexpected error:",
        error
      );

      setDishes([]);
    } finally {
      setLoading(false);
    }
  }

  async function refreshDishes() {
    setRefreshing(true);

    await loadDishes();

    setRefreshing(false);
  }

  const filteredDishes =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return dishes.filter(
        (dish) => {
          const matchesSearch =
            searchText.length === 0 ||
            (dish.name || "")
              .toLowerCase()
              .includes(
                searchText
              ) ||
            (dish.restaurant_name ||
              "")
              .toLowerCase()
              .includes(
                searchText
              ) ||
            (dish.description ||
              "")
              .toLowerCase()
              .includes(
                searchText
              ) ||
            (dish.category || "")
              .toLowerCase()
              .includes(
                searchText
              );

          const matchesCategory =
            selectedCategory ===
              "All" ||
            (dish.category ||
              "")
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
      dishes,
      search,
      selectedCategory,
    ]);

  const categoriesAvailable =
    useMemo(() => {
      return categories.filter(
        (category) => {
          if (
            category === "All"
          ) {
            return true;
          }

          return dishes.some(
            (dish) =>
              (dish.category ||
                "")
                .toLowerCase()
                .includes(
                  category.toLowerCase()
                )
          );
        }
      );
    }, [dishes]);

  const topDishes =
    useMemo(() => {
      return dishes.slice(
        0,
        5
      );
    }, [dishes]);

  function openDish(
    dish: Dish
  ) {
    router.push({
      pathname:
        "/restaurant",
      params: {
        id: String(
          dish.id
        ),
      },
    });
  }

  function getInitials(
    name?: string | null
  ) {
    if (!name) {
      return "F";
    }

    return name
      .split(" ")
      .map(
        (word) =>
          word[0]
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function renderTopDish({
    item,
    index,
  }: {
    item: Dish;
    index: number;
  }) {
    return (
      <Pressable
        style={styles.topCard}
        onPress={() =>
          openDish(item)
        }
      >
        <View
          style={
            styles.topImageContainer
          }
        >
          {item.image_url ? (
            <Image
              source={{
                uri: item.image_url,
              }}
              style={
                styles.topImage
              }
              resizeMode="cover"
            />
          ) : (
            <View
              style={
                styles.placeholder
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
              styles.rankBadge
            }
          >
            <Text
              style={
                styles.rankText
              }
            >
              #{index + 1}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.topContent
          }
        >
          <Text
            style={
              styles.cardCategory
            }
          >
            {(
              item.category ||
              "FOOD"
            ).toUpperCase()}
          </Text>

          <Text
            style={
              styles.topName
            }
            numberOfLines={1}
          >
            {item.name ||
              "Unnamed Dish"}
          </Text>

          <Text
            style={
              styles.cardRestaurant
            }
            numberOfLines={1}
          >
            {item.restaurant_name ||
              "Restaurant"}
          </Text>
        </View>
      </Pressable>
    );
  }

  function renderDish({
    item,
  }: {
    item: Dish;
  }) {
    return (
      <Pressable
        style={
          styles.dishCard
        }
        onPress={() =>
          openDish(item)
        }
      >
        <View
          style={
            styles.dishImageContainer
          }
        >
          {item.image_url ? (
            <Image
              source={{
                uri: item.image_url,
              }}
              style={
                styles.dishImage
              }
              resizeMode="cover"
            />
          ) : (
            <View
              style={
                styles.placeholder
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

          {item.category ? (
            <View
              style={
                styles.categoryBadge
              }
            >
              <Text
                style={
                  styles.categoryBadgeText
                }
              >
                {item.category.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>

        <View
          style={
            styles.dishContent
          }
        >
          <View
            style={
              styles.dishTitleRow
            }
          >
            <View
              style={
                styles.dishTitleArea
              }
            >
              <Text
                style={
                  styles.dishName
                }
                numberOfLines={1}
              >
                {item.name ||
                  "Unnamed Dish"}
              </Text>

              <Text
                style={
                  styles.restaurantName
                }
                numberOfLines={1}
              >
                {item.restaurant_name ||
                  "Restaurant"}
              </Text>
            </View>

            <View
              style={
                styles.arrowBox
              }
            >
              <Text
                style={
                  styles.arrowText
                }
              >
                →
              </Text>
            </View>
          </View>

          {item.description ? (
            <Text
              style={
                styles.description
              }
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  }

  return (
    <View
      style={styles.container}
    >
      <FlatList
        data={
          filteredDishes
        }
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={
          renderDish
        }
        showsVerticalScrollIndicator={
          false
        }
        numColumns={1}
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              refreshDishes
            }
            tintColor={
              COLORS.accent
            }
          />
        }
        ListHeaderComponent={
          <View>
            {/* HEADER */}

            <View
              style={
                styles.header
              }
            >
              <View
                style={
                  styles.headerText
                }
              >
                <Text
                  style={
                    styles.eyebrow
                  }
                >
                  FOOD DISCOVERY
                </Text>

                <Text
                  style={
                    styles.title
                  }
                >
                  Explore
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Find something worth
                  tasting.
                </Text>
              </View>

              <Pressable
                style={
                  styles.profileButton
                }
                onPress={() =>
                  router.push(
                    "/profile"
                  )
                }
              >
                <Text
                  style={
                    styles.profileText
                  }
                >
                  F
                </Text>
              </Pressable>
            </View>

            {/* SEARCH */}

            <View
              style={
                styles.searchContainer
              }
            >
              <Text
                style={
                  styles.searchIcon
                }
              >
                /
              </Text>

              <TextInput
                value={search}
                onChangeText={
                  setSearch
                }
                placeholder="Search dishes, restaurants..."
                placeholderTextColor={
                  COLORS.textDim
                }
                style={
                  styles.searchInput
                }
                autoCapitalize="none"
                autoCorrect={
                  false
                }
              />

              {search.length >
              0 ? (
                <Pressable
                  onPress={() =>
                    setSearch(
                      ""
                    )
                  }
                >
                  <Text
                    style={
                      styles.clearText
                    }
                  >
                    ×
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* CATEGORIES */}

            <View
              style={
                styles.categorySection
              }
            >
              <Text
                style={
                  styles.sectionLabel
                }
              >
                CATEGORIES
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.categoryList
                }
              >
                {categoriesAvailable.map(
                  (category) => {
                    const active =
                      selectedCategory ===
                      category;

                    return (
                      <Pressable
                        key={
                          category
                        }
                        style={[
                          styles.categoryChip,
                          active &&
                            styles.categoryChipActive,
                        ]}
                        onPress={() =>
                          setSelectedCategory(
                            category
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            active &&
                              styles.categoryTextActive,
                          ]}
                        >
                          {
                            category
                          }
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </ScrollView>
            </View>

            {/* FEATURED */}

            {!search &&
            selectedCategory ===
              "All" &&
            topDishes.length >
              0 ? (
              <View
                style={
                  styles.featuredSection
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
                      FEATURED
                    </Text>

                    <Text
                      style={
                        styles.sectionSubtitle
                      }
                    >
                      Start with these dishes
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.sectionAccent
                    }
                  >
                    DISCOVER
                  </Text>
                </View>

                <FlatList
                  data={
                    topDishes
                  }
                  horizontal
                  showsHorizontalScrollIndicator={
                    false
                  }
                  keyExtractor={(
                    item,
                    index
                  ) =>
                    `featured-${String(
                      item.id
                    )}-${index}`
                  }
                  renderItem={
                    renderTopDish
                  }
                  contentContainerStyle={
                    styles.featuredList
                  }
                />
              </View>
            ) : null}

            {/* RESULT HEADER */}

            <View
              style={
                styles.resultHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionLabel
                  }
                >
                  {search ||
                  selectedCategory !==
                    "All"
                    ? "RESULTS"
                    : "ALL DISHES"}
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  {filteredDishes.length}{" "}
                  dish
                  {filteredDishes.length !==
                  1
                    ? "es"
                    : ""}
                </Text>
              </View>

              {search ||
              selectedCategory !==
                "All" ? (
                <Pressable
                  onPress={() => {
                    setSearch(
                      ""
                    );
                    setSelectedCategory(
                      "All"
                    );
                  }}
                >
                  <Text
                    style={
                      styles.clearFilters
                    }
                  >
                    CLEAR
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyState
            }
          >
            {loading ? (
              <>
                <ActivityIndicator
                  size="large"
                  color={
                    COLORS.accent
                  }
                />

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  Loading dishes
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  Getting the latest food
                  from the community.
                </Text>
              </>
            ) : (
              <>
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <Text
                    style={
                      styles.emptyIconText
                    }
                  >
                    F
                  </Text>
                </View>

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No dishes found
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  Try another search or
                  category.
                </Text>

                <Pressable
                  style={
                    styles.resetButton
                  }
                  onPress={() => {
                    setSearch(
                      ""
                    );
                    setSelectedCategory(
                      "All"
                    );
                  }}
                >
                  <Text
                    style={
                      styles.resetButtonText
                    }
                  >
                    VIEW ALL DISHES
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        }
        ListFooterComponent={
          <View
            style={
              styles.footer
            }
          >
            <Text
              style={
                styles.footerBrand
              }
            >
              FOOD REVIEW
            </Text>

            <Text
              style={
                styles.footerText
              }
            >
              Discover better food.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  /* HEADER */

  header: {
    paddingHorizontal:
      SPACING.xxl,
    paddingTop: 60,
    paddingBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
  },

  title: {
    color: COLORS.white,
    ...TYPOGRAPHY.display,
    marginTop: 4,
  },

  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4,
  },

  profileButton: {
    width: 46,
    height: 46,
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

  profileText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },

  /* SEARCH */

  searchContainer: {
    marginHorizontal:
      SPACING.xxl,
    height: 54,
    borderRadius:
      RADIUS.lg,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal:
      SPACING.lg,
  },

  searchIcon: {
    color: COLORS.accent,
    fontSize: 20,
    fontWeight: "800",
    transform: [
      {
        rotate: "-45deg",
      },
    ],
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "500",
  },

  clearText: {
    color: COLORS.textSecondary,
    fontSize: 25,
    paddingLeft: 8,
  },

  /* CATEGORIES */

  categorySection: {
    marginTop: 28,
  },

  sectionLabel: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },

  categoryList: {
    paddingHorizontal:
      SPACING.xxl,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },

  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  categoryChipActive: {
    backgroundColor:
      COLORS.accent,
    borderColor:
      COLORS.accent,
  },

  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },

  categoryTextActive: {
    color: COLORS.background,
    fontWeight: "900",
  },

  /* FEATURED */

  featuredSection: {
    marginTop: 30,
  },

  sectionHeader: {
    paddingHorizontal:
      SPACING.xxl,
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "flex-end",
  },

  sectionAccent: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  featuredList: {
    paddingHorizontal:
      SPACING.xxl,
    paddingTop: 14,
    gap: 12,
  },

  topCard: {
    width: 190,
    backgroundColor:
      COLORS.surface,
    borderRadius:
      RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  topImageContainer: {
    height: 125,
    position: "relative",
    backgroundColor:
      COLORS.surfaceLight,
  },

  topImage: {
    width: "100%",
    height: "100%",
  },

  rankBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      "rgba(9,9,11,0.85)",
  },

  rankText: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: "900",
  },

  topContent: {
    padding: 14,
  },

  cardCategory: {
    color: COLORS.accent,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  topName: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 5,
  },

  cardRestaurant: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },

  /* RESULTS */

  resultHeader: {
    paddingHorizontal:
      SPACING.xxl,
    marginTop: 32,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent:
      "space-between",
  },

  clearFilters: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  /* DISH CARD */

  dishCard: {
    marginHorizontal:
      SPACING.xxl,
    marginBottom: 12,
    backgroundColor:
      COLORS.surface,
    borderRadius:
      RADIUS.xl,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    overflow: "hidden",
  },

  dishImageContainer: {
    width: "100%",
    height: 190,
    backgroundColor:
      COLORS.surfaceLight,
    position: "relative",
  },

  dishImage: {
    width: "100%",
    height: "100%",
  },

  categoryBadge: {
    position: "absolute",
    left: 13,
    bottom: 13,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      "rgba(9,9,11,0.88)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.12)",
  },

  categoryBadgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  dishContent: {
    padding: SPACING.lg,
  },

  dishTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  dishTitleArea: {
    flex: 1,
  },

  dishName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
  },

  restaurantName: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  arrowBox: {
    width: 34,
    height: 34,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  arrowText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "800",
  },

  description: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },

  /* PLACEHOLDER */

  placeholder: {
    flex: 1,
    backgroundColor:
      COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },

  /* EMPTY */

  emptyState: {
    marginHorizontal:
      SPACING.xxl,
    marginTop: 30,
    padding: 30,
    borderRadius:
      RADIUS.xl,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: "center",
  },

  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius:
      RADIUS.round,
    backgroundColor:
      COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyIconText: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: "900",
  },

  emptyTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 8,
  },

  emptyText: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 5,
  },

  resetButton: {
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius:
      RADIUS.md,
    backgroundColor:
      COLORS.accent,
  },

  resetButtonText: {
    color: COLORS.background,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  /* FOOTER */

  footer: {
    alignItems: "center",
    paddingTop: 35,
    paddingBottom: 45,
  },

  footerBrand: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },

  footerText: {
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 5,
  },
});