export interface Milestone {
  id: string;
  name: string;
  expected_start_date: string | null;
  expected_end_date: string | null;
  progress_percentage: number;
  total_tickets: number;
  completed_tickets: number;
}

export interface MilestoneProgressPoint {
  date: string;
  expected_percentage: number;
  actual_percentage: number;
}

export interface CreateMilestonePayload {
  name: string;
}
