import * as React from "react";

import { ClerkLoaded, useUser, SignedIn, SignedOut } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { WorkoutScreen } from "../screens/workout";
import { ExerciseScreen } from "../screens/exercise";
import { ExercisesScreen } from "../screens/exercises";
import { SignInScreen } from "../screens/signin";

export default function Navigation() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ExercisesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="exercises" component={ExercisesScreen} />
      <Stack.Screen name="exercise" component={ExerciseScreen} />
      <Stack.Screen name="workout" component={WorkoutScreen} />
    </Stack.Navigator>
  );
}

const RootNavigator = () => {
  const { isSignedIn } = useUser();
  console.log("signedIn", isSignedIn);
  return isSignedIn ? (
    <ClerkLoaded>
      <SignedIn>
        <Tab.Navigator
          initialRouteName="home"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "home") {
                iconName = focused ? "home" : "home-outline";
              } else if (route.name === "profile") {
                iconName = focused ? "person-circle" : "person-circle-outline";
              }

              // You can return any component that you like here!
              return (
                <Ionicons
                  name={iconName ?? "alarm"}
                  size={size}
                  color={color}
                />
              );
            },
            tabBarActiveTintColor: "tomato",
            tabBarInactiveTintColor: "gray",
          })}
        >
          <Tab.Screen
            name="home"
            component={ExercisesStack}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="signin"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </SignedIn>
    </ClerkLoaded>
  ) : (
    <ClerkLoaded>
      <SignedOut>
        <Stack.Navigator>
          <Stack.Screen name="signin" component={SignInScreen}></Stack.Screen>
        </Stack.Navigator>
      </SignedOut>
    </ClerkLoaded>
  );
};
