import { NextRequest, NextResponse } from 'next/server';
import { processCommand } from '@/lib/command-router';
import type { ChatMessage, JarvisConfig } from '@/types/jarvis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, config } = body as { messages: ChatMessage[]; config: JarvisConfig };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const result = await processCommand(messages, config);

    return NextResponse.json({
      response: result.response,
      searchResults: result.searchResults,
      readResult: result.readResult,
      widgetAction: result.widgetAction,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', response: 'I apologize, but I encountered a processing error. Please try again.' },
      { status: 500 }
    );
  }
}
