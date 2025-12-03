import { getApiUrl } from "@/utils/api";
const API_URL = getApiUrl();
import { getToken } from "@/utils/function";
export async function getTherapistDetails(therapistId: string) {
  const token = await getToken();
  try {
    const response = await fetch(
      `${API_URL}/therapist/${therapistId}/details`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    if (response.ok) {
      return data.therapist;
    } else {
      throw new Error(data.message || "Error fetching therapist details");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function getTherapistSchedule(
  therapistId: string,
  date: string | null = null,
  consultationType: string | null = null
) {
  const token = await getToken();
  let queryParams = `?`;
  if (date) {
    queryParams += `date=${date}&`;
  }
  if (consultationType) {
    queryParams += `type=${consultationType}`;
  }

  try {
    const response = await fetch(
      `${API_URL}/therapist/${therapistId}/schedule${queryParams}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || "Error fetching therapist schedule");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function fetchUpcomingAppointment(userId: string) {
  const token = await getToken();
  try {
    const response = await fetch(
      `${API_URL}/appointment/upcomingAppointment/${userId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
}

const formatDateForServer = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Add leading zero if necessary
  const day = date.getDate().toString().padStart(2, "0"); // Add leading zero if necessary

  return `${year}-${month}-${day}`; // Format as "YYYY-MM-DD"
};


export async function closeSchedule(selectedDate: Date | null) {
  const token = await getToken();

  if (!selectedDate) {
    console.error("No date selected");
    return;
  }

  const formattedDate = formatDateForServer(selectedDate);

  try {
    const response = await fetch(
      `${API_URL}/therapists/availability`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: formattedDate, // Use formatted date here
          is_available: false,
        }),
      }
    );

    if (response.ok) {
      alert("Schedule added successfully!");
      const data = await response.json();
      return data;
    } else {
      console.error("Error adding schedule");
    }
  } catch (error) {
    console.error("Error adding schedule:", error);
  }
}


export interface Therapist {
  name: string;
  location: string;
  image_url: string;
  appointment_rate: number;
  consultation_type: string;
  phone_number: string;
  specialization: string;
}

export interface Schedule {
  time: string;
  available: boolean;
}
