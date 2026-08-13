import { apiRequest, responseData, type ApiResponse } from "./client";

export interface TicketActivity {
  id: string;
  ticket_id: string;
  action_type: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export const listTicketActivities = async (ticketId: string) =>
  responseData(await apiRequest<ApiResponse<TicketActivity[]>>(`/activities/tickets/${ticketId}`));
