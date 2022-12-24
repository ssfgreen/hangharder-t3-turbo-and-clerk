import { Text, View } from "react-native";
import Timer from "../components/timer";
import { trpc } from "../utils/trpc";
import Ionicons from "@expo/vector-icons/Ionicons";

export function WorkoutScreen({ route, navigation }) {
  // const { data: workout } = trpc.workout.byId.useQuery(route.p.id);
  console.log(route);
  const workout = route.params.workout;

  if (!workout) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }

  console.log("Workout", workout);
  return workout.type === "TIMER" ? (
    <Timer workout={workout} />
  ) : (
    <Text>Not Timer</Text>
  );
}
