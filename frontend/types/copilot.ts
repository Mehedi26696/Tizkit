export interface CopilotContext {
  latex?: string;
  selection?: string;
  errors?: string;
  editor_type?: string;
}

export interface CopilotChatRequest {
  message: string;
  context?: CopilotContext;
  provider?: "auto" | "gemini" | "groq";
}

export interface CopilotChatResponse {
  reply: string;
  insert: string;
  target?: string;
  provider: string;
}
