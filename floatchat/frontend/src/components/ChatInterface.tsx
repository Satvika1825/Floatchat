import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Waves, Send, Trash2 } from "lucide-react";
import { ArgoFloatCard } from "./ArgoFloatCard";

import { ApiDataVisualization, ProfileSummaryCard } from "./ApiDataVisualization";
import { VisualizationDialog } from "./VisualizationDialog";
import { ApiQueryResponse } from "@/services/types";
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  data?: unknown;
  apiResponse?: ApiQueryResponse;
  error?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
}

const MESSAGES_STORAGE_KEY = "floatchat_messages";

export const ChatInterface = ({ messages, onSendMessage }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load messages from localStorage on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (stored) {
        const parsedMessages = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        parsedMessages.forEach((msg: Message) => {
          msg.timestamp = new Date(msg.timestamp);
        });
        setStoredMessages(parsedMessages);
        // Loaded messages from localStorage
      }
    } catch (error) {
      // Console output removed
    }
  }, []);
  
  // Combine stored messages with current messages, avoiding duplicates
  const allMessages = React.useMemo(() => {
    const messageMap = new Map();
    
    // Add stored messages first
    storedMessages.forEach(msg => messageMap.set(msg.id, msg));
    
    // Add current messages (will overwrite any duplicates)
    messages.forEach(msg => messageMap.set(msg.id, msg));
    
    return Array.from(messageMap.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [storedMessages, messages]);
  
  // Save messages to localStorage whenever allMessages changes
  useEffect(() => {
    if (allMessages.length > 0) {
      try {
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
        // Saved messages to localStorage
      } catch (error) {
        // Console output removed
      }
    }
  }, [allMessages]);

  // Auto-scroll disabled to prevent unwanted scrolling on Enter
  // useEffect(() => {
  //   if (didMount.current) {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   } else {
  //     didMount.current = true;
  //   }
  // }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // For debugging - clear stored messages
  const clearStoredMessages = () => {
    localStorage.removeItem(MESSAGES_STORAGE_KEY);
    setStoredMessages([]);
    // Cleared stored messages
  };

  return (
    <div className="flex flex-col h-full bg-depth">
      {/* Header */}

      <div className="p-3 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-ocean">
              <Waves className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">FloatChat AI</h2>
              <p className="text-xs text-muted-foreground">Oceanographic Data Assistant</p>
            </div>
          </div>
          <Button
            onClick={clearStoredMessages}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear History
          </Button>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {allMessages.map((message) => (
          <div key={message.id} className="animate-fade-in group">
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
              <div className={`relative max-w-[85%] ${message.type === 'user'
                  ? 'bg-ocean text-primary-foreground shadow-lg'
                  : 'bg-card border border-border shadow-sm hover:shadow-md transition-shadow'
                } ${message.type === 'user' ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md'} p-4`}>
                
                {/* Message content */}
                <div className="relative">
                  <p className="text-sm leading-relaxed">
                    {message.content}
                  </p>
                  
                  {/* Timestamp - always visible on the outside */}
                </div>

                {/* Message tail */}
                <div className={`absolute bottom-0 ${message.type === 'user' 
                  ? 'right-0 translate-x-0 border-l-8 border-t-8 border-l-transparent border-t-ocean' 
                  : 'left-0 -translate-x-0 border-r-8 border-t-8 border-r-transparent border-t-card'
                } w-0 h-0`} />
              </div>
              
            </div>

            {/* Show visualization dialog trigger if available */}
            {message.apiResponse?.visualization && (
              <div className="flex justify-start mb-4">
                <VisualizationDialog 
                  visualization={message.apiResponse.visualization} 
                  className="shadow-sm"
                />
              </div>
            )}
            
            {/* Show profile summary if available */}
            {message.apiResponse?.profiles && message.apiResponse.profiles.length > 0 && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[80%]">
                  <ProfileSummaryCard 
                    profiles={message.apiResponse.profiles} 
                    className="shadow-sm"
                  />
                </div>
              </div>
            )}
            
            {/* Fallback for legacy data format */}
            {message.data && !message.apiResponse && (
              <div className="flex justify-start mb-4 pl-2">
                <div className="max-w-[80%] bg-card rounded-xl border border-border shadow-sm p-3">
                  <ArgoFloatCard data={message.data as any}  />
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {allMessages.length === 0 && (
        <div className="text-muted-foreground text-center mt-4">
          Start a conversation about ocean data!
        </div>
      )}
      {/* Input */}
      <div className="p-6 bg-card/0 backdrop-blur-sm border-border">

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about ocean temperature, salinity, or specific regions..."
            className="flex-1 bg-background border-border focus:ring-primary"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-ocean hover:bg-primary-glow text-primary-foreground shadow-ocean"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
