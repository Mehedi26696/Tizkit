import apiClient from "./client";
import type { CopilotChatRequest, CopilotChatResponse } from "@/types/copilot";

export async function copilotChat(payload: CopilotChatRequest): Promise<CopilotChatResponse> {
  const response = await apiClient.post<CopilotChatResponse>("/ai/copilot/chat", payload);
  return response.data;
}
