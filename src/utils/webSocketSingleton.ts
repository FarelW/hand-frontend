// websocketSingleton.ts
let socketInstance: WebSocket | null = null;

export function getSocket(socketUrl: string): WebSocket {
  if (!socketInstance || socketInstance.readyState === WebSocket.CLOSED) {
    socketInstance = new WebSocket(socketUrl);
    
    // Add global error handler
    socketInstance.onerror = (error) => {
      console.error("WebSocket singleton error:", error);
    };
    
    // Add global close handler
    socketInstance.onclose = (event) => {
      console.warn("WebSocket singleton disconnected", event);
      socketInstance = null;
    };
  }
  return socketInstance;
}

export function closeSocket() {
  if (socketInstance && socketInstance.readyState === WebSocket.OPEN) {
    socketInstance.close();
    socketInstance = null;
  }
}
