import React from "react";

import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "@acme/api";

import { useAuth } from "@clerk/clerk-expo";

import { trpc } from "../utils/trpc";

const SignOut = () => {
  const { signOut } = useAuth();
  return (
    <View className="rounded-lg border-2 border-gray-500 p-4">
      <Button
        title="Sign Out"
        onPress={() => {
          signOut();
        }}
      />
    </View>
  );
};

const ExerciseCard: React.FC<{
  exercise: inferProcedureOutput<AppRouter["exercise"]["all"]>[number];
}> = ({ exercise }) => {
  return (
    <View className="mx-2 rounded-lg border-2 border-gray-500 p-4">
      <Text className="text-xl font-semibold text-[#cc66ff]">
        {exercise.title}
      </Text>
      <Text className="text-dark">{exercise.summary}</Text>
    </View>
  );
};

export const ExercisesScreen = ({ navigation }) => {
  const { data: exercises } = trpc.exercise.all.useQuery();

  console.log("exercises", exercises);

  if (!exercises) {
    return (
      <SafeAreaView className="flex flex-1 flex-col">
        <Text>No Exercies</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex flex-1 flex-col">
      <View className="flex-1">
        <Text className="text-dark text-2xl font-semibold">Workouts</Text>
      </View>

      <FlashList
        data={exercises}
        estimatedItemSize={20}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("home", {
                screen: "exercise",
                params: { id: item.id },
              })
            }
          >
            <ExerciseCard exercise={item} />
          </TouchableOpacity>
        )}
      />
      <SignOut />
    </SafeAreaView>
  );
};
