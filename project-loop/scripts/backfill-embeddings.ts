import "dotenv/config";
import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/ai";

// Fills the `embedding` column for feedback that does not have one yet
// (for example the seeded demo data), so Ask LOOP can retrieve it.
// Run with:  npm run backfill

const CONCURRENCY = 3;

async function main() {
  const all = await db.feedback.findMany({
    select: { id: true, content: true, embedding: true },
  });

  const todo = all.filter((item) => item.embedding == null);
  console.log(`${todo.length} of ${all.length} feedback items need embeddings.`);

  let done = 0;
  let failed = 0;

  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const batch = todo.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async (item) => {
        try {
          const embedding = await generateEmbedding(
            item.content,
            "RETRIEVAL_DOCUMENT",
          );

          await db.feedback.update({
            where: { id: item.id },
            data: { embedding },
          });

          done += 1;
        } catch (error) {
          failed += 1;
          console.error(`Failed for ${item.id}:`, error);
        }
      }),
    );

    console.log(`Progress: ${done + failed}/${todo.length}`);
  }

  console.log(`Done. Embedded: ${done}, failed: ${failed}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));