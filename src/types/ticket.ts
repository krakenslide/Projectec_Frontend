export type TicketStatus = "To Do" | "In Progress" | "In Review" | "Testing" | "Done" | "Closed";
export type TicketPriority = "P0" | "P1" | "P2" | "P3" | "P4";
export type TicketType = "Feature" | "Bug" | "Task" | "Improvement";

export interface Ticket {
  id: string;
  project_id: string;
  organization_id: string;
  ticket_number: string;
  title: string;
  description: string | null;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  parent_ticket_id?: string | null;
  assigned_to?: string | null;
  difficulty?: number | null;
  expected_start_date?: string | null;
  expected_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  reason_for_delay?: string | null;
  hours_logged?: number;
  demo_link?: string | null;
}

export type UpdateTicketPayload = Partial<CreateTicketPayload & { status: TicketStatus; parent_ticket_id: string | null; assigned_to: string | null; difficulty: number | null; expected_start_date: string | null; expected_end_date: string | null; actual_start_date: string | null; actual_end_date: string | null; reason_for_delay: string | null; hours_logged: number | null; demo_link: string | null }>;

export interface CreateTicketPayload {
  title: string;
  description?: string | null;
  type: TicketType;
  priority?: TicketPriority;
  assigned_to?: string | null;
}
