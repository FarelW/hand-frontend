"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Users,
  Pill,
  HelpCircle,
  BookOpen,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  createTherapist,
  type CreateTherapistDTO,
  uploadImage,
} from "@/app/api/user";
import { addMedication } from "@/app/api/medication";
import { addMedia } from "@/app/api/media";

export default function AddPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string>("Therapist");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(0);

  const [therapistForm, setTherapistForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    location: "",
    specialization: "",
    consultation: "online",
    appointmentRate: 0,
  });

  const [medicationsForm, setMedicationsForm] = useState({
    medName: "",
    stock: 0,
    price: 0,
    description: "",
    requiresPrescription: false,
    image: null as File | null, 
    imagePreview: "",
  });


  const [articlesForm, setArticlesForm] = useState({
    title: "",
    type: "article", 
    content: "",
    image: null as File | null, 
    imagePreview: "", 
  });

  useEffect(() => {
    const categoryParam = searchParams.get("category") || "Therapist";
    setCategory(categoryParam);
  }, [searchParams]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formType: "medications" | "articles"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (formType === "medications") {
        setMedicationsForm({
          ...medicationsForm,
          image: file,
          imagePreview: URL.createObjectURL(file),
        });
      } else if (formType === "articles") {
        setArticlesForm({
          ...articlesForm,
          image: file,
          imagePreview: URL.createObjectURL(file),
        });
      }
    }
  };

  const nextStep = () => {
    setFormStep(formStep + 1);
  };

  const prevStep = () => {
    setFormStep(formStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (category === "Therapist") {
        const therapistPayload: CreateTherapistDTO = {
          name: therapistForm.name,
          email: therapistForm.email,
          phone_number: therapistForm.phoneNumber,
          password: therapistForm.password,
          location: therapistForm.location,
          specialization: therapistForm.specialization,
          consultation: therapistForm.consultation,
          appointment_rate: therapistForm.appointmentRate,
        };

        const result = await createTherapist(therapistPayload);
        if (result.success) {
          toast.success("Therapist added successfully");
          router.push("/admin-dashboard");
        } else {
          toast.error(`Failed to add therapist: ${result.message}`);
        }
      } else if (category === "Medications") {
        let imageUrl = "";
        if (medicationsForm.image) {
          const uploadResult = await uploadImage(medicationsForm.image);
          if (uploadResult.success) {
            imageUrl = uploadResult.imageUrl;
          } else {
            toast.error(`Error uploading image: ${uploadResult.message}`);
            setIsSubmitting(false);
            return;
          }
        }

        const medicationPayload = {
          medName: medicationsForm.medName,
          stock: medicationsForm.stock,
          price: medicationsForm.price,
          description: medicationsForm.description,
          requiresPrescription: medicationsForm.requiresPrescription,
          image_url: imageUrl,
        };

        const result = await addMedication(medicationPayload);
        if (result.success) {
          toast.success("Medication added successfully");
          router.push("/admin-dashboard");
        } else {
          toast.error(`Failed to add medication: ${result.message}`);
        }
      } else if (category === "Help" || category === "articles") {
        let imageUrl = "";
        if (articlesForm.image) {
          const uploadResult = await uploadImage(articlesForm.image);
          if (uploadResult.success) {
            imageUrl = uploadResult.imageUrl;
          } else {
            toast.error(`Error uploading image: ${uploadResult.message}`);
            setIsSubmitting(false);
            return;
          }
        }

        const mediaPayload = {
          title: articlesForm.title,
          type: articlesForm.type,
          content: articlesForm.content,
          image_url: imageUrl,
        };

        const result = await addMedia(mediaPayload);
        if (result.success) {
          toast.success("Media added successfully");
          router.push("/admin-dashboard");
        } else {
          toast.error(`Failed to add media: ${result.message}`);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case "Therapist":
        return <Users className="h-6 w-6" />;
      case "Medications":
        return <Pill className="h-6 w-6" />;
      case "Help":
        return <HelpCircle className="h-6 w-6" />;
      case "articles":
        return <BookOpen className="h-6 w-6" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case "Therapist":
        return "bg-blue-600";
      case "Medications":
        return "bg-purple-600";
      case "Help":
        return "bg-green-600";
      case "articles":
        return "bg-amber-600";
      default:
        return "bg-blue-600";
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
          <CardHeader className={`${getCategoryColor()} text-white`}>
            <div className="flex items-center gap-2">
              {getCategoryIcon()}
              <CardTitle className="text-2xl">Add {category}</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {category === "Therapist" && (
              <Tabs value={`step-${formStep}`} className="w-full">
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="step-0" disabled>
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="step-1" disabled>
                    Professional Details
                  </TabsTrigger>
                  <TabsTrigger value="step-2" disabled>
                    Confirmation
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="step-0" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={therapistForm.name}
                        onChange={(e) =>
                          setTherapistForm({
                            ...therapistForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter therapist's full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
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
                        placeholder="Enter email address"
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
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={therapistForm.password}
                        onChange={(e) =>
                          setTherapistForm({
                            ...therapistForm,
                            password: e.target.value,
                          })
                        }
                        placeholder="Create a password"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={nextStep}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next Step
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="step-1" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="Enter location"
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
                        placeholder="Enter specialization"
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
                        placeholder="Enter hourly rate"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={prevStep}>
                      Previous Step
                    </Button>
                    <Button
                      onClick={nextStep}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Review Details
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="step-2">
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="font-semibold text-lg mb-4">
                        Review Therapist Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium">{therapistForm.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email Address</p>
                          <p className="font-medium">{therapistForm.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium">
                            {therapistForm.phoneNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">
                            {therapistForm.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Specialization
                          </p>
                          <p className="font-medium">
                            {therapistForm.specialization}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Consultation Type
                          </p>
                          <p className="font-medium capitalize">
                            {therapistForm.consultation}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Appointment Rate
                          </p>
                          <p className="font-medium">
                            ${therapistForm.appointmentRate}/hr
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={prevStep}>
                        Previous Step
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? "Adding..." : "Add Therapist"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {category === "Medications" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="medName">Medication Name</Label>
                      <Input
                        id="medName"
                        value={medicationsForm.medName}
                        onChange={(e) =>
                          setMedicationsForm({
                            ...medicationsForm,
                            medName: e.target.value,
                          })
                        }
                        placeholder="Enter medication name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Quantity</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={medicationsForm.stock.toString()}
                        onChange={(e) =>
                          setMedicationsForm({
                            ...medicationsForm,
                            stock: Number(e.target.value),
                          })
                        }
                        placeholder="Enter stock quantity"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={medicationsForm.price.toString()}
                        onChange={(e) =>
                          setMedicationsForm({
                            ...medicationsForm,
                            price: Number(e.target.value),
                          })
                        }
                        placeholder="Enter price"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requiresPrescription"
                        checked={medicationsForm.requiresPrescription}
                        onCheckedChange={(checked) =>
                          setMedicationsForm({
                            ...medicationsForm,
                            requiresPrescription: checked,
                          })
                        }
                      />
                      <Label htmlFor="requiresPrescription">
                        Requires Prescription
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={medicationsForm.description}
                        onChange={(e) =>
                          setMedicationsForm({
                            ...medicationsForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter medication description"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Medication Image</Label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() =>
                          document.getElementById("image")?.click()
                        }
                      >
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, "medications")}
                        />
                        {medicationsForm.imagePreview ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={
                                medicationsForm.imagePreview ||
                                "/placeholder.svg"
                              }
                              alt="Medication preview"
                              className="max-h-40 object-contain mb-2"
                            />
                            <p className="text-sm text-gray-500">
                              Click to change image
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm font-medium">
                              Click to upload an image
                            </p>
                            <p className="text-xs text-gray-500">
                              SVG, PNG, JPG or GIF (max. 2MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {category === "articles" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={articlesForm.title}
                      onChange={(e) =>
                        setArticlesForm({
                          ...articlesForm,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Content Type</Label>
                    <Select
                      value={articlesForm.type}
                      onValueChange={(value) =>
                        setArticlesForm({ ...articlesForm, type: value })
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
                      {articlesForm.type === "video"
                        ? "Video URL"
                        : "Article Content"}
                    </Label>
                    <Textarea
                      id="articleContent"
                      value={articlesForm.content}
                      onChange={(e) =>
                        setArticlesForm({
                          ...articlesForm,
                          content: e.target.value,
                        })
                      }
                      placeholder={
                        articlesForm.type === "video"
                          ? "Enter video URL"
                          : "Enter article content"
                      }
                      rows={articlesForm.type === "video" ? 2 : 10}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Media Image</Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => document.getElementById("image")?.click()}
                    >
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, "articles")}
                      />
                      {articlesForm.imagePreview ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={
                              articlesForm.imagePreview || "/placeholder.svg"
                            }
                            alt="Article preview"
                            className="max-h-40 object-contain mb-2"
                          />
                          <p className="text-sm text-gray-500">
                            Click to change image
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm font-medium">
                            Click to upload an image
                          </p>
                          <p className="text-xs text-gray-500">
                            SVG, PNG, JPG or GIF (max. 2MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push("/admin-dashboard")}
            >
              Cancel
            </Button>
            {(category === "Medications" ||
              category === "Help" ||
              category === "articles") && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`${getCategoryColor()} hover:opacity-90`}
              >
                {isSubmitting ? "Adding..." : `Add ${category}`}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
