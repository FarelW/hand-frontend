import { ChatMessage } from "../find/[roomId]/page";
import { getToken } from "@/utils/function";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export interface CheckInData {
  mood_score: number;
  feelings: string;
  notes: string;
}

export async function getTodayCheckIn() {
  const token = await getToken();

  try {
    const response = await fetch(`${API_URL}/checkins/ischeckin`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Today's CheckIn:", data);
      return data;
    } else {
      throw new Error(data.message || "Error fetching today's check-in");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function createCheckIn(checkInData: CheckInData) {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/checkins/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(checkInData),
    });
    const data = await response.json();
    if (response.ok) {
      console.log("CheckIn Created:", data);
      return data;
    } else {
      throw new Error(data.message || "Error creating check-in");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function updateCheckIn(checkInData: CheckInData) {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/checkins`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(checkInData),
    });
    const data = await response.json();
    if (response.ok) {
      console.log("CheckIn Updated:", data);
      return data;
    } else {
      throw new Error(data.message || "Error updating check-in");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function fetchChatMessages(
  roomId: string
): Promise<ChatMessage[] | undefined> {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/room/message/${roomId}`, {
      method: "GET",
      credentials: "include", // Ensure cookies for session management are included with the request
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Chat Messages Fetched:", data);
      return data as ChatMessage[];
    } else {
      throw new Error(data.message || "Error fetching chat messages");
    }
  } catch (error) {
    console.error("Fetch Chat Messages Error:", error);
    return undefined;
  }
}

export async function getCheckIn(): Promise<CheckIn> {
  const token = await getToken(); // Assume getToken is a function that retrieves your token
  try {
    const response = await fetch(`${API_URL}/checkins/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include", // If you need credentials
    });

    if (!response.ok) {
      throw new Error(`Error fetching check-in: ${response.statusText}`);
    }

    const data: CheckIn = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching check-in", error);
    throw error;
  }
}

interface CheckIn {
  ID:          string,
  MoodScore:   number,
  CheckInDate: string,
}

export interface ChatRoom {
  ID: string;
  FirstUserID: string;
  SecondUserID: string;
  IsEnd: boolean;
  Type: string;
  CreatedAt: string;
  FirstUser: {
    ID: string;
    name: string;
    image_url: string;
  };
  SecondUser: {
    ID: string;
    name: string;
    image_url: string;
  };
}

export async function fetchChatRoomsWithMessages(): Promise<ChatRoom[] | undefined> {
  const token = await getToken(); // Get the JWT token
  
  try {
    const response = await fetch(`${API_URL}/room/chat`, {
      method: "GET",
      credentials: "include", // Ensure cookies for session management are included with the request
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Chat Rooms with Messages Fetched:", data);
      return data as ChatRoom[];
    } else {
      throw new Error(data.message || "Error fetching chat rooms with messages");
    }
  } catch (error) {
    console.error("Error fetching chat rooms with messages:", error);
    return undefined;
  }
}