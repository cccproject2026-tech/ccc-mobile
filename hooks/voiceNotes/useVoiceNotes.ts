import { voiceNotesService } from "@/services/voiceNotes.service";
import type { VoiceNote, VoiceNoteUploadPayload } from "@/types/voiceNote.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function isValidId(id: string | undefined): id is string {
  return !!id && id !== "undefined" && id !== "null" && id.length > 5;
}

export const voiceNoteKeys = {
  all: ["voiceNotes"] as const,
  list: () => [...voiceNoteKeys.all, "list"] as const,
  detail: (id: string) => [...voiceNoteKeys.all, "detail", id] as const,
};

export function useVoiceNotesList() {
  return useQuery({
    queryKey: voiceNoteKeys.list(),
    queryFn: () => voiceNotesService.getAll(),
    staleTime: 30000,
    refetchOnMount: true,
  });
}

export function useVoiceNoteDetail(id: string | undefined) {
  const valid = isValidId(id);
  return useQuery({
    queryKey: voiceNoteKeys.detail(id ?? "__none__"),
    queryFn: () => voiceNotesService.getById(id!),
    enabled: valid,
    staleTime: 10000,
  });
}

export function useVoiceNotePolling(id: string | undefined) {
  const valid = isValidId(id);
  return useQuery({
    queryKey: voiceNoteKeys.detail(id ?? "__none__"),
    queryFn: () => voiceNotesService.getById(id!),
    enabled: valid,
    refetchInterval: (query) => {
      const data = query.state.data as VoiceNote | undefined;
      if (!data) return 3000;
      if (data.status === "completed" || data.status === "failed") return false;
      return 3000;
    },
    staleTime: 0,
  });
}

export function useUploadVoiceNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VoiceNoteUploadPayload) =>
      voiceNotesService.upload(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceNoteKeys.list() });
    },
  });
}

export function useDeleteVoiceNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => voiceNotesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceNoteKeys.list() });
    },
  });
}
