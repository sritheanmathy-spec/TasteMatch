import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { COLORS, RADIUS, SPACING } from "../lib/theme";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* BADGE */}
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>✨ WELCOME TO OUR STALL ✨</Text>
      </View>

      {/* HERO ICON */}
      <Text style={styles.logo}>🍽️</Text>

      {/* APP TITLE */}
      <Text style={styles.title}>TasteMatch</Text>

      <Text style={styles.subtitle}>
        Discover food, test your mindset, and play our interactive stall games!
      </Text>

      {/* HIGHLIGHT STALL GAME BUTTON */}
      <Pressable
        style={styles.gameButton}
        onPress={() => router.push("/games" as any)}
      >
        <Text style={styles.gameButtonIcon}>🎮</Text>
        <View style={styles.gameButtonTextWrapper}>
          <Text style={styles.gameButtonTitle}>PLAY STALL GAMES</Text>
          <Text style={styles.gameButtonSubtitle}>Mindset Scanner • Wheel of Cravings • Food Clash</Text>
        </View>
        <Text style={styles.gameButtonArrow}>→</Text>
      </Pressable>

      {/* DIRECT FEED BUTTON */}
      <Pressable
        style={styles.exploreButton}
        onPress={() => router.push("/dashboard" as any)}
      >
        <Text style={styles.exploreButtonText}>EXPLORE FOOD FEED</Text>
        <Text style={styles.exploreButtonArrow}>→</Text>
      </Pressable>

      {/* QUICK AUTH BUTTONS */}
      <View style={styles.authRow}>
        <Pressable
          style={styles.loginButton}
          onPress={() => router.push("/login" as any)}
        >
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </Pressable>

        <Pressable
          style={styles.signupButton}
          onPress={() => router.push("/signup" as any)}
        >
          <Text style={styles.signupButtonText}>SIGN UP</Text>
        </Pressable>
      </View>

      {/* STALL ATTRACTION INFO BOX */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🎪 Stall Special Event</Text>
        <Text style={styles.infoText}>
          Take the 60-second Mindset Scanner to unlock your Food Persona badge and challenge your friends in the stall queue!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: 50,
  },
  badgeContainer: {
    alignSelf: "center",
    backgroundColor: "rgba(245, 185, 66, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 185, 66, 0.4)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.md,
  },
  badgeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  logo: {
    fontSize: 68,
    textAlign: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    color: COLORS.white,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
    maxWidth: 320,
    alignSelf: "center",
  },
  gameButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.xl,
    paddingVertical: 18,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  gameButtonIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  gameButtonTextWrapper: {
    flex: 1,
  },
  gameButtonTitle: {
    color: "#141417",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  gameButtonSubtitle: {
    color: "#3F3F46",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  gameButtonArrow: {
    color: "#141417",
    fontSize: 22,
    fontWeight: "900",
    marginLeft: SPACING.sm,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  exploreButtonArrow: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 8,
  },
  authRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  loginButton: {
    flex: 1,
    height: 46,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  signupButton: {
    flex: 1,
    height: 46,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  signupButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
  infoBox: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "rgba(245, 185, 66, 0.2)",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.accent,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
});