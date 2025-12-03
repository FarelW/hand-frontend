import { getToken } from "@/utils/function";
import { getApiUrl } from "@/utils/api";
const API_URL = getApiUrl();

export async function fetchMedia() {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/media`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data: MediaItem[] = await response.json();

    if (response.ok) {
      const articlesData = data.filter(
        (item: MediaItem) => item.Type === "article"
      );
      const videosData = data.filter(
        (item: MediaItem) => item.Type === "video"
      );

      return { articles: articlesData, videos: videosData };
    } else {
      throw new Error("Error fetching media");
    }
  } catch (error) {
    console.error("Error fetching media:", error);
    return { articles: [], videos: [] };
  }
}

export async function addMedia(mediaPayload: { title: string; type: string; content: string; image_url: string }) {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/media`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mediaPayload),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: "Media added successfully" };
    } else {
      throw new Error(data.message || "Failed to add media");
    }
  } catch (error) {
    console.error("Error adding media:", error);
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

interface MediaItem {
  ID: string;
  Type: "article" | "video";
  Title: string;
  Content: string;
  CreatedAt: string;
  UpdatedAt: string;
  image_url: string;
}
