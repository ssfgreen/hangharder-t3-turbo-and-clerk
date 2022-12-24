import { router } from "../trpc";
import { postRouter } from "./post";
import { authRouter } from "./auth";
import { exerciseRouter } from "./exercise";
import { workoutRouter } from "./workout";

export const appRouter = router({
  post: postRouter,
  auth: authRouter,
  exercise: exerciseRouter,
  workout: workoutRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
