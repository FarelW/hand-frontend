import { getToken } from "@/utils/function";

export const createWebSocket = async (url: string) => {
  const token = await getToken();
  const ws = new WebSocket(`${url}?token=${token}`);


  ws.onopen = () => {
    console.log("Connected to WebSocket");
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
