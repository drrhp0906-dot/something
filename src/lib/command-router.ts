import type { ChatMessage, JarvisConfig, SearchResult, ReadResult } from '@/types/jarvis';
import { getLLMResponse } from './free-llm';
import { searchWeb } from './tools/web-search';
import { readUrl } from './tools/web-reader';

export interface CommandResult {
  response: string;
  searchResults?: SearchResult[];
  readResult?: ReadResult[];
  widgetAction?: { type: 'add' | 'remove'; widgetType?: string };
}

function detectTools(input: string): { search?: string; readUrl?: string } {
  const lower = input.toLowerCase();
  const tools: { search?: string; readUrl?: string } = {};

  // Detect search queries
  const searchPatterns = [
    /(?:search(?: for)?|look up|find|google|lookup)\s+(.+)/i,
    /(?:what is|who is|tell me about)\s+(.{3,})/i,
  ];

  for (const pattern of searchPatterns) {
    const match = lower.match(pattern);
    if (match && !tools.search) {
      // Don't search for simple greetings or commands
      const query = match[1].replace(/[?.!]+$/, '').trim();
      if (query.length > 2) {
        tools.search = query;
      }
      break;
    }
  }

  // Detect URL reading
  const urlPattern = /(?:read|open|summarize|fetch|check)\s+(https?:\/\/[^\s]+)/i;
  const urlMatch = lower.match(urlPattern);
  if (urlMatch) {
    tools.readUrl = urlMatch[1];
  }

  // Also detect bare URLs
  const bareUrl = input.match(/(https?:\/\/[^\s]+)/);
  if (bareUrl && !tools.readUrl && !tools.search) {
    tools.readUrl = bareUrl[1];
  }

  return tools;
}

export async function processCommand(
  messages: ChatMessage[],
  config: JarvisConfig
): Promise<CommandResult> {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    return { response: '' };
  }

  const input = lastMessage.content;
  const tools = detectTools(input);
  const toolResults: { search?: SearchResult[]; read?: ReadResult } = {};

  // Execute search if detected
  if (tools.search) {
    try {
      toolResults.search = await searchWeb(tools.search);
    } catch {
      toolResults.search = [];
    }
  }

  // Execute URL read if detected
  if (tools.readUrl) {
    try {
      const result = await readUrl(tools.readUrl);
      toolResults.read = result;
    } catch {
      // Will be handled in response
    }
  }

  // Get AI response with tool results
  let response = await getLLMResponse(messages, config, toolResults);

  // Handle special widget commands from builtin AI
  if (response.startsWith('__ADD_WIDGET:')) {
    const widgetType = response.replace('__ADD_WIDGET:', '').replace('__', '') as 'chart' | 'stat' | 'info';
    const personality = config.personality === 'friday' ? 'Friday' : 'Jarvis';
    response = widgetType === 'chart'
      ? `${widgetType} widget deployed to your dashboard. — ${personality}`
      : widgetType === 'stat'
        ? `Statistics widget added to dashboard. — ${personality}`
        : `Info widget added to dashboard. — ${personality}`;
    return {
      response,
      widgetAction: { type: 'add', widgetType },
    };
  }

  if (response === '__REMOVE_WIDGET__') {
    const personality = config.personality === 'friday' ? 'Friday' : 'Jarvis';
    response = `Widget removed from dashboard. — ${personality}`;
    return {
      response,
      widgetAction: { type: 'remove' },
    };
  }

  return {
    response,
    searchResults: toolResults.search,
  };
}
