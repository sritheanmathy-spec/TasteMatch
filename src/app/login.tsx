import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { backend } from "../lib/backend";
import { COLORS, RADIUS, SPACING } from "../lib/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await backend.login(email.trim(), password);
      if (res.success) {
        Alert.alert("Welcome Back!", `Logged in as ${res.user?.name}`, [
          { text: "Continue", onPress: () => router.replace("/dashboard") },
        ]);
      } else {
        Alert.alert("Login Notice", res.error || "Could not log in.");
      }
    } catch {
      // Fallback
      backend.quickGuestLogin(email.split("@")[0] || "Student");
      router.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    backend.quickGuestLogin("Stall Guest", "Student Visitor");
    Alert.alert("Stall Guest Access", "Logged in as Stall Guest! Enjoy exploring dishes and games.", [
      { text: "Enter App", onPress: () => router.replace("/dashboard") },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🍽️</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to rate dishes, track favorites & play stall games
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="student@school.edu"
            placeholderTextColor={COLORS.textDim}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textDim}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "SIGNING IN..." : "LOGIN"}
            </Text>
          </TouchableOpacity>

          {/* Quick Guest / Stall Access */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestLogin}
          >
            <Text style={styles.guestButtonText}>⚡ 1-TAP STALL GUEST ACCESS</Text>
          </TouchableOpacity>

          {/* Signup link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Text style={styles.feature}>⭐ Honest dish ratings</Text>
          <Text style={styles.feature}>🎮 Stall Mindset Arcade</Text>
          <Text style={styles.feature}>👥 Classmate endorsements</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.xl,
    paddingTop: 50,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 280,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    color: COLORS.white,
    fontSize: 15,
    marginBottom: SPACING.lg,
  },
  loginButton: {
    height: 52,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#18181B",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  guestButton: {
    height: 48,
    backgroundColor: "rgba(245, 185, 66, 0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(245, 185, 66, 0.4)",
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.md,
  },
  guestButtonText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.xl,
  },
  signupText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  signupLink: {
    color: COLORS.accent,
    fontWeight: "800",
    fontSize: 13,
    marginLeft: 6,
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: SPACING.xxl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  feature: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
});