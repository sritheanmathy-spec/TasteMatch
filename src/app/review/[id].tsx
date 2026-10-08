import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from "expo-router";
import { backend } from "../../lib/backend";

export default function ReviewScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams();
  const dishId = Number(Array.isArray(id) ? id[0] : id) || 101;
  const dish = backend.getDishById(dishId);

  const [overallRating, setOverallRating] = useState(5);
  const [spiceLevel, setSpiceLevel] = useState(3);
  const [saltLevel, setSaltLevel] = useState(3);
  const [sweetnessLevel, setSweetnessLevel] = useState(2);

  const [bestPart, setBestPart] = useState("");
  const [improvement, setImprovement] = useState("");

  const submitReview = async () => {
    if (overallRating === 0) {
      Alert.alert(
        "Rating required",
        "Please give an overall rating."
      );
      return;
    }

    let currentUser = backend.getCurrentUser();
    if (!currentUser) {
      currentUser = backend.quickGuestLogin("Stall Guest", "VIP");
    }

    await backend.addReview({
      dish_id: dishId,
      user_id: currentUser.id,
      user_name: currentUser.name,
      overall_rating: overallRating,
      rating: overallRating,
      spice_level: spiceLevel,
      salt_level: saltLevel,
      sugar_level: sweetnessLevel,
      sweetness_level: sweetnessLevel,
      review_text: `${bestPart} ${improvement}`.trim() || "Delicious dish!",
      what_was_best: bestPart.trim() || "Taste and aroma",
      what_to_improve: improvement.trim() || "None",
    });

    Alert.alert(
      "Review submitted! ⭐",
      `Thank you for reviewing ${dish.name}.\nDish rating updated!`,
      [
        {
          text: "View Dish",
          onPress: () => router.replace({ pathname: "/restaurant", params: { id: String(dishId) } }),
        },
        {
          text: "Dashboard",
          onPress: () => router.replace("/dashboard"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Review Dish
          </Text>

          <View style={{ width: 42 }} />
        </View>

        {/* DISH */}

        <View style={styles.dishCard}>
          <View style={styles.foodImage}>
            <Text style={styles.foodEmoji}>🍛</Text>
          </View>

          <View>
            <Text style={styles.dishName}>
              {dish.name}
            </Text>

            <Text style={styles.restaurant}>
              {dish.restaurant_name}
            </Text>
          </View>
        </View>

        {/* OVERALL RATING */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            How was your experience?
          </Text>

          <Text style={styles.sectionSubtitle}>
            Give this dish an overall rating
          </Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setOverallRating(star)}
              >
                <Text
                  style={[
                    styles.star,
                    star <= overallRating &&
                      styles.selectedStar,
                  ]}
                >
                  ★
                </Text>
              </Pressable>
            ))}
          </View>

          {overallRating > 0 && (
            <Text style={styles.ratingText}>
              {overallRating}/5
            </Text>
          )}
        </View>

        {/* SPICE */}

        <RatingSelector
          title="🌶️ Spice Level"
          value={spiceLevel}
          setValue={setSpiceLevel}
        />

        {/* SALT */}

        <RatingSelector
          title="🧂 Salt Level"
          value={saltLevel}
          setValue={setSaltLevel}
        />

        {/* SWEETNESS */}

        <RatingSelector
          title="🍬 Sweetness Level"
          value={sweetnessLevel}
          setValue={setSweetnessLevel}
        />

        {/* BEST PART */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            👍 What was best?
          </Text>

          <TextInput
            style={styles.textArea}
            placeholder="Tell us what you liked..."
            placeholderTextColor="#999"
            value={bestPart}
            onChangeText={setBestPart}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* IMPROVEMENT */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🔧 What can be improved?
          </Text>

          <TextInput
            style={styles.textArea}
            placeholder="Tell us what could be better..."
            placeholderTextColor="#999"
            value={improvement}
            onChangeText={setImprovement}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* SUBMIT */}

        <Pressable
          style={styles.submitButton}
          onPress={submitReview}
        >
          <Text style={styles.submitText}>
            Submit Review
          </Text>
        </Pressable>

        <View style={{ height: 40 }} />

      </ScrollView>
    </SafeAreaView>
  );
}


/* -------------------------------- */
/* RATING COMPONENT */
/* -------------------------------- */

function RatingSelector({
  title,
  value,
  setValue,
}: {
  title: string;
  value: number;
  setValue: (value: number) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.numberContainer}>
        {[1, 2, 3, 4, 5].map((number) => (
          <Pressable
            key={number}
            onPress={() => setValue(number)}
            style={[
              styles.numberButton,
              number === value &&
                styles.numberButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.numberText,
                number === value &&
                  styles.numberTextSelected,
              ]}
            >
              {number}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.levelLabels}>
        <Text style={styles.levelLabel}>
          Low
        </Text>

        <Text style={styles.levelLabel}>
          High
        </Text>
      </View>
    </View>
  );
}


/* -------------------------------- */
/* STYLES */
/* -------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F8F6",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  /* HEADER */

  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    fontSize: 35,
    color: "#222",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  /* DISH */

  dishCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  foodImage: {
    width: 75,
    height: 75,
    borderRadius: 15,
    backgroundColor: "#F1E8DC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  foodEmoji: {
    fontSize: 40,
  },

  dishName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 5,
  },

  restaurant: {
    fontSize: 14,
    color: "#888",
  },

  /* SECTIONS */

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 5,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 15,
  },

  /* STARS */

  starsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },

  star: {
    fontSize: 40,
    color: "#D9D9D9",
  },

  selectedStar: {
    color: "#F4A261",
  },

  ratingText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },

  /* NUMBER RATINGS */

  numberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  numberButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    justifyContent: "center",
    alignItems: "center",
  },

  numberButtonSelected: {
    backgroundColor: "#222",
    borderColor: "#222",
  },

  numberText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },

  numberTextSelected: {
    color: "#FFFFFF",
  },

  levelLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
  },

  levelLabel: {
    fontSize: 11,
    color: "#999",
  },

  /* TEXT INPUT */

  textArea: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 15,
    height: 110,
    padding: 15,
    marginTop: 10,
    fontSize: 14,
    color: "#222",
  },

  /* SUBMIT */

  submitButton: {
    backgroundColor: "#222",
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});