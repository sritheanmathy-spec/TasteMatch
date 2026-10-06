import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import { router } from 'expo-router';

import { supabase } from '../lib/supabase';


export default function SignupScreen() {

  const [name, setName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);


  // =====================================================
  // SIGN UP FUNCTION
  // =====================================================

  async function signup() {

    // Check name
    if (!name.trim()) {

      Alert.alert(
        'Missing Name',
        'Please enter your name.'
      );

      return;
    }


    // Check email
    if (!email.trim()) {

      Alert.alert(
        'Missing Email',
        'Please enter your email address.'
      );

      return;
    }


    // Check password
    if (!password) {

      Alert.alert(
        'Missing Password',
        'Please enter a password.'
      );

      return;
    }


    // Check password length
    if (password.length < 6) {

      Alert.alert(
        'Password Too Short',
        'Your password must contain at least 6 characters.'
      );

      return;
    }


    // Check passwords
    if (password !== confirmPassword) {

      Alert.alert(
        'Passwords Do Not Match',
        'Please make sure both passwords are the same.'
      );

      return;
    }


    setLoading(true);


    try {

      // =================================================
      // CREATE SUPABASE AUTH USER
      // =================================================

      const {
        data,
        error,
      } = await supabase.auth.signUp({

        email: email.trim(),

        password: password,

      });


      // =================================================
      // AUTH ERROR
      // =================================================

      if (error) {

        Alert.alert(
          'Signup Failed',
          error.message
        );

        return;
      }


      // =================================================
      // CHECK USER
      // =================================================

      if (!data.user) {

        Alert.alert(
          'Signup Failed',
          'The account could not be created.'
        );

        return;
      }


      // =================================================
      // CREATE PROFILE
      // =================================================

      const {
        error: profileError,
      } = await supabase
        .from('profiles')
        .insert({

          id: data.user.id,

          name: name.trim(),

          role: 'customer',

        });


      // =================================================
      // PROFILE ERROR
      // =================================================

      if (profileError) {

        console.log(
          'PROFILE ERROR:',
          profileError
        );

        Alert.alert(
          'Profile Error',
          profileError.message
        );

        return;
      }


      // =================================================
      // SUCCESS
      // =================================================

      Alert.alert(
        '🎉 Account Created!',
        'Your FoodReview account has been created successfully.',
        [
          {
            text: 'Continue',
            onPress: () => {

              router.replace('/' as any);

            },
          },
        ]
      );

    } catch (error) {

      console.log(
        'SIGNUP ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Something went wrong. Please try again.'
      );

    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // SCREEN
  // =====================================================

  return (

    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >

      {/* =================================================
          LOGO
      ================================================= */}

      <Text style={styles.logo}>
        🍽️
      </Text>


      {/* =================================================
          TITLE
      ================================================= */}

      <Text style={styles.title}>
        Create Account
      </Text>


      <Text style={styles.subtitle}>
        Join FoodReview and help restaurants
        make their food better.
      </Text>


      {/* =================================================
          NAME
      ================================================= */}

      <Text style={styles.label}>
        Name
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />


      {/* =================================================
          EMAIL
      ================================================= */}

      <Text style={styles.label}>
        Email
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />


      {/* =================================================
          PASSWORD
      ================================================= */}

      <Text style={styles.label}>
        Password
      </Text>

      <TextInput
        style={styles.input}
        placeholder="At least 6 characters"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />


      {/* =================================================
          CONFIRM PASSWORD
      ================================================= */}

      <Text style={styles.label}>
        Confirm Password
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your password again"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
      />


      {/* =================================================
          CREATE ACCOUNT BUTTON
      ================================================= */}

      <Pressable
        style={[
          styles.signupButton,
          loading && styles.disabledButton,
        ]}
        onPress={signup}
        disabled={loading}
      >

        {loading ? (

          <ActivityIndicator
            color="#FFFFFF"
            size="small"
          />

        ) : (

          <Text style={styles.signupButtonText}>
            CREATE ACCOUNT
          </Text>

        )}

      </Pressable>


      {/* =================================================
          LOGIN
      ================================================= */}

      <View style={styles.loginContainer}>

        <Text style={styles.loginText}>
          Already have an account?
        </Text>


        <Pressable
          onPress={() =>
            router.replace('/login' as any)
          }
        >

          <Text style={styles.loginLink}>
            Login
          </Text>

        </Pressable>

      </View>


      {/* =================================================
          INFORMATION
      ================================================= */}

      <View style={styles.infoBox}>

        <Text style={styles.infoTitle}>
          🔐 Your account
        </Text>

        <Text style={styles.infoText}>
          Your account lets you submit reviews
          and keep track of your FoodReview activity.
        </Text>

      </View>


    </ScrollView>

  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  scrollView: {
    flex: 1,

    backgroundColor: '#FFF9F0',
  },


  container: {
    flexGrow: 1,

    paddingHorizontal: 25,

    paddingTop: 55,

    paddingBottom: 50,

    justifyContent: 'center',
  },


  // ===================================================
  // LOGO
  // ===================================================

  logo: {
    fontSize: 55,

    textAlign: 'center',

    marginBottom: 5,
  },


  // ===================================================
  // TITLE
  // ===================================================

  title: {
    fontSize: 29,

    fontWeight: '800',

    textAlign: 'center',

    color: '#222',

    marginTop: 5,
  },


  subtitle: {
    fontSize: 13,

    lineHeight: 20,

    textAlign: 'center',

    color: '#888',

    marginTop: 8,

    marginBottom: 25,

    paddingHorizontal: 10,
  },


  // ===================================================
  // LABEL
  // ===================================================

  label: {
    fontSize: 14,

    fontWeight: '700',

    color: '#333',

    marginTop: 11,

    marginBottom: 7,
  },


  // ===================================================
  // INPUT
  // ===================================================

  input: {
    height: 52,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,

    borderColor: '#E5E5E5',

    borderRadius: 13,

    paddingHorizontal: 15,

    fontSize: 15,

    color: '#222',
  },


  // ===================================================
  // SIGNUP BUTTON
  // ===================================================

  signupButton: {
    height: 53,

    backgroundColor: '#222',

    borderRadius: 13,

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 25,
  },


  disabledButton: {
    opacity: 0.6,
  },


  signupButtonText: {
    color: '#FFFFFF',

    fontSize: 14,

    fontWeight: '800',

    letterSpacing: 0.5,
  },


  // ===================================================
  // LOGIN
  // ===================================================

  loginContainer: {
    flexDirection: 'row',

    justifyContent: 'center',

    alignItems: 'center',

    marginTop: 21,
  },


  loginText: {
    color: '#777',

    fontSize: 14,
  },


  loginLink: {
    color: '#B66C00',

    fontSize: 14,

    fontWeight: '800',

    marginLeft: 5,
  },


  // ===================================================
  // INFO BOX
  // ===================================================

  infoBox: {
    marginTop: 25,

    padding: 15,

    borderRadius: 14,

    backgroundColor: '#FFF1D0',

    borderWidth: 1,

    borderColor: '#FFE0A0',
  },


  infoTitle: {
    fontSize: 14,

    fontWeight: '800',

    color: '#8A5700',

    marginBottom: 5,
  },


  infoText: {
    fontSize: 12,

    lineHeight: 18,

    color: '#8A6A32',
  },

});