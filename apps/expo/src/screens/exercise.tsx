import { Text, View, Button, TouchableOpacity } from "react-native";
import { trpc } from "../utils/trpc";
import Ionicons from "@expo/vector-icons/Ionicons";

export function ExerciseScreen({ route, navigation }) {
  const { data: exercise } = trpc.exercise.byId.useQuery(route.params.id);

  if (!exercise) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }

  console.log("ExerciseScreen", exercise);
  return (
    <View className="h-full w-full space-y-2 overflow-auto p-2">
      <View className="m-1 space-y-1">
        <View className="flex flex-row items-center space-x-2">
          <Text className="text-xl">{exercise.title}</Text>
          <Text className="text-xs">by {exercise.authorId}</Text>
        </View>
        <Text>{exercise.summary}</Text>
      </View>
      <View className="flex flex-row justify-between">
        <TouchableOpacity
          className="flex h-16 flex-col items-center justify-center rounded-md border p-2"
          onPress={() =>
            navigation.navigate("workout", {
              workout: exercise.workout,
            })
          }
        >
          <>
            <Ionicons name="stopwatch-outline" />
            <Text>Start Workout</Text>
          </>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex h-16 flex-col items-center justify-center rounded-md border p-2"
          onPress={() => console.log("log workout")}
        >
          <>
            <Ionicons name="clipboard-outline" />
            <Text>Log Workout</Text>
          </>
        </TouchableOpacity>
        {/* <Favorite exerciseId={exercise.id} favourited={exercise.favourited} /> */}
      </View>
      {exercise.description && (
        <>
          <Text className="text-lg">Description</Text>
          <Text>{exercise.description}</Text>
        </>
      )}
    </View>
  );
}
