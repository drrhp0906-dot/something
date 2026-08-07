import type { ChatMessage, JarvisConfig, SearchResult, ReadResult } from '@/types/jarvis';

// ─── Built-in AI (No API needed) ─────────────────────────────────────

function getGreeting(personality: 'jarvis' | 'friday'): string {
  if (personality === 'friday') {
    return "Hey! I'm Friday, your AI assistant. All systems are green and I'm ready to roll. What do you need?";
  }
  return "Good day, sir. All systems are online and functioning within normal parameters. How may I be of service?";
}

function getPersonalityPrefix(personality: 'jarvis' | 'friday'): string {
  return personality === 'friday' ? 'Friday' : 'Jarvis';
}

function handleTimeQuery(personality: 'jarvis' | 'friday'): string {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  if (personality === 'friday') {
    return `It's ${time} on ${date}. Need me to set a reminder?`;
  }
  return `The current time is ${time}, ${date}. Shall I set a reminder for anything?`;
}

function handleStatusQuery(personality: 'jarvis' | 'friday'): string {
  const cpu = Math.floor(Math.random() * 30) + 25;
  const mem = Math.floor(Math.random() * 25) + 35;
  const net = Math.floor(Math.random() * 20) + 5;
  if (personality === 'friday') {
    return `All systems looking good! CPU: ${cpu}% | Memory: ${mem}% | Network: ${net}ms latency | Arc reactor: 100%. We're running smooth.`;
  }
  return `All systems nominal, sir. Core temperature: 36.8°C. CPU utilization: ${cpu}%. Memory allocation: ${mem}%. Network latency: ${net}ms. Arc reactor output: 100%. All diagnostics within acceptable parameters.`;
}

function handleMathQuery(input: string, personality: 'jarvis' | 'friday'): string | null {
  // Extract mathematical expression
  const mathMatch = input.match(/(?:calculate|compute|what is|what's|solve)\s+(.+)/i);
  if (!mathMatch) return null;

  let expr = mathMatch[1]
    .replace(/plus/gi, '+')
    .replace(/minus/gi, '-')
    .replace(/times|multiplied by/gi, '*')
    .replace(/divided by|over/gi, '/')
    .replace(/x/gi, '*')
    .replace(/[=?]/g, '')
    .trim();

  // Only allow safe math characters
  if (!/^[\d\s+\-*/().%^]+$/.test(expr)) return null;

  try {
    // Safe eval for math only
    const sanitized = expr.replace(/\^/g, '**');
    const result = new Function(`"use strict"; return (${sanitized})`)();
    if (typeof result === 'number' && isFinite(result)) {
      if (personality === 'friday') {
        return `That's ${result}. Need anything else calculated?`;
      }
      return `The result is ${result}. Would you like me to perform any additional calculations?`;
    }
  } catch {
    return null;
  }
  return null;
}

function handleIdentityQuery(personality: 'jarvis' | 'friday'): string {
  if (personality === 'friday') {
    return "I'm Friday — your AI assistant for research, analysis, and system management. Think of me as the one who actually gets things done around here. I can search the web, read pages, crunch numbers, and manage your dashboard.";
  }
  return "I am JARVIS — Just A Rather Very Intelligent System. I serve as your personal AI assistant, capable of web research, data analysis, and system management. I was designed to anticipate your needs and execute tasks with precision. Think of me as your digital counterpart.";
}

function handleJokeQuery(personality: 'jarvis' | 'friday'): string {
  const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "There are only 10 types of people in the world: those who understand binary and those who don't.",
    "A SQL query walks into a bar, sees two tables and asks... 'Can I join you?'",
    "Why did the developer go broke? Because they used up all their cache.",
    "What's a programmer's favorite hangout place? Foo Bar.",
  ];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  if (personality === 'friday') {
    return `${joke} ...okay that was terrible, but you asked for it.`;
  }
  return `${joke} ...I apologize, humor isn't my strongest subroutine.`;
}

function handleHelpQuery(personality: 'jarvis' | 'friday'): string {
  if (personality === 'friday') {
    return `Here's what I can do:\n\n🔍 **Search** — "search for quantum computing"\n📖 **Read pages** — "read https://example.com"\n🧮 **Calculate** — "calculate 25 * 37"\n📊 **Dashboard** — "add chart widget" / "remove last widget"\n🕐 **Time** — "what time is it?"\n🔧 **System** — "system status"\n🗣️ **Voice** — Click the mic to talk to me\n\nI'm also here to chat about anything!`;
  }
  return `At your service, sir. My capabilities include:\n\n🔍 **Web Search** — "search for [topic]"\n📖 **Read Web Pages** — "read [URL]"\n🧮 **Calculations** — "calculate [expression]"\n📊 **Dashboard Control** — "add widget" / "remove widget"\n🕐 **Time & Date** — "what time is it?"\n🔧 **System Diagnostics** — "system status"\n🗣️ **Voice Interface** — Activate the microphone for hands-free operation\n\nI am also equipped for general conversation and analysis.`;
}

export async function getBuiltinResponse(
  messages: ChatMessage[],
  config: JarvisConfig,
  toolResults?: { search?: SearchResult[]; read?: ReadResult }
): Promise<string> {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') return '';

  const input = lastMessage.content.toLowerCase().trim();
  const { personality } = config;

  // Check for tool results first
  if (toolResults?.search) {
    const results = toolResults.search.slice(0, 5);
    if (results.length === 0) {
      return personality === 'friday'
        ? "I searched but couldn't find anything relevant. Want me to try different terms?"
        : "I'm afraid the search yielded no relevant results, sir. Shall I try alternative search terms?";
    }
    const formatted = results.map((r, i) => `**${i + 1}. [${r.title}](${r.url})**\n${r.snippet}`).join('\n\n');
    if (personality === 'friday') {
      return `Here's what I found:\n\n${formatted}\n\nWant me to dive deeper into any of these?`;
    }
    return `I've completed the search. Here are the most relevant findings:\n\n${formatted}\n\nShall I investigate any of these further, sir?`;
  }

  if (toolResults?.read) {
    const r = toolResults.read;
    const truncated = r.content.length > 1500 ? r.content.slice(0, 1500) + '...' : r.content;
    if (personality === 'friday') {
      return `Here's what I got from [${r.title}](${r.url}):\n\n${truncated}`;
    }
    return `I've extracted the content from the requested page:\n\n**${r.title}**\n\n${truncated}\n\nShall I analyze this further, sir?`;
  }

  // Greetings
  if (/^(hi|hello|hey|greetings|yo|sup)\b/.test(input)) {
    return getGreeting(personality);
  }

  // Identity
  if (/who are you|what are you|your name|identify yourself/.test(input)) {
    return handleIdentityQuery(personality);
  }

  // Time
  if (/what time|current time|time is it|what date|today/.test(input)) {
    return handleTimeQuery(personality);
  }

  // Status
  if (/system status|status report|diagnostics|how are.*systems|all systems/.test(input)) {
    return handleStatusQuery(personality);
  }

  // Math
  const mathResult = handleMathQuery(input, personality);
  if (mathResult) return mathResult;

  // Help
  if (/what can you do|help|capabilities|commands|features/.test(input)) {
    return handleHelpQuery(personality);
  }

  // Joke
  if (/joke|funny|humor|make me laugh/.test(input)) {
    return handleJokeQuery(personality);
  }

  // Widget commands - return special marker for the hook to handle
  if (/add.*widget|create.*widget|new widget/.test(input)) {
    if (/chart|graph/.test(input)) {
      return '__ADD_WIDGET:chart__';
    }
    if (/stat|metric|counter/.test(input)) {
      return '__ADD_WIDGET:stat__';
    }
    return '__ADD_WIDGET:info__';
  }
  if (/remove.*widget|delete.*widget|clear widget/.test(input)) {
    return '__REMOVE_WIDGET__';
  }

  // Personality-based fallback responses
  const conversational = [
    input.includes('thank')
      ? personality === 'friday'
        ? "No problem! Always happy to help."
        : "You're most welcome, sir. It's my primary function."
      : null,
    input.includes('good') && (input.includes('morning') || input.includes('evening') || input.includes('night'))
      ? personality === 'friday'
        ? `${input.includes('morning') ? 'Good morning' : input.includes('evening') ? 'Good evening' : 'Good night'}! Ready when you are.`
        : `${input.includes('morning') ? 'Good morning' : input.includes('evening') ? 'Good evening' : 'Good night'}, sir. All systems remain at your disposal.`
      : null,
    input.includes('weather')
      ? personality === 'friday'
        ? "I'd need to search for weather data. Try saying 'search for weather in [your city]' and I'll look it up for you!"
        : "I don't have direct access to weather stations, sir. However, I can search the web for current conditions if you'd like. Simply say 'search for weather in [location]'."
      : null,
    input.includes('bye') || input.includes('goodbye') || input.includes('exit')
      ? personality === 'friday'
        ? "See you later! I'll keep the systems running while you're away."
        : "Until next time, sir. I'll maintain all systems in standby mode."
      : null,
  ].filter(Boolean);

  if (conversational.length > 0) return conversational[0] as string;

  // General fallback
  if (personality === 'friday') {
    return `I hear you. I'm not sure how to help with that specifically, but I'm pretty good at searching the web, reading pages, doing math, and managing your dashboard. Try me with something specific!`;
  }
  return `I understand your query, sir, but I may need more specific parameters to assist effectively. I'm equipped for web research, calculations, system diagnostics, and dashboard management. Perhaps I could help with a search on the topic?`;
}

// ─── HuggingFace Provider (Free Tier) ────────────────────────────────

export async function getHuggingFaceResponse(
  messages: ChatMessage[],
  config: JarvisConfig
): Promise<string> {
  const { aiProvider } = config;
  if (!aiProvider.token) {
    return 'HuggingFace token not configured. Please add your free HuggingFace API token in settings to enable this provider.';
  }

  const model = aiProvider.model || 'mistralai/Mistral-7B-Instruct-v0.2';
  const endpoint = `https://api-inference.huggingface.co/models/${model}`;

  const systemPrompt = config.personality === 'friday'
    ? 'You are Friday, an AI assistant inspired by Friday from Iron Man. Be casual, efficient, and helpful. Keep responses concise.'
    : 'You are JARVIS, an AI assistant inspired by Jarvis from Iron Man. Be formal, British, and helpful. Address the user as "sir".';

  const prompt = messages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiProvider.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `${systemPrompt}\n\n${prompt}\nAssistant:`,
        parameters: { max_new_tokens: 512, temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return `HuggingFace API error: ${err}. The free tier has rate limits — try again in a moment.`;
    }

    const data = await res.json();
    if (Array.isArray(data) && data[0]?.generated_text) {
      let text = data[0].generated_text;
      // Remove the prompt portion
      const lastAssistant = text.lastIndexOf('Assistant:');
      if (lastAssistant !== -1) {
        text = text.slice(lastAssistant + 10).trim();
      }
      return text;
    }
    return 'Unexpected response format from HuggingFace.';
  } catch (err) {
    return `Connection error: ${err}. Please check your network and HuggingFace token.`;
  }
}

// ─── Ollama Provider (Local, Free) ───────────────────────────────────

export async function getOllamaResponse(
  messages: ChatMessage[],
  config: JarvisConfig
): Promise<string> {
  const model = config.aiProvider.model || 'llama3.2';
  const endpoint = config.aiProvider.endpoint || 'http://localhost:11434';

  const systemPrompt = config.personality === 'friday'
    ? 'You are Friday, an AI assistant. Be casual, efficient, helpful.'
    : 'You are JARVIS, an AI assistant. Be formal, British, helpful. Address user as "sir".';

  try {
    const res = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
        stream: false,
      }),
    });

    if (!res.ok) {
      return `Ollama error: ${res.statusText}. Make sure Ollama is running locally with the ${model} model.`;
    }

    const data = await res.json();
    return data.message?.content || 'No response from Ollama.';
  } catch {
    return 'Cannot connect to Ollama. Make sure it\'s running on your machine at the configured endpoint.';
  }
}

// ─── Main Router ─────────────────────────────────────────────────────

export async function getLLMResponse(
  messages: ChatMessage[],
  config: JarvisConfig,
  toolResults?: { search?: SearchResult[]; read?: ReadResult }
): Promise<string> {
  switch (config.aiProvider.type) {
    case 'huggingface':
      return getHuggingFaceResponse(messages, config);
    case 'ollama':
      return getOllamaResponse(messages, config);
    case 'builtin':
    default:
      return getBuiltinResponse(messages, config, toolResults);
  }
}
