import { apiBlobRequest, apiRequest, responseData, type ApiResponse } from "./client";

export interface DailySummaryComment { id: string; description: string; created_at: string; }
export interface DailySummaryTicket { project_name: string; ticket_name: string; status_changed: boolean; previous_status?: string; current_status: string; finished: boolean; hours_logged: number; comments: DailySummaryComment[]; }
export interface DeveloperDailySummary { user_id: string; developer_name: string; organization_id: string; report_start: string; report_end: string; tickets: DailySummaryTicket[]; total_tickets: number; tickets_finished: number; total_hours_logged: number; total_comments: number; }

export const getDeveloperDailySummary = (organizationId: string, userId: string) =>
    apiRequest<ApiResponse<DeveloperDailySummary>>(`/analytics/${organizationId}/developers/${userId}/daily-summary`).then(responseData);

// Downloads the organization-wide daily summary as an Excel file and triggers
// a browser save. Returns the filename that was used.
export const downloadDailySummaryExcel = async (organizationId: string) => {
    const { blob, filename } = await apiBlobRequest(`/analytics/${organizationId}/daily-summary/excel`);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename ?? `daily-summary-${organizationId}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return link.download;
};
