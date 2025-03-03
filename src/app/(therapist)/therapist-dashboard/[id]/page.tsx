"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Plus } from "lucide-react";
import { SaveConsultation } from "@/app/api/consultation";
import { getAllMedications } from "@/app/api/medicationService";
import { GetUserByAppointmentID } from "@/app/api/consultation";

export interface Medication {
  id: string;
  image_url: string;
  stock: number;
  name: string;
  price: number;
  description: string;
  requiresPrescription: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SelectedMedication extends Medication {
  quantity: number;
  dosage: string;
}

interface TherapistPovProps {
  params: {
    id: string;
  };
}

interface User {
  id: string;
  name: string;
}

export default function MedicationConsultation({ params }: TherapistPovProps) {
  const { id } = params;
  console.log("params", params);
  console.log(id);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [user, setUser] = useState<User>();
  const [selectedMedications, setSelectedMedications] = useState<
    SelectedMedication[]
  >([]);
  const [consultationNotes, setConsultationNotes] = useState<string>("");

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const meds = await getAllMedications();
        setMedications(meds);
      } catch (error) {
        console.error("Error fetching medications:", error);
      }
    };

    fetchMedications();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await GetUserByAppointmentID(id);
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error("Error fetching medications:", error);
      }
    };

    fetchUser();
  }, []);

  const handleMedicationSelect = (medicationId: string) => {
    const medication = medications.find((med) => med.id === medicationId);
    if (
      medication &&
      !selectedMedications.find((med) => med.id === medication.id)
    ) {
      setSelectedMedications([
        ...selectedMedications,
        { ...medication, quantity: 1, dosage: "" },
      ]);
    }
  };

  const handleQuantityChange = (medicationId: string, change: number) => {
    setSelectedMedications(
      selectedMedications.map((med) =>
        med.id === medicationId
          ? {
              ...med,
              quantity: Math.max(1, Math.min(med.quantity + change, med.stock)),
            }
          : med
      )
    );
  };

  const handleDosageChange = (medicationId: string, newDosage: string) => {
    setSelectedMedications(
      selectedMedications.map((med) =>
        med.id === medicationId ? { ...med, dosage: newDosage } : med
      )
    );
  };

  const handleFinishConsultation = async () => {
    try {
      await SaveConsultation(consultationNotes, selectedMedications, id);
    } catch (error) {
      console.error("Error saving consultation:", error);
      alert("There was an error saving the consultation.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EB] pt-28 px-10 :sm:px-20">
      <div className="w-full bg-[#FFE9D0] rounded-lg shadow-lg overflow-hidden px-4 pt-4">
        <div className="flex flex-col sm:flex-row gap-10">
          <div className="w-full sm:w-1/3 bg-[#FFE9D0]">
            <div className="flex items-center mb-6 justify-center">
              <Image
                src="/therapist.png"
                alt="User"
                width={200}
                height={50}
                className="rounded-full mr-4 bg-white"
              />
              <div>
                <h1 className="text-2xl font-bold">{user?.name}</h1>
              </div>
            </div>

            <div className="mb-6">
              <Label
                htmlFor="medication-select"
                className="text-lg font-semibold mb-2 block"
              >
                Medication
              </Label>
              <Select onValueChange={handleMedicationSelect}>
                <SelectTrigger
                  id="medication-select"
                  className="w-full bg-white"
                >
                  <SelectValue placeholder="Select a medication" />
                </SelectTrigger>
                <SelectContent>
                  {medications.map((med) => (
                    <SelectItem key={med.id} value={med.id}>
                      <div className="flex items-center">
                        <Image
                          src={med.image_url}
                          alt={med.name}
                          width={30}
                          height={30}
                          className="mr-2"
                        />
                        {med.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-6">
              {selectedMedications.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between mb-2 p-2 bg-white rounded"
                >
                  <div className="flex items-center">
                    <Image
                      src={med.image_url}
                      alt={med.name}
                      width={30}
                      height={30}
                      className="mr-2"
                    />
                    <span>{med.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(med.id, -1)}
                      disabled={med.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-2">{med.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(med.id, 1)}
                      disabled={med.quantity >= med.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <input
                    type="text"
                    className="ml-4 p-1 border border-gray-300 rounded"
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={(e) => handleDosageChange(med.id, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <Button onClick={handleFinishConsultation} className="w-full">
              Consultation finish
            </Button>
          </div>

          <div className="w-2/3 bg-transparent">
            <h2 className="text-2xl font-bold mb-4 text-center font-gloock">
              Consultation Notes
            </h2>
            <div className="bg-[#F8F8F8] p-4 rounded-lg h-[calc(100vh-200px)] overflow-hidden">
              <Textarea
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                className="w-full h-full resize-none bg-transparent focus:outline-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(transparent, transparent 31px, #ccc 31px, #ccc 32px)`,
                  backgroundAttachment: "local",
                  lineHeight: "32px",
                  padding: "0",
                  border: "none",
                }}
                placeholder="Enter consultation notes here..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
