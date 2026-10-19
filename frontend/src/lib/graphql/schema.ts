import { createSchema, createYoga } from "graphql-yoga";
import { db } from "@/db";
import { classrooms, teachers, subjects, bellSchedules, timetableSlots } from "@/db/schema";
import { eq, and, asc, like } from "drizzle-orm";
import { sortByStartTime } from "@/lib/utils";

const typeDefs = /* GraphQL */ `
  type SchoolInfo {
    name: String!
    totalClasses: Int!
    totalTeachers: Int!
    skNumber: String!
    semester: String!
  }

  type Classroom {
    id: String!
    name: String!
    gradeLevel: Int!
  }

  type Teacher {
    id: String!
    code: String!
    name: String!
    nip: String
    mainSubject: String
    maxJpPerWeek: Int
    maxJpPerDay: Int
  }

  type Subject {
    id: String!
    code: String!
    name: String!
    targetJpPerWeek: Int!
    roomType: String
  }

  type BellSlot {
    jp: Int!
    day: String!
    timeRange: String!
    durationMinutes: Int!
    isBreak: Boolean!
    breakName: String
  }

  type ScheduledSlot {
    id: String
    period: Int!
    day: String!
    timeRange: String!
    isBreak: Boolean!
    subjectName: String!
    subjectCode: String!
    teacherName: String!
    teacherCode: String!
    className: String!
    room: String!
    isLocked: Boolean!
  }

  type Query {
    schoolInfo: SchoolInfo!
    classes(grade: Int): [Classroom!]!
    teachers(query: String): [Teacher!]!
    subjects: [Subject!]!
    bellSchedule(day: String): [BellSlot!]!
    schedule(className: String, teacherCode: String, day: String!, versionId: String): [ScheduledSlot!]!
  }
`;

const resolvers = {
  Query: {
    schoolInfo: async () => {
      return {
        name: "SMP Negeri 1 Ngawi",
        totalClasses: 30,
        totalTeachers: 55,
        skNumber: "400.3.5.1/269/404.301.3.01/2026",
        semester: "Ganjil 2026/2027",
      };
    },

    classes: async (_: unknown, { grade }: { grade?: number }) => {
      if (grade) {
        return await db
          .select()
          .from(classrooms)
          .where(eq(classrooms.gradeLevel, grade))
          .orderBy(asc(classrooms.orderIndex));
      }
      return await db.select().from(classrooms).orderBy(asc(classrooms.orderIndex));
    },

    teachers: async (_: unknown, { query }: { query?: string }) => {
      if (query) {
        return await db
          .select()
          .from(teachers)
          .where(like(teachers.name, `%${query}%`))
          .orderBy(asc(teachers.no));
      }
      return await db.select().from(teachers).orderBy(asc(teachers.no));
    },

    subjects: async () => {
      return await db.select().from(subjects).orderBy(asc(subjects.id));
    },

    bellSchedule: async (_: unknown, { day }: { day?: string }) => {
      if (day) {
        const list = await db
          .select()
          .from(bellSchedules)
          .where(eq(bellSchedules.day, day));
        return sortByStartTime(list);
      }
      const list = await db.select().from(bellSchedules).orderBy(asc(bellSchedules.day));
      return sortByStartTime(list);
    },

    schedule: async (
      _: unknown,
      {
        className,
        teacherCode,
        day,
        versionId = "draft-v1",
      }: {
        className?: string;
        teacherCode?: string;
        day: string;
        versionId?: string;
      }
    ) => {
      // 1. Ambil bell structure untuk hari ini (diurutkan kronologis pagi ke siang)
      const rawBellList = await db
        .select()
        .from(bellSchedules)
        .where(eq(bellSchedules.day, day));
      const bellList = sortByStartTime(rawBellList);

      // 2. Ambil query slot
      let queryCondition = eq(timetableSlots.day, day);
      if (className) {
        queryCondition = and(queryCondition, eq(timetableSlots.classroomId, className)) as any;
      }
      if (versionId) {
        queryCondition = and(queryCondition, eq(timetableSlots.versionId, versionId)) as any;
      }

      const rows = await db
        .select({
          id: timetableSlots.id,
          jp: timetableSlots.jp,
          day: timetableSlots.day,
          room: timetableSlots.room,
          isLocked: timetableSlots.isLocked,
          classroomId: timetableSlots.classroomId,
          teacherName: teachers.name,
          teacherCode: teachers.code,
          subjectName: subjects.name,
          subjectCode: subjects.code,
        })
        .from(timetableSlots)
        .leftJoin(teachers, eq(timetableSlots.teacherId, teachers.id))
        .leftJoin(subjects, eq(timetableSlots.subjectId, subjects.id))
        .where(queryCondition)
        .orderBy(asc(timetableSlots.jp));

      // Filter jika mencari berdasar teacherCode
      const filteredRows = teacherCode
        ? rows.filter((r) => r.teacherCode?.toLowerCase() === teacherCode.toLowerCase())
        : rows;

      // Bentuk output terstruktur
      return bellList.map((bell) => {
        if (bell.isBreak) {
          return {
            id: null,
            period: bell.jp,
            day: bell.day,
            timeRange: bell.timeRange,
            isBreak: true,
            subjectName: bell.breakName || "Istirahat",
            subjectCode: "BREAK",
            teacherName: "-",
            teacherCode: "-",
            className: className || "-",
            room: "-",
            isLocked: true,
          };
        }

        const match = filteredRows.find((r) => r.jp === bell.jp);
        return {
          id: match?.id || null,
          period: bell.jp,
          day: bell.day,
          timeRange: bell.timeRange,
          isBreak: false,
          subjectName: match?.subjectName || "Jam Bebas / Mandiri",
          subjectCode: match?.subjectCode || "-",
          teacherName: match?.teacherName || "-",
          teacherCode: match?.teacherCode || "-",
          className: match?.classroomId || className || "-",
          room: match?.room || "Kelas",
          isLocked: match?.isLocked || false,
        };
      });
    },
  },
};

export const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
  cors: {
    origin: "*",
    credentials: false,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});
