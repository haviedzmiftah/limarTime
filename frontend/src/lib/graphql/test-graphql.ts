import { yoga } from "./schema";

async function run() {
  console.log("🔍 Menjalankan uji coba GraphQL Yoga...\n");

  const query = `
    query TestLimarTime {
      schoolInfo {
        name
        totalClasses
        totalTeachers
      }
      classes(grade: 7) {
        name
        gradeLevel
      }
      teachers(query: "Sulistiono") {
        code
        name
      }
      schedule(className: "7A", day: "Senin", versionId: "draft-v1") {
        period
        timeRange
        isBreak
        subjectName
        teacherName
      }
    }
  `;

  const response = await yoga.fetch("http://localhost/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error("❌ GraphQL Error:", result.errors);
    process.exit(1);
  }

  console.log("✅ GraphQL Query Berhasil!");
  console.log("Informasi Sekolah:", result.data.schoolInfo);
  console.log(`Kelas Jenjang 7 (${result.data.classes.length} rombel):`, result.data.classes.map((c: any) => c.name).join(", "));
  console.log("Pencarian Guru:", result.data.teachers);
  console.log(`Jadwal 7A Hari Senin (${result.data.schedule.length} slot):`);
  result.data.schedule.slice(0, 5).forEach((s: any) => {
    console.log(`- ${s.isBreak ? "Jeda" : `JP ${s.period}`}: ${s.timeRange} -> ${s.subjectName} (${s.teacherName})`);
  });
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
