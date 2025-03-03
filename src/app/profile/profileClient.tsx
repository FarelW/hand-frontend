"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, XCircle, Edit2, Camera } from "lucide-react";
import { getProfile, editProfile, uploadImage } from "../api/user";
import { Toaster, toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingBouncer from "@/components/Loading";

interface UserData {
  name: string;
  email: string;
  phone_number: string;
  is_mobile_verified: boolean;
  image_url: string;
}

const MenuItem: React.FC<{
  icon: string;
  text: string;
  bgColor: string;
  href: string;
}> = ({ icon, text, bgColor, href }) => (
  <Link href={href}>
    <div
      className={`flex items-center space-x-4 p-4 ${bgColor} rounded-lg font-teachers text-black transition-colors hover:opacity-90 cursor-pointer h-20`}
    >
      <Image
        src={icon}
        alt="icon"
        width={50}
        height={50}
        className="flex-shrink-0"
      />
      <span className="text-xl">{text}</span>
    </div>
  </Link>
);

export default function UserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UserData>>({});
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const response = await getProfile();
      if (response.success) {
        setUserData(response.profile);
      } else {
        setError(response.message || "An unknown error occurred");
        toast.error(response.message || "An unknown error occurred");
      }
      setLoading(false);
    }

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditedData(userData || {});
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedData) return;
    setLoading(true);

    let imageUrl = userData?.image_url || "";

    if (newProfileImage) {
      const uploadResponse = await uploadImage(newProfileImage);

      if (uploadResponse.success) {
        imageUrl = uploadResponse.imageUrl;
      } else {
        toast.error(uploadResponse.message || "Failed to upload image");
        setLoading(false);
        return;
      }
    }

    const response = await editProfile(editedData.name ?? "", imageUrl);

    if (response.success) {
      setUserData({
        name: editedData.name ?? userData?.name ?? "",
        image_url: imageUrl ?? "",
        email: userData?.email ?? "",
        phone_number: userData?.phone_number ?? "",
        is_mobile_verified: userData?.is_mobile_verified ?? false,
      });
      toast.success("Profile updated successfully");
    } else {
      toast.error(response.message || "Failed to update profile");
    }

    // Reset the state
    setIsEditing(false);
    setLoading(false);
    setNewProfileImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewProfileImage(e.target.files[0]);
    }
  };

  if (loading) {
    return <LoadingBouncer />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F8FF] to-[#E6F0FF] pt-28 sm:pt-32 px-4 sm:px-6 lg:px-8">
      <Toaster position="bottom-right" richColors />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 bg-[#91CAF8] p-8 flex flex-col items-center justify-center relative">
              <div className="relative">
                <Image
                  src={
                    userData?.image_url ||
                    "https://pub-736ef3be77f045e8ba550ae958fe7e1b.r2.dev/uploads/1727887801-default_image.jpg"
                  }
                  alt="Profile picture"
                  width={200}
                  height={200}
                  className="h-48 w-48 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <Button
                  onClick={handleEdit}
                  className="absolute bottom-0 right-0 rounded-full p-2 bg-white hover:bg-gray-100 text-blue-500"
                >
                  <Edit2 size={16} />
                </Button>
              </div>
              <h1 className="mt-6 text-4xl text-white text-center font-gloock">
                Hai, {userData?.name}!
              </h1>
            </div>
            <div className="md:w-2/3 p-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userData?.email || ""}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={userData?.phone_number || ""}
                    readOnly
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {userData?.is_mobile_verified ? (
                      <div className="flex items-center space-x-2 text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-red-600 bg-red-100 px-3 py-1 rounded-full">
                        <XCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Not Verified
                        </span>
                      </div>
                    )}
                  </div>
                  {!userData?.is_mobile_verified && (
                    <Link
                      href="auth/verify-otp"
                      className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-colors"
                    >
                      Verify Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MenuItem
            icon="/profile/chatAnon.svg"
            text="Chat Anonymously"
            bgColor="bg-[#91CAF8]"
            href="/find"
          />
          <MenuItem
            icon="/profile/checkin.svg"
            text="Your Mood"
            bgColor="bg-[#C8DDFC]"
            href="/your-mood"
          />
          <MenuItem
            icon="/floatingBar/journal.svg"
            text="Your Journal"
            bgColor="bg-[#C8F0FC]"
            href="/journal"
          />
          <MenuItem
            icon="/profile/medicalRecord.svg"
            text="Your Medical Record"
            bgColor="bg-[#A4E0F2]"
            href="/medical-record"
          />
          <MenuItem
            icon="/profile/theraphy.svg"
            text="Your Therapy History"
            bgColor="bg-[#DEF1FF]"
            href="/therapy-history"
          />
          <MenuItem
            icon="/profile/mentalHealth.svg"
            text="Your Mental Health Plan"
            bgColor="bg-[#A0C4D8]"
            href="/mental-health-plan"
          />
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Image
                  src={
                    newProfileImage
                      ? URL.createObjectURL(newProfileImage)
                      : userData?.image_url || "/default-profile.png"
                  }
                  alt="Profile picture"
                  width={100}
                  height={100}
                  className="h-24 w-24 rounded-full object-cover border-2 border-blue-500"
                />
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 cursor-pointer"
                >
                  <div className="rounded-full p-1 bg-blue-500 text-white">
                    <Camera size={16} />
                  </div>
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={editedData.name || ""}
                onChange={(e) =>
                  setEditedData({ ...editedData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <Input
                id="email"
                value={userData?.email || ""}
                disabled
                className="col-span-3 bg-gray-100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone" className="text-right">
                Phone
              </label>
              <Input
                id="phone"
                value={userData?.phone_number || ""}
                disabled
                className="col-span-3 bg-gray-100"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
