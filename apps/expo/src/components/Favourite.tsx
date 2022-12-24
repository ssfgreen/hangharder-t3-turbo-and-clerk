import React from "react";
import { trpc } from "../utils/trpc";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TouchableOpacity, Text } from "react-native";

const Favorite = ({
  exerciseId,
  favourited,
}: {
  exerciseId: string;
  favourited: boolean;
}) => {
  const utils = trpc.useContext();
  const favouriteMutation = trpc.exercise.favourite.useMutation({
    onMutate: async (exerciseId) => {
      // stop any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.exercise.getById.cancel(exerciseId);

      // get snapshot of current value
      const origExercise = utils.exercise.getById.getData(exerciseId);

      // modify cache to reflect optimistic update
      if (origExercise) {
        utils.exercise.getById.setData(
          {
            ...origExercise,
            favourited: !origExercise?.favourited,
          },
          exerciseId,
        );
      }
    },
    onSuccess: () => {
      utils.exercise.getById.invalidate();
    },
    onError: (err, exerciseId) => {
      utils.exercise.getById.refetch(exerciseId);
    },
  });

  const handleFavourite = async () => {
    favouriteMutation.mutate(exerciseId);
  };

  return (
    <TouchableOpacity
      className="flex h-16 flex-col items-center justify-center rounded-md border p-2"
      onPress={handleFavourite}
    >
      <>
        {favourited ? (
          <Ionicons name="star" />
        ) : (
          <Ionicons name="star-outline" />
        )}
        <Text>Favorite</Text>
      </>
    </TouchableOpacity>
  );
};

export default Favorite;
