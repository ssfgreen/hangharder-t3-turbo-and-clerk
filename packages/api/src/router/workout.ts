import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const workoutRouter = router({
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.workout.findMany();
  }),
  byId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.workout.findFirst({ where: { id: input } });
  }),
});
