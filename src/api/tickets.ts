import type { CreateTicketPayload, Ticket, UpdateTicketPayload } from "../types/ticket";
import { apiRequest, responseData, type ApiResponse } from "./client";

export const listTickets = async (projectId: string) =>
  responseData(await apiRequest<ApiResponse<Ticket[]>>(`/projects/${projectId}/tickets`));

export const createTicket = async (projectId: string, payload: CreateTicketPayload) =>
  responseData(await apiRequest<ApiResponse<Ticket>>(`/projects/${projectId}/tickets`, {
    method: "POST",
    body: JSON.stringify({ ...payload, description: payload.description || null }),
  }));

export const getTicket = (ticketId: string) => apiRequest<ApiResponse<Ticket>>(`/tickets/${ticketId}`).then(responseData);
export const updateTicket = (ticketId: string, payload: UpdateTicketPayload) => apiRequest<ApiResponse<Ticket>>(`/tickets/${ticketId}`, { method: "PUT", body: JSON.stringify(payload) }).then(responseData);
export const deleteTicket = (ticketId: string) => apiRequest<ApiResponse<null>>(`/tickets/${ticketId}`, { method: "DELETE" });
