import { Match, User } from "@prisma/client";

export interface ExtendedMatch extends Match {
  winner1: Pick<User, "id" | "name">;
  winner2: Pick<User, "id" | "name"> | null;
  loser1: Pick<User, "id" | "name">;
  loser2: Pick<User, "id" | "name"> | null;
}
