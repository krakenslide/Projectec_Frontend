import { apiRequest, responseData, type ApiResponse } from "./client";
import type { CreateMilestonePayload, Milestone, MilestoneProgressPoint } from "../types/milestone";
import type { Ticket } from "../types/ticket";

export const createMilestone = async (projectId: string, payload: CreateMilestonePayload) =>
  responseData(
    await apiRequest<ApiResponse<Milestone>>(`/milestones/projects/${projectId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );

export const listMilestoneSummary = async (projectId: string) =>
  responseData(
    await apiRequest<ApiResponse<Milestone[]>>(`/milestones/projects/${projectId}/milestone-summary`),
  );

export const getMilestoneProgress = async (projectId: string, milestoneId: string) =>
  responseData(
    await apiRequest<ApiResponse<MilestoneProgressPoint[]>>(
      `/milestones/projects/${projectId}/${milestoneId}/progress`,
    ),
  );

export const listMilestoneTickets = async (projectId: string, milestoneId: string) =>
  responseData(
    await apiRequest<ApiResponse<Ticket[]>>(`/${projectId}/${milestoneId}/tickets`),
  );
