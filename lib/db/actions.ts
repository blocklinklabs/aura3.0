import { db } from "./dbConfig";
import {
  users,
  therapySessions,
  deviceSettings,
  healthMetrics,
  userPreferences,
  chatHistory,
  wearableDevices,
  activities,
  wearableMetrics,
} from "./schema";
import { eq, and, gte, desc } from "drizzle-orm";

export async function createUser(userData: {
  email: string;
  name: string;
  encryptedData: any;
}) {
  return await db.insert(users).values(userData).returning();
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<typeof userPreferences.$inferInsert>
) {
  return await db
    .update(userPreferences)
    .set(preferences)
    .where(eq(userPreferences.userId, userId))
    .returning();
}

export async function logHealthMetric(
  userId: string,
  metricType: string,
  value: any
) {
  return await db.insert(healthMetrics).values({
    userId,
    metricType,
    value,
  });
}

export async function scheduleTherapySession(
  userId: string,
  scheduledTime: Date
) {
  return await db.insert(therapySessions).values({
    userId,
    scheduledTime,
    status: "scheduled",
  });
}

export async function updateDeviceSettings(
  userId: string,
  deviceType: string,
  settings: any
) {
  return await db.insert(deviceSettings).values({
    userId,
    deviceType,
    settings,
  });
}

// Chat History Actions
export async function saveChatMessage({
  userId,
  message,
  role,
  context,
}: {
  userId: string;
  message: string;
  role: "user" | "assistant";
  context?: any;
}) {
  return await db
    .insert(chatHistory)
    .values({
      userId,
      message,
      role,
      context,
    })
    .returning();
}

export async function getChatHistory(userId: string) {
  return await db
    .select()
    .from(chatHistory)
    .where(eq(chatHistory.userId, userId))
    .orderBy(chatHistory.timestamp);
}

// Wearable Device Actions
export async function connectWearableDevice({
  userId,
  deviceType,
  deviceId,
  accessToken,
  refreshToken,
}: {
  userId: string;
  deviceType: string;
  deviceId: string;
  accessToken: string;
  refreshToken: string;
}) {
  return await db
    .insert(wearableDevices)
    .values({
      userId,
      deviceType,
      deviceId,
      accessToken,
      refreshToken,
    })
    .returning();
}

// Activity Management
export async function createActivity({
  userId,
  sessionId,
  activityData,
}: {
  userId: string;
  sessionId?: string;
  activityData: Partial<typeof activities.$inferInsert>;
}) {
  return await db
    .insert(activities)
    .values({
      userId,
      sessionId,
      ...activityData,
    })
    .returning();
}

export async function updateActivityStatus({
  activityId,
  status,
  completedAt,
}: {
  activityId: string;
  status: string;
  completedAt?: Date;
}) {
  return await db
    .update(activities)
    .set({ status, completedAt })
    .where(eq(activities.id, activityId))
    .returning();
}

export async function getTodaysActivities(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await db
    .select()
    .from(activities)
    .where(
      and(eq(activities.userId, userId), gte(activities.scheduledFor, today))
    )
    .orderBy(activities.scheduledFor);
}

export async function getLatestHealthMetrics(userId: string) {
  return await db
    .select()
    .from(wearableMetrics)
    .where(eq(wearableMetrics.userId, userId))
    .orderBy(desc(wearableMetrics.timestamp))
    .limit(1)
    .then((results) => results[0] || null);
}

export async function getAllTherapySessions(userId: string) {
  return await db
    .select()
    .from(therapySessions)
    .where(eq(therapySessions.userId, userId))
    .orderBy(desc(therapySessions.scheduledTime));
}

export async function createTherapySession({
  userId,
  type,
  status = "in_progress",
}: {
  userId: string;
  type: string;
  status?: string;
}) {
  return await db
    .insert(therapySessions)
    .values({
      userId,
      scheduledTime: new Date(),
      type,
      status,
    })
    .returning();
}

export async function updateTherapySession(
  sessionId: string,
  data: Partial<typeof therapySessions.$inferInsert>
) {
  return await db
    .update(therapySessions)
    .set(data)
    .where(eq(therapySessions.id, sessionId))
    .returning();
}
