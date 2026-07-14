import "server-only";

import { and, asc, count, eq, gt, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { volunteerEnrollment, volunteerOpportunity } from "../schema";

export async function getVolunteerOpportunities() {
  return db
    .select({
      id: volunteerOpportunity.id,
      title: volunteerOpportunity.title,
      description: volunteerOpportunity.description,
      category: volunteerOpportunity.category,
      address: volunteerOpportunity.address,
      date: volunteerOpportunity.date,
      spots: volunteerOpportunity.spots,
      organizerName: volunteerOpportunity.organizerName,
      creatorId: volunteerOpportunity.creatorId,
      createdAt: volunteerOpportunity.createdAt,
    })
    .from(volunteerOpportunity)
    .where(gt(volunteerOpportunity.date, new Date()))
    .orderBy(asc(volunteerOpportunity.date));
}

export async function getVolunteerEnrollmentCounts(
  opportunityIds: string[]
): Promise<Record<string, number>> {
  if (opportunityIds.length === 0) return {};
  const rows = await db
    .select({
      opportunityId: volunteerEnrollment.opportunityId,
      count: count(volunteerEnrollment.userId),
    })
    .from(volunteerEnrollment)
    .where(inArray(volunteerEnrollment.opportunityId, opportunityIds))
    .groupBy(volunteerEnrollment.opportunityId);
  return Object.fromEntries(rows.map((r) => [r.opportunityId, r.count]));
}

export async function getMyEnrollmentIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ opportunityId: volunteerEnrollment.opportunityId })
    .from(volunteerEnrollment)
    .where(eq(volunteerEnrollment.userId, userId));
  return rows.map((r) => r.opportunityId);
}

export async function createVolunteerOpportunity(data: {
  title: string;
  description?: string;
  category?: string;
  address?: string;
  lat?: string;
  lng?: string;
  date: Date;
  spots: number;
  organizerName?: string;
  creatorId: string;
}) {
  const [created] = await db
    .insert(volunteerOpportunity)
    .values(data)
    .returning();
  return created;
}

export async function enrollVolunteer(
  opportunityId: string,
  userId: string
) {
  await db
    .insert(volunteerEnrollment)
    .values({ opportunityId, userId })
    .onConflictDoNothing();
}

export async function unenrollVolunteer(
  opportunityId: string,
  userId: string
) {
  await db
    .delete(volunteerEnrollment)
    .where(
      and(
        eq(volunteerEnrollment.opportunityId, opportunityId),
        eq(volunteerEnrollment.userId, userId)
      )
    );
}
