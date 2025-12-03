"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import LoadingBouncer from "../Loading";
import { getApiUrl } from "@/utils/api";

const API_URL = getApiUrl();


interface InputFieldProps {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col space-y-1 font-teachers">
      <Label htmlFor={label.toLowerCase().replace(/\s/g, "-")}>{label}</Label>
      <Input
        id={label.toLowerCase().replace(/\s/g, "-")}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};


const PhoneInputField: React.FC<Omit<InputFieldProps, "type">> = ({
  label,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col space-y-1 font-teachers">
      <Label htmlFor="phone-number">{label}</Label>
      <div className="flex">
        <div className="flex items-center justify-center bg-gray-100 border border-r-0 rounded-l-md px-3">
          <span className="text-sm text-gray-500">+62</span>
        </div>
        <Input
          id="phone-number"
          type="tel"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="rounded-l-none"
        />
      </div>
    </div>
  );
};

const RegisterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    // Simple validation
    if (!name || !email || !password || !confirmPassword || !phoneNumber) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const data = {
      name,
      email,
      password,
      phone_number: "+62" + phoneNumber,
      role: "patient", 
    };

    try {

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });


      if (response.ok) {
        toast.success("Registration successful!");

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setPhoneNumber("");

        setTimeout(() => {
          router.push("/auth/login");
        }, 200);
      } else {
        const errorData = await response.json();
        toast.error(`Registration failed: ${errorData.message}`);
      }

    } catch (error) {
      console.log(error)
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <LoadingBouncer />;
  }

  return (
    <div className="flex flex-col space-y-4 bg-white shadow-lg p-8 rounded-lg max-w-lg mx-auto font-teachers">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="What's your name?"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <InputField
            label="Make a password!"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-teachers">
          <InputField
            label="What's your email?"
            placeholder="example@service.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            label="Confirm your password!"
            placeholder="we'll make sure your account is safe!"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <PhoneInputField
          label="What's your phone number?"
          placeholder="81234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        <Button type="submit" className="w-full">
          Sign Me Up
        </Button>
      </form>

      <Toaster position="bottom-right" richColors />
    </div>
  );
};

export default RegisterForm;
