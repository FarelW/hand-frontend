import { getToken } from "@/utils/function";
import { getApiUrl } from "@/utils/api";
const API_URL = getApiUrl();

export async function saveJournalEntry(journalEntry: string) {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/journals`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: journalEntry,
      }),
    });

    if (response.ok) {
      console.log("Journal entry saved successfully");
      return true;
    } else {
      console.error("Failed to save journal entry");
      return false;
    }
  } catch (error) {
    console.error("Error saving journal entry:", error);
    return false;
  }
}

export async function fetchJournalEntriesByDate(date: string) {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/journals?date=${date}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data) && data.length > 0) {
        return data;
      } else {
        return []; // No journal entries found
      }
    } else {
      return []; // Handle non-OK responses
    }
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return []; // Handle errors by returning an empty array
  }
}
