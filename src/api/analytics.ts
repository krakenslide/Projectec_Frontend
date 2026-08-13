import { apiRequest, responseData, type ApiResponse } from "./client";

export interface DailySummaryComment { id: string; description: string; created_at: string; }
export interface DailySummaryTicket { project_name: string; ticket_name: string; status_changed: boolean; current_status: string; finished: boolean; hours_logged: number; comments: DailySummaryComment[]; }
export interface DeveloperDailySummary { user_id: string; developer_name: string; organization_id: string; report_start: string; report_end: string; tickets: DailySummaryTicket[]; total_tickets: number; tickets_finished: number; total_hours_logged: number; total_comments: number; }

export const getDeveloperDailySummary = (organizationId: string, userId: string) =>
    apiRequest<ApiResponse<DeveloperDailySummary>>(`/analytics/${organizationId}/developers/${userId}/daily-summary`).then(responseData);
