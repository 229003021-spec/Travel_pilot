import { z } from "zod";

export const DataProvenanceSchema = z.enum(["verified", "estimated", "demo"]);

export const SourcedNumberSchema = z.object({
  value: z.number(),
  provenance: DataProvenanceSchema,
  sourceId: z.string().optional(),
  retrievedAt: z.string().optional(),
});

export const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("REMOVE_ACTIVITY"),
    activityId: z.string(),
  }),
  z.object({
    action: z.literal("ADD_ACTIVITY"),
    activityId: z.string(),
    day: z.number().optional(),
    preferredTime: z.string().optional(),
  }),
  z.object({
    action: z.literal("MOVE_ACTIVITY"),
    activityId: z.string(),
    day: z.number().optional(),
    newTime: z.string(),
  }),
  z.object({
    action: z.literal("REPLACE_ACTIVITY"),
    activityId: z.string(),
    withActivityId: z.string().optional(),
  }),
  z.object({
    action: z.literal("CHANGE_BUDGET"),
    amount: z.number(),
  }),
  z.object({
    action: z.literal("CHANGE_PREFERENCE"),
    patch: z.object({
      pace: z.enum(["relaxed", "balanced", "packed"]).optional(),
      walking: z.enum(["low", "medium", "high"]).optional(),
      food: z.array(z.string()).optional(),
      setting: z.enum(["indoor", "outdoor", "mixed"]).optional(),
      tier: z.enum(["budget", "mid", "luxury"]).optional(),
      dayStart: z.string().optional(),
      dayEnd: z.string().optional(),
      familyFriendly: z.boolean().optional(),
    }),
  }),
  z.object({
    action: z.literal("MARK_UNAVAILABLE"),
    activityId: z.string(),
    reason: z.enum(["cancelled", "closed", "weather", "delay"]),
  }),
  z.object({
    action: z.literal("REPLAN"),
    reason: z.enum(["weather", "budget", "disruption", "preference"]),
    affectedDay: z.number().optional(),
  }),
]);

export const GenerateTripRequestSchema = z.object({
  destination: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  travellers: z.object({
    adults: z.number().min(1),
    children: z.number().min(0).default(0),
    elderly: z.number().min(0).default(0),
  }),
  budget: z.object({
    total: z.number().min(0),
    currency: z.enum(["INR", "USD", "EUR", "GBP", "AED"]).default("INR"),
  }),
  interests: z.array(z.string()),
  preferences: z.object({
    pace: z.enum(["relaxed", "balanced", "packed"]).default("balanced"),
    walking: z.enum(["low", "medium", "high"]).default("medium"),
    food: z.array(z.string()).default([]),
    setting: z.enum(["indoor", "outdoor", "mixed"]).default("mixed"),
    tier: z.enum(["budget", "mid", "luxury"]).default("mid"),
    dayStart: z.string().default("09:00"),
    dayEnd: z.string().default("21:00"),
    familyFriendly: z.boolean().default(false),
  }),
  startingPoint: z.object({
    type: z.enum(["hotel", "airport", "railway", "custom"]),
    name: z.string(),
    lat: z.number(),
    lng: z.number(),
  }),
});

export const AssistantChatRequestSchema = z.object({
  message: z.string().min(1),
  trip: z.any(), // checked dynamically
});
