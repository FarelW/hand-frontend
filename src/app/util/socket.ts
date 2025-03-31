import { getToken } from "@/utils/function";

let websocketInstance: WebSocket | null = null;

export const createWebSocket = async (url: string) => {

  if (websocketInstance && websocketInstance.readyState !== WebSocket.CLOSED) {
    websocketInstance.close();
    websocketInstance = null;
  }
  

  const token = await getToken();
  const ws = new WebSocket(`${url}?token=${token}`);


  ws.onopen = () => {
    console.log("Connected to WebSocket");
    websocketInstance = ws;
  };

  ws.onclose = () => {
    console.log(ws)
    console.log("Disconnected from WebSocket");
  };

  ws.onerror = (error) => {
    console.log("WebSocket error: ", error);
  };

  return ws;
};

export function getExistingWebSocket(): WebSocket | null {
  return websocketInstance;
}