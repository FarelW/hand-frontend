// context/WebSocketProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createWebSocket, getExistingWebSocket } from "@/app/util/socket";
import { getCookie } from "cookies-next";

interface IWebSocketContext {
  socket: WebSocket | null;
  initializeWebSocket: () => Promise<WebSocket | null>;
}

const WebSocketContext = createContext<IWebSocketContext>({ 
  socket: null,
  initializeWebSocket: async () => null
});

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(getExistingWebSocket());
  const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:8000/ws";

  const initializeWebSocket = async (): Promise<WebSocket | null> => {
    try {
      const userId = getCookie("user_id");
      if (!userId) {
        console.log("No user ID found, cannot connect to WebSocket");
        return null;
      }

      console.log(`Initializing WebSocket for user ${userId}`);
      const websocket = await createWebSocket(SOCKET_SERVER_URL);
      
      websocket.onclose = () => {
        console.log("WebSocket disconnected");
        setSocket(null);
      };
      
      setSocket(websocket);
      return websocket;
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
      return null;
    }
  };

  useEffect(() => {
    // If there's an existing socket from a previous initialization, use it
    const existingSocket = getExistingWebSocket();
    if (existingSocket && existingSocket.readyState === WebSocket.OPEN) {
      setSocket(existingSocket);
    } 
    // No automatic initialization here - components will call initializeWebSocket() when needed
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, initializeWebSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
