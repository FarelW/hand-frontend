// components/globalCallHandler.tsx
"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/context/WebSocketProvider";
import { CallRequestModal } from "@/components/callModals"; 
import { getCookie } from "cookies-next";

interface IncomingCallData {
  callType: "video" | "audio";
  callerId: string;
  callerName: string;
  callerImage?: string;
}

const GlobalCallHandler = () => {
  const { socket, initializeWebSocket } = useWebSocket();
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  // Initialize WebSocket if we're on a page that needs call notifications
  useEffect(() => {
    const userId = getCookie("user_id");
    setCurrentUserId(userId);
    
    if (userId && !socket) {
      initializeWebSocket();
    }
  }, [socket, initializeWebSocket]);

  // Set up message handler for the socket
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.event === "incoming_call") {
          console.log("Received incoming call:", message.data);
          setIncomingCall(message.data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);
    
    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  const handleAcceptCall = () => {
    if (!socket || !incomingCall || !currentUserId) return;
    
    socket.send(JSON.stringify({
      event: "accept_call",
      data: { callerId: incomingCall.callerId, receiverId: currentUserId }
    }));
    
    // Handle navigation to call screen
    setIncomingCall(null);
  };

  const handleDeclineCall = () => {
    if (!socket || !incomingCall) return;
    
    socket.send(JSON.stringify({
      event: "decline_call",
      data: { callerId: incomingCall.callerId }
    }));
    
    setIncomingCall(null);
  };

  return (
    <>
      {incomingCall && (
        <CallRequestModal
          isOpen={true}
          callerName={incomingCall.callerName}
          callerImage={incomingCall.callerImage}
          callType={incomingCall.callType}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}
    </>
  );
};

export default GlobalCallHandler;
