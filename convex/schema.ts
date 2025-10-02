import { defineSchema } from "convex/server";
import { Resume } from "./tables/resume";

export default defineSchema({
  resumes: Resume.table.index("byUserId", ["userId"]),
});
