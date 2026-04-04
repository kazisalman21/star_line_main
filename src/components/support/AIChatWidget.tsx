// ============================================================
// Star Line Care — AI Chat Widget
// Floating chat button + panel with Gemini AI + complaint flow
// Adapted from starline-wayfinder, integrated with real DB
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, ChevronLeft, Loader2,
  Phone, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import AIConciergeAvatar from './AIConciergeAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { useSupportSession, useSendMessage, useCreateComplaint } from '@/hooks/useSupport';
import { CHAT_SUGGESTION_CHIPS, COMPLAINT_INTAKE_STEPS, COMPLAINT_CATEGORY_LABELS, STARLINE_ROUTES, STARLINE_COUNTERS } from '@/constants/support';
import type { ComplaintCategory, CreateComplaintRequest } from '@/types/support';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  chips?: string[];
}

// ── Complaint Flow State ─────────────────────────────────────

interface ComplaintFlowState {
  active: boolean;
  step: number;
  data: {
    name?: string;
    phone?: string;
    route?: string;
    travelDate?: string;
    counter?: string;
    category?: string;
    details?: string;
    urgency?: string;
  };
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [complaintFlow, setComplaintFlow] = useState<ComplaintFlowState>({
    active: false,
    step: 0,
    data: {},
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const { data: session } = useSupportSession();
  const sendMessage = useSendMessage();
  const createComplaint = useCreateComplaint();

  // ── Scroll to bottom ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Focus input when opened ─────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ── Keyboard shortcut (Escape to close) ─────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  // ── Initial greeting ────────────────────────────────────────
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: ChatMessage = {
        id: 'greeting',
        text: user
          ? `Assalamu Alaikum, **${user.user_metadata?.full_name || 'valued passenger'}**! 👋\n\nI'm **Star Line Care**, your AI support assistant. How can I help you today?`
          : "Assalamu Alaikum! 👋\n\nI'm **Star Line Care**, your AI support assistant. I can help with bookings, payments, routes, delays, refunds, and complaints.\n\nHow can I help you today?",
        sender: 'ai',
        timestamp: new Date(),
        chips: [...CHAT_SUGGESTION_CHIPS],
      };
      setMessages([greeting]);
    }
  }, [isOpen, messages.length, user]);

  // ── Add a message ───────────────────────────────────────────
  const addMsg = useCallback(
    (text: string, sender: 'user' | 'ai' | 'system', chips?: string[]) => {
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          text,
          sender,
          timestamp: new Date(),
          chips,
        },
      ]);
    },
    []
  );

  // ── Handle Complaint Flow Step ──────────────────────────────
  const handleComplaintStep = useCallback(
    async (input: string) => {
      const step = COMPLAINT_INTAKE_STEPS[complaintFlow.step];
      if (!step) return;

      const newData = { ...complaintFlow.data };

      switch (step.key) {
        case 'name':
          newData.name = input;
          break;
        case 'phone':
          if (!/^[\d+\-() ]{10,15}$/.test(input.replace(/\s/g, ''))) {
            addMsg('Please enter a valid phone number (10-15 digits).', 'ai');
            return;
          }
          newData.phone = input;
          break;
        case 'route':
          newData.route = input;
          break;
        case 'travelDate':
          newData.travelDate = input || undefined;
          break;
        case 'counter':
          newData.counter = input || undefined;
          break;
        case 'category':
          newData.category = input;
          break;
        case 'details':
          if (input.length < 10) {
            addMsg('Please describe your issue in more detail (at least 10 characters).', 'ai');
            return;
          }
          newData.details = input;
          break;
        case 'urgency':
          newData.urgency = input;
          break;
        case 'confirm':
          if (input.toLowerCase() === 'yes' || input.toLowerCase() === 'confirm') {
            await submitComplaint(newData);
            return;
          } else {
            addMsg("No problem. You can modify your complaint or start over. Type 'restart' to begin again.", 'ai');
            return;
          }
      }

      const nextStep = complaintFlow.step + 1;

      if (nextStep >= COMPLAINT_INTAKE_STEPS.length) {
        // Show confirmation
        const summary = `📋 **Complaint Summary:**\n\n• **Name:** ${newData.name}\n• **Phone:** ${newData.phone}\n• **Route:** ${newData.route}\n${newData.travelDate ? `• **Travel Date:** ${newData.travelDate}\n` : ''}${newData.counter ? `• **Counter:** ${newData.counter}\n` : ''}• **Category:** ${newData.category}\n• **Details:** ${newData.details}\n• **Urgency:** ${newData.urgency}\n\nType **"confirm"** to submit or **"restart"** to start over.`;
        addMsg(summary, 'ai');
        setComplaintFlow({ active: true, step: nextStep, data: newData });
        return;
      }

      setComplaintFlow({ active: true, step: nextStep, data: newData });

      const next = COMPLAINT_INTAKE_STEPS[nextStep];
      let prompt = `**Step ${nextStep + 1} of ${COMPLAINT_INTAKE_STEPS.length}**: ${next.label}`;
      if (!next.required) prompt += ' *(optional — type "skip" to skip)*';

      const chips =
        next.type === 'select'
          ? next.options
          : next.type === 'chips'
            ? next.options
            : undefined;

      addMsg(prompt, 'ai', chips as string[] | undefined);
    },
    [complaintFlow, addMsg]
  );

  // ── Submit Complaint to DB ──────────────────────────────────
  const submitComplaint = async (data: ComplaintFlowState['data']) => {
    setIsTyping(true);

    // Map display label back to category key
    const categoryEntry = Object.entries(COMPLAINT_CATEGORY_LABELS).find(
      ([, label]) => label === data.category
    );
    const categoryKey = (categoryEntry?.[0] || 'other') as ComplaintCategory;

    const urgencyMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      Low: 'low',
      Medium: 'medium',
      High: 'high',
      Critical: 'critical',
    };

    const request: CreateComplaintRequest = {
      customer_name: data.name!,
      phone: data.phone!,
      route: data.route!,
      travel_date: data.travelDate,
      boarding_counter: data.counter,
      category: categoryKey,
      complaint_text: data.details!,
      urgency: urgencyMap[data.urgency || 'Medium'] || 'medium',
      user_id: user?.id,
      session_id: session?.id,
    };

    try {
      const result = await createComplaint.mutateAsync(request);
      addMsg(
        `✅ **Complaint Submitted Successfully!**\n\n🎫 Your complaint ID: **${result.complaint_code}**\n\nSave this ID to track your complaint status. Our team will review and respond within **24 hours**.\n\nYou can check your complaint status anytime at [My Complaints](/my-complaints).`,
        'ai'
      );
    } catch (error) {
      addMsg(
        '❌ Sorry, there was an issue submitting your complaint. Please try again or call our hotline at **16XXX**.',
        'ai'
      );
    }

    setComplaintFlow({ active: false, step: 0, data: {} });
    setIsTyping(false);
  };

  // ── Start Complaint Flow ────────────────────────────────────
  const startComplaintFlow = () => {
    setComplaintFlow({ active: true, step: 0, data: {} });

    // Auto-fill from auth if available
    const autoData: ComplaintFlowState['data'] = {};
    if (user?.user_metadata?.full_name) {
      autoData.name = user.user_metadata.full_name;
    }

    const firstStep = COMPLAINT_INTAKE_STEPS[0];

    if (autoData.name) {
      addMsg(
        `I'll help you file a complaint. I see your name is **${autoData.name}**.\n\n**Step 2 of ${COMPLAINT_INTAKE_STEPS.length}**: Phone Number`,
        'ai'
      );
      setComplaintFlow({ active: true, step: 1, data: autoData });
    } else {
      addMsg(
        `I'll help you file a complaint. I'll need a few details.\n\n**Step 1 of ${COMPLAINT_INTAKE_STEPS.length}**: ${firstStep.label}`,
        'ai'
      );
    }
  };

  // ── Handle Send ─────────────────────────────────────────────
  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    setInputValue('');
    addMsg(text, 'user');

    // Handle complaint flow
    if (complaintFlow.active) {
      if (text.toLowerCase() === 'cancel' || text.toLowerCase() === 'exit') {
        setComplaintFlow({ active: false, step: 0, data: {} });
        addMsg('Complaint cancelled. How else can I help?', 'ai', [...CHAT_SUGGESTION_CHIPS]);
        return;
      }
      if (text.toLowerCase() === 'skip') {
        handleComplaintStep('');
        return;
      }
      if (text.toLowerCase() === 'restart') {
        setComplaintFlow({ active: false, step: 0, data: {} });
        startComplaintFlow();
        return;
      }
      await handleComplaintStep(text);
      return;
    }

    // Check for complaint trigger
    if (/submit complaint|file complaint|complain|report issue/i.test(text)) {
      startComplaintFlow();
      return;
    }

    // Normal AI chat
    setIsTyping(true);
    try {
      const history = messages
        .filter(m => m.sender !== 'system')
        .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

      if (session?.id) {
        const result = await sendMessage.mutateAsync({
          sessionId: session.id,
          message: text,
          conversationHistory: history,
          userId: user?.id,
        });

        const chips: string[] = [];
        if (result.aiResponse.suggest_complaint) chips.push('Submit complaint');
        if (result.aiResponse.suggest_human) chips.push('Talk to support');

        addMsg(result.aiResponse.reply, 'ai', chips.length > 0 ? chips : undefined);
      } else {
        // Fallback if no session
        addMsg(
          "Thank you for your message. I'm setting up our connection — please try again in a moment.",
          'ai'
        );
      }
    } catch {
      addMsg(
        "I'm having trouble connecting right now. Please try again or call **16XXX** for immediate help.",
        'ai'
      );
    }
    setIsTyping(false);
  };

  // ── Handle Chip Click ───────────────────────────────────────
  const handleChipClick = (chip: string) => {
    if (complaintFlow.active) {
      setInputValue(chip);
      addMsg(chip, 'user');
      handleComplaintStep(chip);
      return;
    }
    if (chip === 'Submit complaint') {
      addMsg(chip, 'user');
      startComplaintFlow();
      return;
    }
    setInputValue(chip);
    handleSend();
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="ai-chat-button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center group"
            aria-label="Open Star Line Care chat"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-4rem)] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden sm:bottom-6 sm:right-6 max-sm:inset-2 max-sm:w-auto max-sm:h-auto max-sm:max-w-none max-sm:max-h-none max-sm:rounded-xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-b border-border/30">
              <AIConciergeAvatar size="sm" showOnline />
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm font-bold leading-tight">Star Line Care</h3>
                <p className="text-xs text-muted-foreground leading-tight">AI Assistant • Always here</p>
              </div>
              {complaintFlow.active && (
                <button
                  onClick={() => {
                    setComplaintFlow({ active: false, step: 0, data: {} });
                    addMsg('Complaint cancelled.', 'system');
                  }}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Cancel complaint"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Complaint Progress Bar */}
            {complaintFlow.active && (
              <div className="px-4 py-1.5 bg-accent/5 border-b border-border/20">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="w-3 h-3 text-accent" />
                  <span>Filing Complaint</span>
                  <span className="ml-auto font-mono">
                    {Math.min(complaintFlow.step + 1, COMPLAINT_INTAKE_STEPS.length)}/{COMPLAINT_INTAKE_STEPS.length}
                  </span>
                </div>
                <div className="mt-1 h-1 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((complaintFlow.step + 1) / COMPLAINT_INTAKE_STEPS.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && <AIConciergeAvatar size="xs" showOnline={false} showGlow={false} />}
                  <div className="max-w-[85%] space-y-1.5">
                    <div
                      className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : msg.sender === 'system'
                            ? 'bg-muted text-muted-foreground text-xs italic rounded-bl-md'
                            : 'bg-secondary/60 text-foreground rounded-bl-md'
                      }`}
                    >
                      {/* Simple markdown-like rendering */}
                      {msg.text.split('\n').map((line, i) => (
                        <span key={i}>
                          {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                            part.startsWith('**') && part.endsWith('**') ? (
                              <strong key={j}>{part.slice(2, -2)}</strong>
                            ) : (
                              <span key={j}>{part}</span>
                            )
                          )}
                          {i < msg.text.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    {/* Suggestion Chips */}
                    {msg.chips && msg.chips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.chips.map(chip => (
                          <button
                            key={chip}
                            onClick={() => handleChipClick(chip)}
                            className="px-2.5 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-full border border-primary/20 transition-colors whitespace-nowrap"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 items-center"
                >
                  <AIConciergeAvatar size="xs" showOnline={false} showGlow={false} />
                  <div className="bg-secondary/60 px-3 py-2 rounded-xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-3 py-2.5 border-t border-border/30 bg-card">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={
                    complaintFlow.active
                      ? ('placeholder' in (COMPLAINT_INTAKE_STEPS[complaintFlow.step] || {}) ? (COMPLAINT_INTAKE_STEPS[complaintFlow.step] as any).placeholder : 'Type your answer...')
                      : 'Ask Star Line Care...'
                  }
                  className="flex-1 bg-secondary/40 border border-border/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
                  aria-label="Send message"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
              <div className="flex items-center justify-between mt-1.5 px-1">
                <span className="text-[10px] text-muted-foreground/50">Powered by Gemini AI</span>
                <button
                  onClick={() => {
                    window.open('tel:16XXX');
                  }}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-primary transition-colors"
                >
                  <Phone className="w-2.5 h-2.5" />
                  16XXX
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
