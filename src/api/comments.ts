import { apiRequest, responseData, type ApiResponse } from "./client";

export interface Comment { id: string; ticket_id: string; description: string; has_attachment: boolean; created_at: string | null; updated_at: string | null; created_by: string | null; updated_by: string | null; name?: string | null; email?: string | null; }
interface CommentListResponse { comments: Comment[]; }
export const listComments = (ticketId: string) => apiRequest<ApiResponse<CommentListResponse>>(`/tickets/${ticketId}/comments`).then(responseData).then(result => result.comments ?? []);
export const createComment = (ticketId: string, description: string) => apiRequest<ApiResponse<Comment>>(`/tickets/${ticketId}/comments`, { method: "POST", body: JSON.stringify({ ticket_id: ticketId, description }) }).then(responseData);
export const getComment = (ticketId: string, commentId: string) => apiRequest<ApiResponse<Comment>>(`/tickets/${ticketId}/comments/${commentId}`).then(responseData);
export const updateComment = (ticketId: string, commentId: string, description: string) => apiRequest<ApiResponse<Comment>>(`/tickets/${ticketId}/comments/${commentId}`, { method: "PUT", body: JSON.stringify({ description }) }).then(responseData);
export const deleteComment = (ticketId: string, commentId: string) => apiRequest<ApiResponse<null>>(`/tickets/${ticketId}/comments/${commentId}`, { method: "DELETE" });
