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

import { supabase } from "../lib/supabase";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing information", "Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
        return;
      }

      if (!data.session) {
        Alert.alert(
          "Login Failed",
          "No session was created. Please check your email confirmation."
        );
        return;
      }

      // Login successful
      Alert.alert("Success", "You have logged in successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/dashboard");
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        "Something went wrong while logging in."
      );
    } finally {
      setLoading(false);
    }
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🍽️</Text>

          <Text style={styles.title}>Welcome Back</Text>

          <Text style={styles.subtitle}>
            Login to continue your FoodReview journey
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "LOGGING IN..." : "LOGIN"}
            </Text>
          </TouchableOpacity>

          {/* Signup */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/signup")}
            >
              <Text style={styles.signupLink}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Text style={styles.feature}>⭐ Rate your food</Text>
          <Text style={styles.feature}>🍕 Discover dishes</Text>
          <Text style={styles.feature}>💬 Share reviews</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F3EA",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    fontSize: 55,
    marginBottom: 10,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#241F1A",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 24,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 5,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#FAFAFA",
    marginBottom: 10,
  },

  loginButton: {
    height: 54,
    backgroundColor: "#1F1F1F",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  signupText: {
    color: "#777",
    fontSize: 14,
  },

  signupLink: {
    color: "#8B6B3E",
    fontWeight: "700",
    marginLeft: 5,
    fontSize: 14,
  },

  features: {
    alignItems: "center",
    marginTop: 30,
    gap: 8,
  },

  feature: {
    color: "#777",
    fontSize: 14,
  },
});