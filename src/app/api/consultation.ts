import { getToken } from "@/utils/function";
import { getApiUrl } from "@/utils/api";
const API_URL = getApiUrl();

export async function fetchTherapists(
  dateStr = "",
  consultationType = "",
  location = ""
) {
  const token = await getToken();
  try {
    const response = await fetch(
      `${API_URL}/therapists?consultation=${consultationType}&location=${location}&date=${dateStr}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.length === 0) {
        return {
          therapists: [],
          errorMessage: "No therapists found for the selected criteria.",
        };
      }
      return { therapists: data, errorMessage: "" };
    } else {
      return { therapists: [], errorMessage: "Error fetching therapists." };
    }
  } catch (error) {
    console.error("Error fetching therapists:", error);
    return { therapists: [], errorMessage: "Error fetching therapists." };
  }
}

type Medication = {
  id: string;
  image_url: string;
  stock: number;
  name: string;
  price: number;
  description: string;
  requiresPrescription: boolean;
  createdAt: string;
  updatedAt: string;
  quantity: number;
  dosage: string;
};

export async function SaveConsultation(
  consultationNotes: string,
  selectedMedications: Medication[],
  appointmentID: string
): Promise<void> {
  const token = await getToken();

  const payload = {
    conclusion: consultationNotes,
    medications: selectedMedications.map((med) => ({
      medication_id: med.id,
      dosage: med.dosage,
      quantity: med.quantity.toString(),
    })),
  };

  console.log("Payload:", payload);

  try {
    const response = await fetch(
      `${API_URL}/therapists/consultation-history/${appointmentID}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save consultation");
    }

    console.log("Consultation saved successfully!");
  } catch (error) {
    console.error("Error saving consultation:", error);
  }
}

export async function GetUserByAppointmentID(appointmentID: string) {
  const token = await getToken();
  try {
    const response = await fetch(
      `${API_URL}/appointment/${appointmentID}/user`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save consultation");
    }
    const data = await response.json();
    return data;
    console.log("Consultation saved successfully!");
  } catch (error) {
    console.error("Error saving consultation:", error);
  }
}

export async function fetchConsultations(userId: string) {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/consultations/${userId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.consultations;
  } catch (error) {
    console.log(error);
  }
}
