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

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your name.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await backend.signup(name.trim(), email.trim(), password);
      if (res.success) {
        Alert.alert("Account Created! 🎉", `Welcome to TasteMatch, ${res.user?.name}!`, [
          { text: "Get Started", onPress: () => router.replace("/dashboard") },
        ]);
      } else {
        Alert.alert("Signup Notice", res.error || "Could not register account.");
      }
    } catch {
      backend.quickGuestLogin(name.trim() || "Student");
      router.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    backend.quickGuestLogin("Stall Guest", "Student Visitor");
    Alert.alert("Stall Guest Access", "Logged in as Stall Guest!", [
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>🍽️</Text>
          <Text style={styles.title}>Join TasteMatch</Text>
          <Text style={styles.subtitle}>
            Create your foodie profile and rate dishes around school
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor={COLORS.textDim}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="rahul@school.edu"
            placeholderTextColor={COLORS.textDim}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textDim}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.signupButton, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              {loading ? "CREATING PROFILE..." : "CREATE ACCOUNT"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestLogin}
          >
            <Text style={styles.guestButtonText}>⚡ SKIP & ENTER AS STALL GUEST</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already registered?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
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
  signupButton: {
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
  signupButtonText: {
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.xl,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  loginLink: {
    color: COLORS.accent,
    fontWeight: "800",
    fontSize: 13,
    marginLeft: 6,
  },
});