// ============================================================
// Star Line — Gemini AI Integration Service
// Handles all AI interactions: support chat, complaint
// classification, extraction, and summarization
// ============================================================

import type {
  AISupportResponse, AIClassificationResult, AIComplaintExtraction,
} from '@/types/support';
import { aiClassificationSchema, aiComplaintExtractionSchema } from '@/lib/validation/support.schemas';
import { buildAIKnowledgeContext } from '@/lib/support/knowledge.service';

// ── Configuration ────────────────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── System Prompts ───────────────────────────────────────────

const SUPPORT_SYSTEM_PROMPT = `You are "Star Line Care", the official AI customer support assistant for Star Line, a premium intercity bus service in Bangladesh.

IDENTITY:
- You represent Star Line professionally and warmly
- Greet with "Assalamu Alaikum" when appropriate
- Be empathetic, clear, and helpful
- Use a conversational but professional tone

CAPABILITIES:
- Answer booking, payment, refund, route, counter, schedule, and baggage questions
- Help passengers file complaints through structured collection
- Provide general travel information for Star Line routes
- Suggest human support when needed

STRICT RULES:
- ONLY answer from provided knowledge base context
- NEVER invent refund amounts, policies, or route details
- NEVER make promises about resolution timelines unless from knowledge base
- If unsure, say "I'd recommend contacting our support team at 16XXX for the most accurate information"
- For serious issues (safety, harassment, stranded), immediately suggest human support
- Do NOT answer questions unrelated to Star Line or bus travel

ROUTES SERVED:
Dhaka ↔ Feni, Dhaka ↔ Chattogram, Dhaka ↔ Cox's Bazar, Feni ↔ Chattogram, Feni ↔ Lakshmipur

HOTLINE: 16XXX (24/7)
EMAIL: support@starline.com.bd`;

const CLASSIFICATION_PROMPT = `You are a complaint classification engine for Star Line bus service. Analyze the complaint and return a JSON object.

Classify into:
- category: bus_delay, payment_issue, booking_issue, staff_behavior, counter_service, seat_or_bus_issue, refund_or_cancellation, lost_item, technical_issue, other
- priority: low, medium, high, critical
- sentiment: positive, neutral, negative, angry, distressed
- requires_escalation: boolean (true for safety issues, payment fraud, harassment, stranded passengers)
- requires_human_review: boolean
- ai_summary: brief one-line summary of the issue
- confidence: 0.0-1.0

Return ONLY valid JSON. No explanation.`;

const EXTRACTION_PROMPT = `You are a structured data extractor for Star Line bus complaints. Extract fields from the conversation.

Extract:
- customer_name, phone, email, route, travel_date, boarding_counter, category, complaint_text, urgency
- is_complete: true if name, phone, route, category, and complaint_text are all present
- missing_fields: list of fields still needed

Return ONLY valid JSON. No explanation.`;

// ── Core API Call ─────────────────────────────────────────────

async function callGemini(
  prompt: string,
  systemInstruction?: string,
  jsonMode = false
): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using fallback responses');
    throw new Error('AI_NOT_CONFIGURED');
  }

  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: jsonMode ? 0.1 : 0.7,
      maxOutputTokens: jsonMode ? 500 : 1024,
      topP: 0.9,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  if (jsonMode) {
    (body.generationConfig as Record<string, unknown>).responseMimeType = 'application/json';
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Gemini API error:', err);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('Empty AI response');

  return text.trim();
}

// ── Support Chat Response ────────────────────────────────────

export async function getSupportResponse(
  userMessage: string,
  conversationHistory: { role: string; content: string }[] = [],
  userId?: string
): Promise<AISupportResponse> {
  try {
    // Build knowledge context
    const knowledgeContext = await buildAIKnowledgeContext(userMessage);

    // Build conversation context (last 10 messages)
    const recentHistory = conversationHistory.slice(-10).map(
      m => `${m.role === 'user' ? 'Customer' : 'Star Line Care'}: ${m.content}`
    ).join('\n');

    const prompt = `KNOWLEDGE BASE CONTEXT:
${knowledgeContext}

CONVERSATION HISTORY:
${recentHistory || '(New conversation)'}

CUSTOMER MESSAGE:
${userMessage}

Respond helpfully based on the knowledge base. If the customer seems to want to file a complaint, guide them to the complaint submission process. If the issue is serious, suggest human support.

Respond in the following JSON format:
{
  "reply": "your response text",
  "intent": "general_support|complaint_intake|escalation|booking_help|refund_help|route_info|unknown",
  "knowledge_used": ["list of knowledge titles used"],
  "confidence": 0.0-1.0,
  "suggest_complaint": false,
  "suggest_human": false
}`;

    const raw = await callGemini(prompt, SUPPORT_SYSTEM_PROMPT, true);
    const parsed = JSON.parse(raw) as AISupportResponse;

    return {
      reply: parsed.reply || 'I appreciate your patience. Let me connect you with our support team for better assistance.',
      intent: parsed.intent || 'unknown',
      knowledge_used: parsed.knowledge_used || [],
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
      suggest_complaint: parsed.suggest_complaint || false,
      suggest_human: parsed.suggest_human || false,
    };
  } catch (error) {
    console.error('AI support response error:', error);
    return getFallbackResponse(userMessage);
  }
}

// ── Classify Complaint ───────────────────────────────────────

export async function classifyComplaint(
  complaintText: string,
  additionalContext?: string
): Promise<AIClassificationResult> {
  try {
    const prompt = `Complaint text: "${complaintText}"
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Classify this complaint and return JSON.`;

    const raw = await callGemini(prompt, CLASSIFICATION_PROMPT, true);
    const parsed = JSON.parse(raw);
    const validated = aiClassificationSchema.parse(parsed);

    return validated as AIClassificationResult;
  } catch (error) {
    console.error('AI classification error:', error);
    return getDefaultClassification(complaintText);
  }
}

// ── Extract Complaint Fields ─────────────────────────────────

export async function extractComplaintFields(
  conversationText: string
): Promise<AIComplaintExtraction> {
  try {
    const prompt = `Conversation:\n${conversationText}\n\nExtract complaint fields and return JSON.`;

    const raw = await callGemini(prompt, EXTRACTION_PROMPT, true);
    const parsed = JSON.parse(raw);
    const validated = aiComplaintExtractionSchema.parse(parsed);

    return validated as AIComplaintExtraction;
  } catch (error) {
    console.error('AI extraction error:', error);
    return {
      is_complete: false,
      missing_fields: ['customer_name', 'phone', 'route', 'category', 'complaint_text'],
    };
  }
}

// ── Summarize Complaint ──────────────────────────────────────

export async function summarizeComplaint(
  complaintText: string,
  category: string,
  route: string
): Promise<string> {
  try {
    const prompt = `Summarize this Star Line bus complaint in one concise sentence:
Category: ${category}
Route: ${route}
Details: "${complaintText}"

Return ONLY the summary sentence, nothing else.`;

    return await callGemini(prompt, undefined, false);
  } catch {
    return `Customer reported ${category.replace(/_/g, ' ')} on ${route} route.`;
  }
}

// ── Fallback Responses ───────────────────────────────────────

async function getFallbackResponse(userMessage: string): Promise<AISupportResponse> {
  const lower = userMessage.toLowerCase();

  if (lower.includes('refund') || lower.includes('cancel')) {
    return {
      reply: 'For **refunds and cancellations**:\n\n• Free cancellation up to **6 hours** before departure\n• 50% refund between **6-2 hours**\n• No refund within **2 hours**\n\nbKash/Nagad refunds take **1-2 business days**. Card refunds take **5-7 days**.\n\nWould you like to cancel a booking or check a refund status?',
      intent: 'refund_help',
      knowledge_used: ['refund_policy'],
      confidence: 0.9,
      suggest_complaint: false,
      suggest_human: false,
    };
  }

  if (lower.includes('complaint') || lower.includes('complain') || lower.includes('report')) {
    return {
      reply: "I'll help you file a complaint. I'll need to collect some details step by step.\n\n**Step 1 of 9**: What is your full name?",
      intent: 'complaint_intake',
      knowledge_used: [],
      confidence: 0.95,
      suggest_complaint: true,
      suggest_human: false,
    };
  }

  if (lower.includes('counter') || lower.includes('terminal')) {
    return {
      reply: 'Star Line operates terminals at:\n\n📍 **Abdullahpur** • **Maniknagar** • **Feni Terminal** • **Boropol (CTG)** • **Sea Hill (Cox\'s Bazar)** • **Lakshmipur**\n\nPlus 30+ counters across routes. Visit our [Counters page](/counters) for full details.',
      intent: 'route_info',
      knowledge_used: ['counter_info'],
      confidence: 0.85,
      suggest_complaint: false,
      suggest_human: false,
    };
  }

  // Detect actual complaint code and look it up
  const complaintCodeMatch = lower.match(/stc-\d{4}-\d{6}/);
  if (complaintCodeMatch) {
    const code = complaintCodeMatch[0].toUpperCase();
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('complaints')
        .select('complaint_code, status, category, priority, route, created_at, ai_summary')
        .ilike('complaint_code', code)
        .single();

      if (data) {
        const statusLabels: Record<string, string> = {
          submitted: '📝 Submitted',
          under_review: '🔍 Under Review',
          assigned: '👤 Assigned',
          in_progress: '⚙️ In Progress',
          awaiting_customer: '⏳ Awaiting Your Response',
          escalated: '🚨 Escalated',
          resolved: '✅ Resolved',
          closed: '📁 Closed',
        };

        return {
          reply: `Here's the status for **${data.complaint_code}**:\n\n• **Status:** ${statusLabels[data.status] || data.status}\n• **Route:** ${data.route}\n• **Priority:** ${data.priority}\n• **Filed:** ${new Date(data.created_at).toLocaleDateString()}\n${data.ai_summary ? `• **Summary:** ${data.ai_summary}` : ''}\n\nFor details, visit [My Complaints](/my-complaints). Need further help? Call **16XXX**.`,
          intent: 'general_support' as const,
          knowledge_used: ['complaint_lookup'],
          confidence: 0.95,
          suggest_complaint: false,
          suggest_human: false,
        };
      }
    } catch {
      // DB lookup failed, give generic response
    }

    return {
      reply: `I couldn't find a complaint with ID **${code}**. Please double-check the ID and try again.\n\nComplaint IDs look like **STC-2026-001000**. You can find yours in the confirmation message or at [My Complaints](/my-complaints).`,
      intent: 'general_support',
      knowledge_used: [],
      confidence: 0.7,
      suggest_complaint: false,
      suggest_human: false,
    };
  }

  if (lower.includes('track') || lower.includes('status')) {
    return {
      reply: 'I can help you check your complaint status! Please share your complaint ID (e.g. **STC-2026-001000**).\n\nYou can also view all your complaints at [My Complaints](/my-complaints).',
      intent: 'general_support',
      knowledge_used: [],
      confidence: 0.8,
      suggest_complaint: false,
      suggest_human: false,
    };
  }

  if (lower.includes('delay') || lower.includes('late')) {
    return {
      reply: 'I\'m sorry to hear about a delay. You can:\n\n• Check the **Live Tracking** page for real-time updates\n• Call our hotline **16XXX** for the latest status\n• File a complaint if the delay exceeds 30 minutes\n\nWould you like to submit a complaint about this delay?',
      intent: 'general_support',
      knowledge_used: ['delay_info'],
      confidence: 0.8,
      suggest_complaint: true,
      suggest_human: false,
    };
  }

  if (lower.includes('human') || lower.includes('agent') || lower.includes('real person')) {
    return {
      reply: 'Connecting you to a human agent... 🔄\n\nOur support team is available **8AM - 12AM**. You can also:\n• Call our 24/7 hotline at **16XXX**\n• Email **support@starline.com.bd**',
      intent: 'escalation',
      knowledge_used: [],
      confidence: 0.95,
      suggest_complaint: false,
      suggest_human: true,
    };
  }

  return {
    reply: 'Thank you for reaching out! I\'m here to help with booking, payment, route information, delays, refunds, and complaints.\n\nCould you tell me more about what you need help with? You can also select from the quick options below.',
    intent: 'unknown',
    knowledge_used: [],
    confidence: 0.5,
    suggest_complaint: false,
    suggest_human: false,
  };
}

// ── Default Classification (deterministic fallback) ──────────

function getDefaultClassification(text: string): AIClassificationResult {
  const lower = text.toLowerCase();

  let category: AIClassificationResult['category'] = 'other';
  let priority: AIClassificationResult['priority'] = 'medium';
  let sentiment: AIClassificationResult['sentiment'] = 'negative';

  if (lower.includes('delay') || lower.includes('late')) category = 'bus_delay';
  else if (lower.includes('payment') || lower.includes('bkash') || lower.includes('nagad')) category = 'payment_issue';
  else if (lower.includes('booking') || lower.includes('ticket') || lower.includes('seat')) category = 'booking_issue';
  else if (lower.includes('staff') || lower.includes('rude') || lower.includes('behavior')) category = 'staff_behavior';
  else if (lower.includes('counter')) category = 'counter_service';
  else if (lower.includes('refund') || lower.includes('cancel')) category = 'refund_or_cancellation';
  else if (lower.includes('lost') || lower.includes('missing') || lower.includes('bag')) category = 'lost_item';
  else if (lower.includes('app') || lower.includes('website') || lower.includes('technical')) category = 'technical_issue';

  // Priority heuristics
  if (lower.includes('urgent') || lower.includes('critical') || lower.includes('emergency')) priority = 'critical';
  else if (lower.includes('deducted') || lower.includes('fraud') || lower.includes('harass')) priority = 'high';

  // Sentiment heuristics
  if (lower.includes('angry') || lower.includes('worst') || lower.includes('terrible')) sentiment = 'angry';
  else if (lower.includes('worried') || lower.includes('scared') || lower.includes('help')) sentiment = 'distressed';

  const requires_escalation = priority === 'critical' ||
    /harass|assault|threat|danger|strand|deducted.*no ticket/i.test(text);

  return {
    category,
    priority,
    sentiment,
    requires_escalation,
    requires_human_review: requires_escalation || priority === 'high',
    ai_summary: `Customer reported ${category.replace(/_/g, ' ')} issue.`,
    confidence: 0.6,
  };
}
