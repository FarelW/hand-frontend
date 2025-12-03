"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { setCookie } from "cookies-next";
import LoadingBouncer from "@/components/Loading";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    e.preventDefault();

    // Validate email and password fields
    if (!email || !password) {
      toast.error("Both email and password are required.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // If login fails
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }
      const data = await res.json();
      console.log(data);
      setCookie("authToken", data.token, {
        path: "/",
        secure: true,
        sameSite: "none",
      });
      setCookie("user_id", data.user.ID, {
        path: "/",
        secure: true,
        sameSite: "none",
      });
      setCookie("user_role", data.user.role, {
        path: "/",
        secure: true,
        sameSite: "none",
      });
      setCookie("user_name", data.user.name, {
        path: "/",
        secure: true,
        sameSite: "none",
      });

      toast.success("Login successful!");

      if (data.user.role === "admin"){
        router.push("/admin-dashboard")
      }else if(data.user.role === "therapist"){
        router.push("/therapist-dashboard")
      }else {
        router.push("/");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Login failed. Please check your credentials.");
        toast.error(
          err.message || "Login failed. Please check your credentials."
        );
      } else {
        setError("An unknown error occurred.");
        toast.error("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <LoadingBouncer />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-6">
      <Toaster position="bottom-right" richColors />{" "}
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-center mb-4 font-gloock">
          Hi! Nice to meet You again!
        </h1>

        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4 font-teachers">{error}</p>}

          <div className="mb-4">
            <label className="font-teachers block text-gray-700">What’s your email?</label>
            <input
              type="email"
              className="font-teachers w-full p-2 border rounded-lg bg-gray-100 placeholder-gray-400 focus:outline-none"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="font-teachers block text-gray-700">Your password?</label>
            <input
              type="password"
              className="font-teachers w-full p-2 border rounded-lg bg-gray-100 placeholder-gray-400 focus:outline-none"
              placeholder="if you forget, kindly click the link below!"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-right text-gray-500">
            <a href="/forgot-password" className="font-teachers underline">
              Having trouble? Click here!
            </a>
          </div>

          <button
            type="submit"
            className="font-teachers mt-6 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-all w-full"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
