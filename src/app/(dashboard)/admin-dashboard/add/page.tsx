"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, FormEvent, useEffect, Suspense } from "react";
import { User, Pill, HelpCircle, BookOpen, ArrowLeft } from "lucide-react";
import {
  createTherapist,
  CreateTherapistDTO,
  uploadImage,
} from "@/app/api/user";
import { addMedication } from "@/app/api/medication";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
export const dynamic = "force-dynamic";

type TherapistForm = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  location: string;
  specialization: string;
  consultation: string;
  appointmentRate: number;
};

type MedicationsForm = {
  medName: string;
  stock: number;
  price: number;
  description: string;
  requiresPrescription: boolean;
  image: File | null;
};

type HelpForm = {
  topic: string;
  category: string;
  content: string;
};

type ArticlesForm = {
  title: string;
  type: string;
  content: string;
};

export default function AddPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialCategory, setInitialCategory] = useState<string>("Therapist");
  console.log(searchParams);

  useEffect(() => {
    const category = searchParams.get("category") || "Therapist";
    setInitialCategory(category);
  }, [searchParams]);

  // Form states based on category
  const [therapistForm, setTherapistForm] = useState<TherapistForm>({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    location: "",
    specialization: "",
    consultation: "",
    appointmentRate: 0,
  });
  const [medicationsForm, setMedicationsForm] = useState<MedicationsForm>({
    medName: "",
    stock: 0,
    price: 0,
    description: "",
    requiresPrescription: false,
    image: null,
  });
  const [helpForm, setHelpForm] = useState<HelpForm>({
    topic: "",
    category: "",
    content: "",
  });
  const [articlesForm, setArticlesForm] = useState<ArticlesForm>({
    title: "",
    type: "article",
    content: "",
  });

  const categories = [
    { name: "Therapist", icon: User, color: "bg-[#D7CEC7]" },
    { name: "Medications", icon: Pill, color: "bg-[#F3D7D7]" },
    { name: "Help", icon: HelpCircle, color: "bg-[#D7E7E8]" },
    { name: "Articles", icon: BookOpen, color: "bg-[#E1D7E8]" },
  ];

  const getCategoryColor = (name: string) => {
    return categories.find((cat) => cat.name === name)?.color || "bg-gray-200";
  };

  const getCategoryIcon = (name: string) => {
    const CategoryIcon =
      categories.find((cat) => cat.name === name)?.icon || User;
    return <CategoryIcon className="w-6 h-6" />;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (initialCategory === "Therapist") {
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
          toast.success("Therapist added successfully!");
          router.push("/admin-dashboard");
        } else {
          toast.error(`Failed to add therapist: ${result.message}`);
        }
      }

      if (initialCategory === "Medications") {
        let imageUrl = "";
        if (medicationsForm.image) {
          const uploadResult = await uploadImage(medicationsForm.image);
          if (uploadResult.success) {
            imageUrl = uploadResult.imageUrl;
          } else {
            toast.error(`Error uploading image: ${uploadResult.message}`);
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
          toast.success("Medication added successfully!");
          router.push("/admin-dashboard");
        } else {
          toast.error(`Failed to add medication: ${result.message}`);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while submitting the form.");
    }
  };

  return (
    <Suspense fallback={<div>Loading ..</div>}>
      <div className="min-h-screen bg-[#4A4A4A] text-white pt-24 px-10 sm:px-20">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-gloock">Hello, Admin!</h1>
        </header>

        <div
          className={`${getCategoryColor(
            initialCategory
          )} text-black p-4 rounded-lg`}
        >
          <div className="flex flex-row items-center justify-between mb-4">
            <button
              className="text-black flex items-center"
              onClick={() => router.push("/admin-dashboard")}
            >
              <ArrowLeft className="w-6 h-6 mr-2" />
              Back
            </button>
            <div className="text-2xl flex items-center">
              {getCategoryIcon(initialCategory)}
              <span className="ml-2">Add {initialCategory}</span>
            </div>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {initialCategory === "Therapist" && (
              <>
                <div>
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    value={therapistForm.name}
                    onChange={(e) =>
                      setTherapistForm({
                        ...therapistForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter therapist's name"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    value={therapistForm.email}
                    onChange={(e) =>
                      setTherapistForm({
                        ...therapistForm,
                        email: e.target.value,
                      })
                    }
                    placeholder="Enter email"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>

                {/* Add phone number field */}
                <div>
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    id="phoneNumber"
                    value={therapistForm.phoneNumber}
                    onChange={(e) =>
                      setTherapistForm({
                        ...therapistForm,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    value={therapistForm.password}
                    onChange={(e) =>
                      setTherapistForm({
                        ...therapistForm,
                        password: e.target.value,
                      })
                    }
                    placeholder="Enter password"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    value={therapistForm.location}
                    onChange={(e) =>
                      setTherapistForm({
                        ...therapistForm,
                        location: e.target.value,
                      })
                    }
                    placeholder="Enter location"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="specialization">Specialization</label>
                  <input
                    id="specialization"
                    value={therapistForm.specialization}
                    onChange={(e) =>
                      setTherapistForm({
                        ...therapistForm,
                        specialization: e.target.value,
                      })
                    }
                    placeholder="Enter specialization"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>

                {/* Consultation dropdown */}
                <div>
                  <label htmlFor="consultation">Consultation Type</label>
                  <select
                    id="consultation"
                    value={therapistForm.consultation}
                    onChange={(e) =>
                      setTherapistForm({
                        ...therapistForm,
                        consultation: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  >
                    <option value="">Select a consultation type</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="appointmentRate">Appointment Rate</label>
                  <input
                    id="appointmentRate"
                    type="number"
                    value={therapistForm.appointmentRate}
                    onChange={(e) =>
                      setTherapistForm({
                        ...therapistForm,
                        appointmentRate: parseFloat(e.target.value),
                      })
                    }
                    placeholder="Enter appointment rate"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </>
            )}

            {initialCategory === "Medications" && (
              <>
                <Card className="w-full max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                      Medication Registration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="medName">Medication Name</label>
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
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="stock">Stock</label>
                        <Input
                          id="stock"
                          type="number"
                          value={medicationsForm.stock.toString()}
                          onChange={(e) =>
                            setMedicationsForm({
                              ...medicationsForm,
                              stock: parseInt(e.target.value),
                            })
                          }
                          placeholder="Enter stock quantity"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="price">Price</label>
                        <Input
                          id="price"
                          type="number"
                          value={medicationsForm.price.toString()}
                          onChange={(e) =>
                            setMedicationsForm({
                              ...medicationsForm,
                              price: parseFloat(e.target.value),
                            })
                          }
                          placeholder="Enter price"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="requiresPrescription">
                          Requires Prescription
                        </label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="requiresPrescription"
                            checked={medicationsForm.requiresPrescription}
                            onCheckedChange={(checked: boolean) =>
                              setMedicationsForm({
                                ...medicationsForm,
                                requiresPrescription: checked,
                              })
                            }
                          />
                          <label htmlFor="requiresPrescription">
                            {medicationsForm.requiresPrescription
                              ? "Yes"
                              : "No"}
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="description">Description</label>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="image">Image</label>
                      <Input
                        id="image"
                        type="file"
                        onChange={(e) =>
                          setMedicationsForm({
                            ...medicationsForm,
                            image: e.target.files ? e.target.files[0] : null,
                          })
                        }
                        className="cursor-pointer"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {initialCategory === "Help" && (
              <>
                <div>
                  <label htmlFor="topic">Help Topic</label>
                  <input
                    id="topic"
                    value={helpForm.topic}
                    onChange={(e) =>
                      setHelpForm({ ...helpForm, topic: e.target.value })
                    }
                    placeholder="Enter help topic"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="category">Category</label>
                  <input
                    id="category"
                    value={helpForm.category}
                    onChange={(e) =>
                      setHelpForm({ ...helpForm, category: e.target.value })
                    }
                    placeholder="Enter category"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="content">Help Content</label>
                  <textarea
                    id="content"
                    value={helpForm.content}
                    onChange={(e) =>
                      setHelpForm({ ...helpForm, content: e.target.value })
                    }
                    placeholder="Enter help content"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </>
            )}
            {initialCategory === "Articles" && (
              <>
                <div>
                  <label htmlFor="title">Title</label>
                  <input
                    id="title"
                    value={articlesForm.title}
                    onChange={(e) =>
                      setArticlesForm({
                        ...articlesForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter title"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="type">Type</label>
                  <input
                    id="type"
                    value={articlesForm.type}
                    onChange={(e) =>
                      setArticlesForm({
                        ...articlesForm,
                        type: e.target.value,
                      })
                    }
                    placeholder="Article or Video"
                    className="w-full p-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="content">Content/URL</label>
                  <textarea
                    id="content"
                    value={articlesForm.content}
                    onChange={(e) =>
                      setArticlesForm({
                        ...articlesForm,
                        content: e.target.value,
                      })
                    }
                    placeholder="Enter content or video URL"
                    className="w-full p-2 border rounded-lg focus:outline-nonee"
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              className="w-full bg-[#4A4A4A] text-white p-2 hover:bg-[#3A3A3A] rounded-lg"
            >
              Add {initialCategory}
            </button>
          </form>
        </div>
      </div>
    </Suspense>
  );
}
