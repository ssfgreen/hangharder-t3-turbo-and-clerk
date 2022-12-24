import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const exerciseRouter = router({
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.exercise.findMany();
  }),
  byId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.exercise.findFirst({
      where: {
        id: input,
      },
      include: {
        workout: true,
      },
    });
  }),
});
