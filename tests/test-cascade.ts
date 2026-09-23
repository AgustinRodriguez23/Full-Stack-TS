import dotenv from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { profiles, posts } from "../src/db/schema";
import { eq } from "drizzle-orm";

dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function testCascadeDelete() {
  try {
    const [newProfile] = await db
      .insert(profiles)
      .values({ username: "test-cascade-user" })
      .returning();
    console.log("✅ Profile creado:", newProfile);

    const [newPost] = await db
      .insert(posts)
      .values({
        title: "Post de prueba",
        content: "Este post debería borrarse en cascada",
        authorId: newProfile.id,
      })
      .returning();
    console.log("✅ Post creado:", newPost);

    const postsBefore = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, newProfile.id));
    console.log(`📋 Posts antes del delete: ${postsBefore.length}`);

    await db.delete(profiles).where(eq(profiles.id, newProfile.id));
    console.log("🗑️  Profile borrado");

    const postsAfter = await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, newProfile.id));
    console.log(`📋 Posts después del delete: ${postsAfter.length}`);

    if (postsAfter.length === 0) {
      console.log("✅ CASCADE funcionó correctamente");
    } else {
      console.log("❌ CASCADE no funcionó, el post sigue existiendo");
    }
  } catch (err) {
    console.error("Error durante el test:", err);
  } finally {
    await client.end();
  }
}

testCascadeDelete();