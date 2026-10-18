import { generateSchedule } from "./scheduler-service";

async function run() {
  console.log("🎯 Menguji Solver Penjadwalan Otomatis limarTime...\n");
  const result = await generateSchedule({ versionId: "draft-v1", saveToDb: true });

  console.log("\n📋 Rangkuman Hasil Pengujian Solver:");
  console.log(`- Success: ${result.success}`);
  console.log(`- Hard Score (Bentrok): ${result.score.hardScore}`);
  console.log(`- Soft Score (Kualitas): ${result.score.softScore}`);
  console.log(`- Morning Priority Fulfilled: ${result.score.metrics.morningPriorityFulfilled}/${result.score.metrics.morningPriorityTotal}`);
  console.log(`- Teacher Gap Hours: ${result.score.metrics.teacherGapsCount}`);

  if (result.conflicts.length > 0) {
    console.log("\n⚠️ Konflik yang ditemukan:");
    result.conflicts.slice(0, 5).forEach((c, idx) => {
      console.log(`  ${idx + 1}. [${c.type}] ${c.message}`);
    });
  } else {
    console.log("\n🌟 Sempurna! ZERO CONFLICT (0 Bentrok Guru, 0 Bentrok Kelas) terbukti.");
  }
}

run().catch((err) => {
  console.error("Gagal menjalankan solver test:", err);
  process.exit(1);
});
