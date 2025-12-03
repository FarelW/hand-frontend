import { getToken } from "@/utils/function";
import { getApiUrl } from "@/utils/api";

const API_URL = getApiUrl();

// Function to verify OTP
export async function verifyOTP(otp: string) {
  const token = await getToken();
  try {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ otp }),
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      throw new Error(data.message || "OTP verification failed");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error verifying OTP:", error.message);
      return { success: false, message: error.message };
    } else {
      console.error("Unknown error verifying OTP");
      return { success: false, message: "An unknown error occurred" };
    }
  }
}

export async function sendOTP() {
  const token = await getToken();
  console.log(token);
  try {
    const response = await fetch(`${API_URL}/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      throw new Error(data.message || "Failed to send OTP");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error sending OTP:", error.message);
      return { success: false, message: error.message };
    } else {
      console.error("Unknown error sending OTP");
      return { success: false, message: "An unknown error occurred" };
    }
  }
}
