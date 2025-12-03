"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCookie } from "cookies-next";
import { getApiUrl } from "@/utils/api";
// Define form types for each category
type TherapistForm = {
  name: string;
  email: string;
  phoneNumber: string;
  location: string;
  specialization: string;
  consultation: string;
  appointmentRate: number;
  imageUrl: string;
  imageFile: File | null;
};

type MedicationForm = {
  medName: string;
  stock: number;
  price: number;
  description: string;
  requiresPrescription: boolean;
  imageUrl: string;
  imageFile: File | null;
};

type ArticleForm = {
  title: string;
  type: string;
  content: string;
  imageUrl: string;
  imageFile: File | null;
};

type HelpForm = {
  topic: string;
  category: string;
  content: string;
};

const API_URL = getApiUrl();

export default function EditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // IDs are GUID strings so we keep them as strings
  const id = searchParams.get("id") || "";
  const category = searchParams.get("category") || "Therapist";

  // Update the initial state for therapistForm to include the new image properties
  const [therapistForm, setTherapistForm] = useState<TherapistForm>({
    name: "",
    email: "",
    phoneNumber: "",
    location: "",
    specialization: "",
    consultation: "",
    appointmentRate: 0,
    imageUrl: "",
    imageFile: null,
  });

  const [medicationForm, setMedicationForm] = useState<MedicationForm>({
    medName: "",
    stock: 0,
    price: 0,
    description: "",
    requiresPrescription: false,
    imageUrl: "",
    imageFile: null,
  });

  const [articleForm, setArticleForm] = useState<ArticleForm>({
    title: "",
    type: "",
    content: "",
    imageUrl: "",
    imageFile: null,
  });

  const [helpForm, setHelpForm] = useState<HelpForm>({
    topic: "",
    category: "",
    content: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const token = getCookie("authToken");
        if (!token) {
          console.error("No auth token found!");
          return;
        }
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        if (!id) return;

        // Update the useEffect data mapping for therapist to include imageUrl
        if (category === "Therapist") {
          // Adjust the endpoint and mapping as per your API response
          const res = await fetch(
            `${API_URL}/therapist/${id}/details`,
            { headers }
          );
          if (!res.ok) throw new Error("Failed to fetch therapist details");
          const data = await res.json();
          setTherapistForm({
            name: data.therapist.name || "",
            email: data.therapist.email || "",
            phoneNumber: data.therapist.phone_number || "",
            location: data.therapist.location || "",
            specialization: data.therapist.specialization || "",
            consultation: data.therapist.consultation_type || "",
            appointmentRate: data.therapist.appointment_rate || 0,
            imageUrl: data.therapist.image_url || "",
            imageFile: null,
          });
        } else if (category === "Medications") {
          // Use the new endpoint to fetch medication details
          const res = await fetch(
            `${API_URL}/medications/${id}`,
            { headers }
          );
          if (!res.ok) throw new Error("Failed to fetch medication details");
          const data = await res.json();
          setMedicationForm({
            medName: data.name || "",
            stock: data.stock || 0,
            price: data.price || 0,
            description: data.description || "",
            requiresPrescription: data.requiresPrescription || false,
            imageUrl: data.image_url || "",
            imageFile: null,
          });
        } else if (category === "Articles") {
          const res = await fetch(`${API_URL}/media/${id}`, {
            headers,
          });
          if (!res.ok) throw new Error("Failed to fetch article details");
          const data = await res.json();
          setArticleForm({
            title: data.Title || "",
            type: data.Type || "",
            content: data.Content || "",
            imageUrl: data.image_url || "",
            imageFile: null,
          });
        } else if (category === "Help") {
          const res = await fetch(`${API_URL}/help/${id}`, {
            headers,
          });
          if (!res.ok) throw new Error("Failed to fetch help details");
          const data = await res.json();
          setHelpForm({
            topic: data.topic || "",
            category: data.category || "",
            content: data.content || "",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [id, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCookie("authToken");
    if (!token) {
      console.error("No auth token found!");
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    console.log("Submitting therapist form:", therapistForm);

    try {
      let res;
      if (category === "Therapist") {
        res = await fetch(`${API_URL}/therapists/${id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({
            name: therapistForm.name,
            email: therapistForm.email,
            phone_number: therapistForm.phoneNumber,
            location: therapistForm.location,
            specialization: therapistForm.specialization,
            consultation: therapistForm.consultation,
            appointment_rate: therapistForm.appointmentRate,
          }),
        });
      } else if (category === "Medications") {
        res = await fetch(`${API_URL}/medications/${id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({
            name: medicationForm.medName,
            stock: medicationForm.stock,
            price: medicationForm.price,
            description: medicationForm.description,
            requiresPrescription: medicationForm.requiresPrescription,
          }),
        });
      } else if (category === "Articles") {
        res = await fetch(`${API_URL}/media/${id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify({
            title: articleForm.title,
            content: articleForm.content,
            type: articleForm.type,
            image_url: articleForm.imageUrl,
          }),
        });
      }

      if (!res?.ok) {
        const errorData = await res?.json();
        console.error("Error updating data", errorData);
        return;
      }

      router.push("/admin-dashboard");
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/admin-dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit {category}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {category === "Therapist" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={therapistForm.name}
                        onChange={(e) =>
                          setTherapistForm({
                            ...therapistForm,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={therapistForm.email}
                        onChange={(e) =>
                          setTherapistForm({
                            ...therapistForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={therapistForm.phoneNumber}
                        onChange={(e) =>
                          setTherapistForm({
                            ...therapistForm,
                            phoneNumber: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={therapistForm.location}
                        onChange={(e) =>
                          setTherapistForm({
                            ...therapistForm,
                            location: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={therapistForm.specialization}
                        onChange={(e) =>
                          setTherapistForm({
                            ...therapistForm,
                            specialization: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consultation">Consultation Type</Label>
                      <Select
                        value={therapistForm.consultation}
                        onValueChange={(value) =>
                          setTherapistForm({
                            ...therapistForm,
                            consultation: value,
                          })
                        }
                      >
                        <SelectTrigger id="consultation">
                          <SelectValue placeholder="Select consultation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointmentRate">
                        Appointment Rate ($)
                      </Label>
                      <Input
                        id="appointmentRate"
                        type="number"
                        value={therapistForm.appointmentRate.toString()}
                        onChange={(e) =>
                          setTherapistForm({
                            ...therapistForm,
                            appointmentRate: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentImageTherapist">Current Image</Label>
                    {therapistForm.imageUrl ? (
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="3"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        <span className="text-sm truncate max-w-xs">
                          {therapistForm.imageUrl.split("/").pop() ||
                            "therapist-image.jpg"}
                        </span>
                      </div>
                    ) : (
                      <p>No image uploaded.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newImageTherapist">Upload New Image</Label>
                    <Input
                      id="newImageTherapist"
                      type="file"
                      onChange={(e) =>
                        setTherapistForm({
                          ...therapistForm,
                          imageFile: e.target.files ? e.target.files[0] : null,
                        })
                      }
                    />
                  </div>
                </>
              )}

              {category === "Medications" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medName">Medication Name</Label>
                      <Input
                        id="medName"
                        value={medicationForm.medName}
                        onChange={(e) =>
                          setMedicationForm({
                            ...medicationForm,
                            medName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={medicationForm.stock.toString()}
                        onChange={(e) =>
                          setMedicationForm({
                            ...medicationForm,
                            stock: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={medicationForm.price.toString()}
                        onChange={(e) =>
                          setMedicationForm({
                            ...medicationForm,
                            price: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="requiresPrescription"
                          checked={medicationForm.requiresPrescription}
                          onCheckedChange={(checked) =>
                            setMedicationForm({
                              ...medicationForm,
                              requiresPrescription: checked,
                            })
                          }
                        />
                        <Label htmlFor="requiresPrescription">
                          Requires Prescription
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={medicationForm.description}
                      onChange={(e) =>
                        setMedicationForm({
                          ...medicationForm,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentImageMed">Current Image</Label>
                    {medicationForm.imageUrl ? (
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="3"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        <span className="text-sm truncate max-w-xs">
                          {medicationForm.imageUrl.split("/").pop() ||
                            "medication-image.jpg"}
                        </span>
                      </div>
                    ) : (
                      <p>No image uploaded.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newImageMed">Upload New Image</Label>
                    <Input
                      id="newImageMed"
                      type="file"
                      onChange={(e) =>
                        setMedicationForm({
                          ...medicationForm,
                          imageFile: e.target.files ? e.target.files[0] : null,
                        })
                      }
                    />
                  </div>
                </>
              )}

              {category === "Articles" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={articleForm.title}
                      onChange={(e) =>
                        setArticleForm({
                          ...articleForm,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={articleForm.type}
                      onValueChange={(value) =>
                        setArticleForm({ ...articleForm, type: value })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="articleContent">
                      {articleForm.type === "video" ? "Video URL" : "Content"}
                    </Label>
                    <Textarea
                      id="articleContent"
                      value={articleForm.content}
                      onChange={(e) =>
                        setArticleForm({
                          ...articleForm,
                          content: e.target.value,
                        })
                      }
                      rows={articleForm.type === "video" ? 2 : 8}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentImageArticle">Current Image</Label>
                    {articleForm.imageUrl ? (
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="3"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                        <span className="text-sm truncate max-w-xs">
                          {articleForm.imageUrl.split("/").pop() ||
                            "article-image.jpg"}
                        </span>
                      </div>
                    ) : (
                      <p>No image uploaded.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newImageArticle">Upload New Image</Label>
                    <Input
                      id="newImageArticle"
                      type="file"
                      onChange={(e) =>
                        setArticleForm({
                          ...articleForm,
                          imageFile: e.target.files ? e.target.files[0] : null,
                        })
                      }
                    />
                  </div>
                </>
              )}

              {category === "Help" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Help Topic</Label>
                    <Input
                      id="topic"
                      value={helpForm.topic}
                      onChange={(e) =>
                        setHelpForm({ ...helpForm, topic: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="helpCategory">Category</Label>
                    <Input
                      id="helpCategory"
                      value={helpForm.category}
                      onChange={(e) =>
                        setHelpForm({ ...helpForm, category: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={helpForm.content}
                      onChange={(e) =>
                        setHelpForm({ ...helpForm, content: e.target.value })
                      }
                      rows={8}
                      required
                    />
                  </div>
                </>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push("/admin-dashboard")}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
