import { asyncMap, omit } from "convex-helpers";
import { ConvexError, v } from "convex/values";
import { nanoid } from "nanoid";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { authComponent, userAction, userQuery } from "./auth";
import { Resume } from "./tables/resume";

export const create = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    return ctx.db.insert("resumes", {
      title: args.title,
      updatedTime: Date.now(),
      experiences: [],
      educations: [],
      socials: [],
      socialsVisible: false,
      languages: [],
      languagesVisible: false,
      skills: [],
      skillsVisible: false,
      references: [],
      referencesVisible: false,
      courses: [],
      coursesVisible: false,
      internships: [],
      internshipsVisible: false,
      template: {
        name: "Aarhus",
        color: "#ffe14c",
        lineHeight: "1.5",
        fontSize: "12",
        fontFamily: "Arial",
      },
      userId: user?._id,
      key: nanoid(8),
    });
  },
});

export const get = query({
  args: {
    id: v.id("resumes"),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const data = await ctx.db.get(args.id);
    if (!data) {
      throw new ConvexError("not found");
    }

    if (args.secret !== process.env["SECRET"]) {
      if (data.userId) {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (data.userId != user?._id) {
          throw new ConvexError("CV belong to a user");
        }
      }
    }

    return {
      ...data,
      workExperiences: data.experiences.sort((a, b) => {
        const aSort = a.order !== undefined ? a.order : Infinity;
        const bSort = b.order !== undefined ? b.order : Infinity;

        return aSort - bSort;
      }),
      ...(data.photo ? { photoUrl: await ctx.storage.getUrl(data.photo) } : {}),
    };
  },
});

export const clone = action({
  args: {
    id: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const data = await ctx.runQuery(api.resumes.get, { id: args.id });
    const response: string = await ctx.runMutation(api.resumes.create, {
      title: data.title,
    });

    if (data.photo && data.photoUrl) {
      const response = await fetch(data.photoUrl);
      const image = await response.blob();
      data.photo = await ctx.storage.store(image);
    }

    await ctx.runMutation(api.resumes.update, {
      _id: response as Id<"resumes">,
      ...omit({ ...data, title: "Clone of " + data.title }, [
        "_id",
        "_creationTime",
        "updatedTime",
        "photoUrl",
        "userId",
      ]),
    });

    return response;
  },
});

export const destroy = internalMutation({
  args: {
    id: v.id("resumes"),
    userId: v.id("user"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("resumes")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("_id"), args.id))
      .unique();
    if (!doc) {
      throw new ConvexError("Not authorized");
    }
    return ctx.db.delete(args.id);
  },
});

export const asyncDestroy = userAction({
  args: {
    id: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(250, internal.resumes.destroy, {
      id: args.id,
      userId: ctx.user._id,
    });
  },
});

export const updateInternal = internalMutation({
  args: omit(Resume.withSystemFields, ["_creationTime", "updatedTime"]),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("resumes")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("_id"), args._id))
      .unique();

    if (!doc) {
      throw new ConvexError("Not authorized");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = args;
    return ctx.db.patch(_id, { ...rest, updatedTime: Date.now() });
  },
});

export const update = mutation({
  args: omit(Resume.withSystemFields, [
    "_creationTime",
    "userId",
    "updatedTime",
  ]),
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("resumes")
      .filter((q) => q.eq(q.field("_id"), args._id))
      .unique();

    if (!data) {
      throw new ConvexError("not found");
    }

    if (data.userId) {
      const user = await authComponent.safeGetAuthUser(ctx);
      if (data.userId != user?._id) {
        throw new ConvexError("CV belong to a user");
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = args;
    return ctx.db.patch(_id, { ...rest, updatedTime: Date.now() });
  },
});

export const updateTemplate = mutation({
  args: {
    _id: v.id("resumes"),
    template: v.object({
      color: v.string(),
      fontFamily: v.string(),
      fontSize: v.string(),
      lineHeight: v.string(),
      name: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("resumes")
      .filter((q) => q.eq(q.field("_id"), args._id))
      .unique();

    if (!data) {
      throw new ConvexError("not found");
    }

    if (data.userId) {
      const user = await authComponent.safeGetAuthUser(ctx);
      if (data.userId != user?._id) {
        throw new ConvexError("CV belong to a user");
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = args;
    return ctx.db.patch(_id, { ...rest, updatedTime: Date.now() });
  },
});

export const list = userQuery({
  handler: async (ctx) => {
    const resumes = await ctx.db
      .query("resumes")
      .withIndex("byUserId", (q) => q.eq("userId", ctx.user._id))
      .collect();

    return asyncMap(resumes, async (data) => {
      return {
        ...data,
        ...(data.photo
          ? { photoUrl: await ctx.storage.getUrl(data.photo) }
          : {}),
      };
    });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const sendImage = mutation({
  args: { storageId: v.id("_storage"), id: v.id("resumes") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      photo: args.storageId,
    });
  },
});

export const deleteImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
  },
});
