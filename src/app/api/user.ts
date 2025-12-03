import { getApiUrl } from "@/utils/api";
const API_URL = getApiUrl();
import { getToken } from "@/utils/function";

// Fetch user profile
export async function getProfile() {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, profile: data.profile };
    } else {
      throw new Error(data.message || "Error fetching profile");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching profile:", error.message);
      return { success: false, message: error.message };
    } else {
      console.error("Unknown error:", error);
      return { success: false, message: "An unknown error occurred" };
    }
  }
}

export async function editProfile(name: string, imageUrl: string) {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/edit-profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        image_url: imageUrl, // Update with image URL
      }),
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, message: "Profile updated successfully" };
    } else {
      throw new Error(data.message || "Error updating profile");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating profile:", error.message);
      return { success: false, message: error.message };
    } else {
      console.error("Unknown error:", error);
      return { success: false, message: "An unknown error occurred" };
    }
  }
}

export async function uploadImage(imageFile: File) {
  const token = await getToken();

  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch(`${API_URL}/upload-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, imageUrl: data.image_url };
    } else {
      throw new Error(data.message || "Error uploading image");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error uploading image:", error.message);
      return { success: false, message: error.message };
    } else {
      console.error("Unknown error:", error);
      return { success: false, message: "An unknown error occurred" };
    }
  }
}

export interface CreateTherapistDTO {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  location: string;
  specialization: string;
  consultation: string;
  appointment_rate: number;
}

export const createTherapist = async (
  data: CreateTherapistDTO
): Promise<{ success: boolean; message: string }> => {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/therapists/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      return { success: true, message: "Therapist created successfully" };
    } else {
      throw new Error(result.error || "Failed to create therapist");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating therapist:", error.message);
      return { success: false, message: error.message };
    } else {
      console.error("Unknown error:", error);
      return { success: false, message: "An unknown error occurred" };
    }
  }
};
