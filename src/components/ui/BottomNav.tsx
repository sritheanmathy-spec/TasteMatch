// src/components/ui/BottomNav.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { router, usePathname } from "expo-router";
import { COLORS, RADIUS, SPACING } from "../../lib/theme";

type NavTab = {
  name: string;
  label: string;
  icon: string;
  route: string;
};

const TABS: NavTab[] = [
  { name: "dashboard", label: "Feed", icon: "🏠", route: "/dashboard" },
  { name: "explore", label: "Explore", icon: "🔍", route: "/explore" },
  { name: "games", label: "Arcade", icon: "🎮", route: "/games" },
  { name: "food-match", label: "Match", icon: "⚡", route: "/food-match" },
  { name: "profile", label: "Profile", icon: "👤", route: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  function handlePress(route: string) {
    if (pathname !== route) {
      router.push(route as any);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {TABS.map((tab) => {
          const isActive =
            pathname === tab.route ||
            (tab.route === "/dashboard" && pathname === "/") ||
            pathname.startsWith(tab.route);

          return (
            <Pressable
              key={tab.name}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => handlePress(tab.route)}
            >
              <Text style={[styles.icon, isActive && styles.activeIcon]}>
                {tab.icon}
              </Text>
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingBottom: Platform.OS === "ios" ? 22 : SPACING.sm,
    paddingTop: SPACING.xs,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  navBar: {
    flexDirection: "row",
    backgroundColor: "rgba(20, 20, 24, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(245, 185, 66, 0.25)",
    borderRadius: RADIUS.round,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    position: "relative",
  },
  activeTabButton: {
    backgroundColor: "rgba(245, 185, 66, 0.12)",
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  activeIcon: {
    transform: [{ scale: 1.15 }],
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  activeLabel: {
    color: COLORS.accent,
    fontWeight: "800",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginTop: 2,
  },
});
