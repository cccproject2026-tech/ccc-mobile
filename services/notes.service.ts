import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";

export interface ApiNote {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const NotesService = {
  async getNotes(userId: string): Promise<ApiNote[]> {
    console.log("Calling notes for userId:", userId);
    const response = await apiClient.get<{ success: boolean; data: ApiNote[] }>(
      ENDPOINTS.USERS.NOTES(userId)
    );
    return response.data?.data || [];
  },

  async createNote(userId: string, content: string): Promise<ApiNote | null> {
    console.log("Calling notes create for userId:", userId);
    const response = await apiClient.post<{ success: boolean; data: ApiNote }>(
      ENDPOINTS.USERS.NOTES(userId),
      { content }
    );
    return response.data?.data || null;
  },

  async updateNote(userId: string, noteId: string, content: string): Promise<ApiNote | null> {
    console.log("Calling notes update for userId:", userId, "noteId:", noteId);
    const response = await apiClient.patch<{ success: boolean; data: ApiNote }>(
      ENDPOINTS.USERS.NOTE_BY_ID(userId, noteId),
      { content }
    );
    return response.data?.data || null;
  },

  async deleteNote(userId: string, noteId: string): Promise<boolean> {
    console.log("Calling notes delete for userId:", userId, "noteId:", noteId);
    const response = await apiClient.delete<{ success: boolean; data: any }>(
      ENDPOINTS.USERS.NOTE_BY_ID(userId, noteId)
    );
    return response.data?.success ?? false;
  },
};

