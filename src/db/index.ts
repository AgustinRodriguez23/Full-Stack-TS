import dotenv from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { profiles } from "./schema";

dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);

try {
  const inserted = await db
    .insert(profiles)
    .values({ username: "Nahuel" })
    .returning();

  console.log("Insertado:", inserted);

  const users = await db.select().from(profiles);
  console.log("Todos los usuarios:", users);
} catch (err) {
  console.error("Error al insertar:", err);
} finally {
  await client.end();
}
