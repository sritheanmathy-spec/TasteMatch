import React from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      {/* Logo */}
      <Text style={styles.logo}>🍽️</Text>

      {/* App Name */}
      <Text style={styles.title}>
        FoodReview
      </Text>

      <Text style={styles.subtitle}>
        Discover great food.{'\n'}
        Share your honest reviews.
      </Text>

      {/* LOGIN BUTTON */}
      <Pressable
        style={styles.loginButton}
        onPress={() => router.push('/login' as any)}
      >
        <Text style={styles.loginButtonText}>
          LOGIN
        </Text>
      </Pressable>

      {/* SIGN UP BUTTON */}
      <Pressable
        style={styles.signupButton}
        onPress={() => router.push('/signup' as any)}
      >
        <Text style={styles.signupButtonText}>
          CREATE ACCOUNT
        </Text>
      </Pressable>

      {/* REVIEWS BUTTON */}
      <Pressable
        style={styles.reviewsButton}
        onPress={() => router.push('/reviews' as any)}
      >
        <Text style={styles.reviewsButtonText}>
          BROWSE REVIEWS
        </Text>
      </Pressable>

      {/* INFORMATION BOX */}
      <View style={styles.infoBox}>

        <Text style={styles.infoTitle}>
          🍴 What is FoodReview?
        </Text>

        <Text style={styles.infoText}>
          Find dishes, read reviews and share
          your experience with restaurants.
        </Text>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 50,
  },

  logo: {
    fontSize: 70,
    textAlign: 'center',
    marginBottom: 10,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    color: '#222',
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 35,
  },

  loginButton: {
    height: 54,
    backgroundColor: '#222',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  signupButton: {
    height: 54,
    backgroundColor: '#E7A928',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  signupButtonText: {
    color: '#222',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  reviewsButton: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },

  reviewsButtonText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '700',
  },

  infoBox: {
    marginTop: 35,
    padding: 18,
    backgroundColor: '#FFF1D0',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFE0A0',
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#8A5700',
    marginBottom: 7,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#8A6A32',
  },

});