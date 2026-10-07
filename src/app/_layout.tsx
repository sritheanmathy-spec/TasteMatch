import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="games" />
      <Stack.Screen name="food-match" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="restaurant" />
      <Stack.Screen name="review" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="favorites" />
    </Stack>
  );
}