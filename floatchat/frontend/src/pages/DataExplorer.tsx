import { useState, useEffect, useRef } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MapComponent from "@/components/MapComponent";
import { floatChatApi, HARDCODED_SESSION_ID, mapBoundsToApiFormat } from "@/services/api";
import { ApiProfile, ApiQueryResponse } from "@/services/types";
import { profilesApi } from "@/services/profilesApi";
import {
  Globe,
  Activity,
  MessageSquare,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2
} from "lucide-react";

// ------------------ TYPES ------------------
type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  data?: unknown;
  apiResponse?: ApiQueryResponse;
  error?: string;
};

type ChatHistoryItem = {
  id: number;
  title: string;
  messages: Message[];
  sessionId?: string;
};

type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

// ------------------ LOCALSTORAGE KEYS ------------------
const CHAT_HISTORY_KEY = "floatchat_history";
const CHAT_CURRENT_ID_KEY = "floatchat_current_id";
const ARGO_PROFILES_KEY = "floatchat_argo_profiles";
const SESSION_DATA_KEY = "floatchat_session_data";

// ------------------ DRAGGABLE CHAT SIDEBAR ------------------
function ChatSidebar({
  history,
  onSelect,
  onClear,
  selectedId,
  onNewChat,
  minimized,
  onToggleMinimize,
}: {
  history: ChatHistoryItem[];
  onSelect: (id: number) => void;
  onClear: () => void;
  selectedId: number | null;
  onNewChat: () => void;
  minimized: boolean;
  onToggleMinimize: () => void;
}) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  // Mouse events for drag-resize
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth > 200 && newWidth < 500) setWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div
      ref={sidebarRef}
      className={`flex flex-col h-full transition-all duration-300 border-r border-border bg-card/90 shadow-lg relative`}
      style={{ width: minimized ? 50 : width }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-4 border-b border-border bg-background/80 relative">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-ocean" />
          {!minimized && <span className="font-semibold text-lg">Chat History</span>}
        </div>
        <div className="flex gap-2">
          {!minimized && (
            <>
              <button 
                className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors" 
                onClick={onNewChat}
              >
                <Plus className="w-5 h-5" />
              </button>
              <button 
                className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors" 
                onClick={onClear}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        <button
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 border border-border bg-background rounded-full shadow h-10 w-10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
          onClick={onToggleMinimize}
        >
          {minimized ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* History */}
      {!minimized && (
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <MessageSquare className="w-10 h-10 text-muted-foreground/60" />
              <p className="text-muted-foreground text-sm">No chats yet</p>
              <button
                onClick={onNewChat}
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-1" /> Start a New Chat
              </button>
            </div>
          ) : (
            <ul className="space-y-1">
              {history.map((item) => (
                <li key={item.id}>
                  <button
                    className={`w-full justify-start truncate rounded-lg hover:bg-ocean/10 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                      selectedId === item.id 
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => onSelect(item.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    <span className="truncate">{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Resizer */}
      {!minimized && (
        <div
          onMouseDown={startResize}
          className="w-1 cursor-col-resize absolute top-0 right-0 h-full bg-transparent hover:bg-ocean/30 transition-all"
        />
      )}
    </div>
  );
}

// ------------------ MAIN COMPONENT ------------------
const DataExplorer = () => {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [argoProfiles, setArgoProfiles] = useState<ApiProfile[]>([]);
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [sessionId, setSessionId] = useState<string>(HARDCODED_SESSION_ID);

  // Loading states for multi-step loader
  const loadingStates = [
    { text: " Analyzing your oceanographic query..." },
    { text: " Connecting to global ARGO float network..." },
    { text: " Retrieving satellite oceanographic data..." },
    { text: " Filtering profiles by geographic coordinates..." },
    { text: " Processing temperature and salinity measurements..." },
    { text: " Generating data visualizations and insights..." },
    { text: " Finalizing your oceanographic analysis..." }
  ];

  // Initialize session and load history from localStorage
  useEffect(() => {
    const initializeApp = async () => {
      // Load stored data
      const stored = localStorage.getItem(CHAT_HISTORY_KEY);
      const storedId = localStorage.getItem(CHAT_CURRENT_ID_KEY);
      const storedProfiles = localStorage.getItem(ARGO_PROFILES_KEY);
      const storedSession = localStorage.getItem(SESSION_DATA_KEY);

      // Load session ID from storage or use hardcoded
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          setSessionId(sessionData.sessionId);
        } catch (error) {
          // Failed to parse session data
        }
      }

      // Optionally create new session (commented out for hardcoded session)
      /*
      try {
        const newSession = await floatChatApi.createSession();
        setSessionId(newSession.sessionId);
        localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(newSession));
      } catch (error) {
        // Failed to create new session, using hardcoded
      }
      */
      
      if (stored) {
        const parsed: ChatHistoryItem[] = JSON.parse(stored);
        parsed.forEach(chat => chat.messages.forEach(msg => msg.timestamp = new Date(msg.timestamp)));
        setHistory(parsed);
        if (storedId) {
          const id = Number(storedId);
          setCurrentChatId(id);
          const found = parsed.find(h => h.id === id);
          setMessages(found ? found.messages : []);
        }
      }
      
      if (storedProfiles) {
        try {
          const profiles: ApiProfile[] = JSON.parse(storedProfiles);
          setArgoProfiles(profiles);
        } catch (error) {
          // Failed to parse stored ARGO profiles
        }
      }
    };

    initializeApp();
  }, []);

  // Persist data to localStorage
  useEffect(() => { 
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history)); 
  }, [history]);
  
  useEffect(() => { 
    if (currentChatId !== null) {
      localStorage.setItem(CHAT_CURRENT_ID_KEY, currentChatId.toString());
    } else {
      localStorage.removeItem(CHAT_CURRENT_ID_KEY);
    }
  }, [currentChatId]);
  
  useEffect(() => {
    localStorage.setItem(ARGO_PROFILES_KEY, JSON.stringify(argoProfiles));
  }, [argoProfiles]);

  const handleSendMessage = async (msg: string) => {
    const userMsg: Message = { 
      id: Date.now().toString(), 
      type: "user", 
      content: msg, 
      timestamp: new Date() 
    };

    // Add user message immediately
    let newChatId = currentChatId;
    if (currentChatId === null) {
      newChatId = Date.now();
      const newHistory: ChatHistoryItem[] = [
        { id: newChatId, title: msg.slice(0, 30) || "New Chat", messages: [userMsg], sessionId: sessionId },
        ...history,
      ];
      setHistory(newHistory);
      setCurrentChatId(newChatId);
      setMessages([userMsg]);
    } else {
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setHistory(history.map(h =>
        h.id === currentChatId
          ? { ...h, messages: newMessages, title: h.title || msg.slice(0, 30) }
          : h
      ));
    }

    // Show loading state
    setIsLoading(true);

    try {
      // Call API with geographic bounds if available
      const geographicBounds = currentBounds ? mapBoundsToApiFormat(currentBounds) : undefined;
      const apiResponse = await floatChatApi.sendQuery(
        msg,
        sessionId,
        geographicBounds,
        { max_results: 100, use_cache: true }
      );

      // The agents system handles all visualization automatically
      // No need for manual plot generation - the response includes visualizations if needed
      let enhancedApiResponse = apiResponse;

      // Create AI response message
      const aiMsg: Message = {
        id: (Date.now() + 2).toString(),
        type: "ai",
        content: enhancedApiResponse.response,
        timestamp: new Date(),
        apiResponse: enhancedApiResponse,
        data: enhancedApiResponse.visualization
      };

      // Update messages with AI response
      const finalMessages = currentChatId === null ? [userMsg, aiMsg] : [...messages, userMsg, aiMsg];
      setMessages(finalMessages);
      
      // Update history
      setHistory(history.map(h =>
        h.id === (newChatId || currentChatId)
          ? { ...h, messages: finalMessages, title: h.title || msg.slice(0, 30) }
          : h
      ));

      // Update ARGO profiles if returned
      if (enhancedApiResponse.profiles && enhancedApiResponse.profiles.length > 0) {
        setArgoProfiles(prevProfiles => {
          // Merge new profiles with existing ones, avoid duplicates
          const existingIds = new Set(prevProfiles.map(p => p.profile_id));
          const newProfiles = enhancedApiResponse.profiles.filter(p => !existingIds.has(p.profile_id));
          return [...prevProfiles, ...newProfiles];
        });
      }

    } catch (error) {
      // API Error handled silently
      
      // Create error message
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        type: "ai",
        content: "I'm having trouble connecting to the oceanographic data service..",
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      // Update messages with error message
      const finalMessages = currentChatId === null ? [userMsg, errorMsg] : [...messages, userMsg, errorMsg];
      setMessages(finalMessages);
      
      // Update history
      setHistory(history.map(h =>
        h.id === (newChatId || currentChatId)
          ? { ...h, messages: finalMessages, title: h.title || msg.slice(0, 30) }
          : h
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (id: number) => {
    setCurrentChatId(id);
    const found = history.find(h => h.id === id);
    setMessages(found ? found.messages : []);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setCurrentChatId(null);
    setMessages([]);
    setArgoProfiles([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(CHAT_CURRENT_ID_KEY);
    localStorage.removeItem(ARGO_PROFILES_KEY);
    localStorage.removeItem(SESSION_DATA_KEY);
  };

  const handleNewChat = () => { 
    setCurrentChatId(null); 
    setMessages([]); 
  };


  // Handle map bounds change and fetch ARGO floats in the area
  const handleMapBoundsChange = async (bounds: MapBounds) => {
    setCurrentBounds(bounds);
    
    try {
      const geoBounds = mapBoundsToApiFormat(bounds);
      
      // Skip API call if bounds are invalid (too small or malformed)
      if (!geoBounds.lat_min || !geoBounds.lat_max || !geoBounds.lon_min || !geoBounds.lon_max) {
        // Invalid map bounds, skipping API call
        return;
      }
      
      const profiles = await profilesApi.searchProfiles({
        lat_min: geoBounds.lat_min,
        lat_max: geoBounds.lat_max,
        lon_min: geoBounds.lon_min,
        lon_max: geoBounds.lon_max,
        limit: 50
      });
      
      setArgoProfiles(profiles);
    } catch (error) {
      // Map bounds profile search failed, continuing without profiles
      // Don't clear existing profiles, just skip the update
    }
  };

  return (
    <div className="min-h-screen bg-depth flex flex-col">
      {/* Map + Chat + Sidebar */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex gap-4">
          {/* Map Container */}
          <div className="w-1/2 rounded-xl overflow-hidden shadow-lg bg-card/80 h-[650px]">
            <MapComponent 
              className="w-full h-full"
              onBoundsChange={handleMapBoundsChange}
              argoProfiles={argoProfiles}
              isLoading={isLoading}
              onProfilesUpdate={setArgoProfiles}
            />
          </div>
          
          {/* Chat Container */}
          <div className="w-1/2 flex rounded-xl overflow-hidden shadow-lg bg-card/80 h-[650px] relative">
            {/* <ChatSidebar
              history={history}
              onSelect={handleSelectHistory}
              onClear={handleClearHistory}
              selectedId={currentChatId}
              onNewChat={handleNewChat}
              minimized={sidebarMinimized}
              onToggleMinimize={() => setSidebarMinimized(v => !v)}
            /> */}
            <div className="flex-1 flex flex-col relative">
              <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
              
              {/* Simple loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Loading...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExplorer;
