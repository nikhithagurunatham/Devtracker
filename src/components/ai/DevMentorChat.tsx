import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Search,
  Globe,
  Database,
  BrainCircuit,
  HelpCircle,
  Code2,
  Trash2,
} from 'lucide-react';
import { AIMode, AIMessageItem } from '@/types';
import { DevTrackStore } from '@/lib/storage';
import { AIService } from '@/lib/ai-service';
import { Button } from '@/components/ui/Button';

export const DevMentorChat: React.FC = () => {
  const [messages, setMessages] = useState<AIMessageItem[]>(DevTrackStore.getAIHistory());
  const [inputMessage, setInputMessage] = useState('');
  const [currentMode, setCurrentMode] = useState<AIMode>('EXPLAIN');
  const [isWebSearch, setIsWebSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = DevTrackStore.addAIMessage({
      role: 'user',
      content: textToSend.trim(),
    });

    setMessages([...DevTrackStore.getAIHistory()]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const result = await AIService.chat(textToSend, currentMode, isWebSearch);

      DevTrackStore.addAIMessage({
        role: 'assistant',
        content: result.response,
        contextData: {
          source: result.source,
          summary: result.contextSummary,
        },
      });

      setMessages([...DevTrackStore.getAIHistory()]);
    } catch (e) {
      DevTrackStore.addAIMessage({
        role: 'assistant',
        content: "I encountered an issue processing that query. Please try again.",
      });
      setMessages([...DevTrackStore.getAIHistory()]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    DevTrackStore.clearAIHistory();
    setMessages([]);
  };

  const quickQuestions = [
    'What am I weak at?',
    'What should I revise today?',
    'Why am I repeatedly failing binary search?',
    'Explain sliding window with dynamic template',
    'Start Amazon SDE-1 mock interview round',
  ];

  return (
    <div className="flex flex-col h-[750px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
            <BrainCircuit size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">DevMentor AI</h3>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Active Memory Synced
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized FAANG & SDE-1 Mentor aware of your confidence & mistakes
            </p>
          </div>
        </div>

        {/* Clear & Search Source Selector */}
        <div className="flex items-center gap-2">
          {/* Source Toggle: MY KNOWLEDGE vs WEB SEARCH */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setIsWebSearch(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                !isWebSearch
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database size={12} />
              <span>My Knowledge</span>
            </button>
            <button
              onClick={() => setIsWebSearch(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                isWebSearch
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe size={12} />
              <span>Web Search</span>
            </button>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Mode Selector Ribbon */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-slate-500 font-semibold uppercase text-[10px] pr-2">Modes:</span>
        {(
          [
            'EXPLAIN',
            'HINT',
            'DEBUG',
            'INTERVIEW',
            'QUIZ',
            'SEARCH_MY_NOTES',
            'CREATE_PLAN',
          ] as AIMode[]
        ).map((m) => (
          <button
            key={m}
            onClick={() => setCurrentMode(m)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              currentMode === m
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            {m.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-indigo-400 border border-slate-700'
                }`}
              >
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                {/* Source Badge if present */}
                {msg.contextData?.source && (
                  <div className="flex items-center gap-1.5 pb-1 border-b border-slate-800/80 text-[10px] font-mono text-slate-400">
                    {msg.contextData.source === 'WEB_SEARCH' ? (
                      <>
                        <Globe size={11} className="text-cyan-400" />
                        <span className="text-cyan-400 font-semibold">WEB RESULTS</span>
                      </>
                    ) : (
                      <>
                        <Database size={11} className="text-indigo-400" />
                        <span className="text-indigo-400 font-semibold">
                          DEVTRACK MEMORY & DATA
                        </span>
                      </>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div
                  className={`text-[10px] font-mono pt-1 ${
                    isUser ? 'text-indigo-200 text-right' : 'text-slate-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-lg">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-indigo-400">
              <Sparkles size={14} className="animate-spin" />
              <span>DevMentor is formulating response with your progress context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-500 font-semibold whitespace-nowrap">Suggested:</span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-lg border border-slate-800 whitespace-nowrap cursor-pointer transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask DevMentor (${currentMode} mode • ${
              isWebSearch ? 'Web Search' : 'My Knowledge'
            })...`}
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputMessage.trim() || isLoading}
            className="rounded-xl px-4"
          >
            <Send size={15} />
          </Button>
        </form>
      </div>
    </div>
  );
};
