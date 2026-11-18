import React, { useEffect, useRef, useState } from 'react';
import { Check, Send, Sparkles, X } from 'lucide-react';
import { Button } from '../../components/ui';
import {
  askPathAssistant,
  localPathSuggestion,
  type PathAssistantMessage,
} from '../../data/pathAssistant';

export interface PathAssistantModalProps {
  isOpen: boolean;
  taskTitle: string;
  onClose: () => void;
  onApprove: (steps: string[]) => void;
}

const QUICK_PROMPTS = ['Make it smaller', 'Fewer steps', 'Add research', 'Where do I start?'];

function message(role: PathAssistantMessage['role'], text: string): PathAssistantMessage {
  return {
    id: `path-message-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    role,
    text,
  };
}

export const PathAssistantModal: React.FC<PathAssistantModalProps> = ({
  isOpen,
  taskTitle,
  onClose,
  onApprove,
}) => {
  const [messages, setMessages] = useState<PathAssistantMessage[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const initial = localPathSuggestion(taskTitle, []);
    setMessages([message('assistant', initial.reply)]);
    setSteps(initial.steps);
    setInput('');
    setIsThinking(false);
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [isOpen, taskTitle]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!isOpen) return null;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    const nextMessages = [...messages, message('user', trimmed)];
    setMessages(nextMessages);
    setInput('');
    setIsThinking(true);
    const suggestion = await askPathAssistant(taskTitle, nextMessages);
    setMessages([...nextMessages, message('assistant', suggestion.reply)]);
    setSteps(suggestion.steps);
    setIsThinking(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="path-assistant-title"
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] p-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h2 id="path-assistant-title" className="text-base font-bold text-[var(--ink)]">
                  Path assistant
                </h2>
                <p className="text-[11px] text-[var(--muted)]">
                  Draft a path together. You approve before anything is added.
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close path assistant"
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={scrollRef} className="max-h-64 min-h-32 space-y-2 overflow-y-auto p-4">
          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <p
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  item.role === 'user'
                    ? 'rounded-br-md bg-[var(--accent)] text-white'
                    : 'rounded-bl-md border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)]'
                }`}
              >
                {item.text}
              </p>
            </div>
          ))}
          {isThinking && (
            <p className="text-[11px] text-[var(--muted)]">Drafting a calmer path…</p>
          )}
        </div>

        <div className="border-t border-[var(--line)] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Proposed steps
          </p>
          <ol className="mt-2 max-h-40 space-y-1.5 overflow-y-auto">
            {steps.map((step, index) => (
              <li key={`${step}-${index}`} className="flex items-start gap-2 text-[11px] text-[var(--ink)]">
                <span className="font-mono text-[var(--faint)]">{String(index + 1).padStart(2, '0')}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="border-t border-[var(--line)] p-4">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(prompt)}
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-[10px] font-medium text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
            className="mt-2 flex gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tell it what feels hard…"
              aria-label="Message path assistant"
              className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs text-[var(--ink)] placeholder-[var(--faint)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--dark)] text-white disabled:opacity-40 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <Button
            size="sm"
            variant="primary"
            className="mt-3 w-full"
            disabled={steps.length === 0}
            onClick={() => {
              onApprove(steps);
              onClose();
            }}
          >
            <Check className="h-3.5 w-3.5" /> Approve and add {steps.length} steps
          </Button>
          <p className="mt-2 text-center text-[9px] text-[var(--faint)]">
            Local prototype assistant. Set `VITE_PATH_ASSISTANT_URL` to use a hosted model.
          </p>
        </div>
      </div>
    </div>
  );
};
