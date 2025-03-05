"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import {
  Minus,
  Plus,
  MessageCircle,
  Calendar,
  Smile,
  Meh,
  Frown,
  ChevronLeft,
} from "lucide-react";
import { SaveConsultation } from "@/app/api/consultation";
import { getAllMedications } from "@/app/api/medicationService";
import { GetUserByAppointmentID } from "@/app/api/consultation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { get30DaysMoodHistory } from "@/app/api/service";
import { useParams, useSearchParams } from "next/navigation";
import { getPastAppointment, PastAppointment } from "@/app/api/appointment";
import { useRouter } from "next/navigation";

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

interface User {
  id: string;
  name: string;
}

interface CheckIn {
  id?: string;
  mood_score: number;
  check_in_date: string;
}

const emotions = [
  { emoji: "/checkIn/emoji1 (9).png", id: 1 },
  { emoji: "/checkIn/emoji1 (8).png", id: 2 },
  { emoji: "/checkIn/emoji1 (7).png", id: 3 },
  { emoji: "/checkIn/emoji1 (6).png", id: 4 },
  { emoji: "/checkIn/emoji1 (10).png", id: 5 },
  { emoji: "/checkIn/emoji1 (1).png", id: 6 },
  { emoji: "/checkIn/emoji1 (3).png", id: 7 },
  { emoji: "/checkIn/emoji1 (4).png", id: 8 },
  { emoji: "/checkIn/emoji1 (5).png", id: 9 },
  { emoji: "/checkIn/emoji1 (2).png", id: 10 },
];

const generateCompleteMoodHistory = (rawData: CheckIn[]): CheckIn[] => {
  const today = new Date();
  const completeData: CheckIn[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dateString = date.toLocaleDateString("en-CA");

    const moodData = rawData.find(
      (data) =>
        new Date(data.check_in_date).toLocaleDateString("en-CA") === dateString
    );

    completeData.push({
      id: moodData?.id || dateString,
      mood_score: moodData?.mood_score ?? 5,
      check_in_date: date.toISOString(),
    });
  }

  return completeData;
};

export default function MedicationConsultation() {
  const params = useParams();
  const searchParams = useSearchParams();
  const appointmentID = params?.id as string;
  const userID = searchParams.get("userID") as string;
  const therapistID = searchParams.get("therapistID") as string;
  const [medications, setMedications] = useState<Medication[]>([]);
  const [user, setUser] = useState<User>();
  const [selectedMedications, setSelectedMedications] = useState<
    SelectedMedication[]
  >([]);
  const [consultationNotes, setConsultationNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState("consultation");
  const [moodHistory, setMoodHistory] = useState<CheckIn[]>([]);
  const [pastAppointments, setPastAppointments] = useState<PastAppointment[]>(
    []
  );
  const router = useRouter();

  useEffect(() => {
    const fetchMoodHistory = async () => {
      const data = await get30DaysMoodHistory(userID);
      const completeData = generateCompleteMoodHistory(data);
      setMoodHistory(completeData);
    };

    fetchMoodHistory();
  }, []);

  const getMoodEmoji = (moodScore: number) => {
    const mood = emotions.find((e) => e.id === moodScore);
    return mood ? (
      <Image
        src={mood.emoji}
        alt="mood"
        width={32}
        height={32}
        className="w-8 h-8"
      />
    ) : null;
  };

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
        const user = await GetUserByAppointmentID(appointmentID);
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [appointmentID]);

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
      await SaveConsultation(
        consultationNotes,
        selectedMedications,
        appointmentID
      );
      alert("Consultation saved successfully!");
    } catch (error) {
      console.error("Error saving consultation:", error);
      alert("There was an error saving the consultation.");
    }
  };

  useEffect(() => {
    const fetchAppointmentHistory = async () => {
      const data = await getPastAppointment(userID, therapistID);
      setPastAppointments(data);
    };

    fetchAppointmentHistory();
  }, [userID, therapistID]);

  return (
    <div className="min-h-screen bg-[#FFF5EB] pt-20 px-4 md:px-10">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            href="/therapist-dashboard"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-md rounded-xl overflow-hidden sticky top-24">
              <CardHeader className="bg-[#FFE9D0] pb-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage
                      src="/placeholder.svg?height=96&width=96"
                      alt={user?.name || "Patient"}
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl font-bold">
                    {user?.name || "Patient Name"}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Patient ID: {user?.id || "P12345"}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Monthly Mood</h3>
                <div className="grid grid-cols-6 gap-1 mb-6">
                  {moodHistory.slice(-12).map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#FFE9D0] flex items-center justify-center">
                        {getMoodEmoji(day.mood_score)}
                      </div>
                      <span className="text-xs mt-1">
                        {new Date(day.check_in_date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full mb-4"
                  variant="outline"
                  onClick={() => setActiveTab("mood")}
                >
                  View Full Mood History
                </Button>

                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(`/therapist-dashboard/chat?userID=${userID}`)
                  }
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Patient
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-9">
            <Tabs
              defaultValue="consultation"
              className="w-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="consultation">Consultation</TabsTrigger>
                <TabsTrigger value="history">Past Appointments</TabsTrigger>
                <TabsTrigger value="mood">Mood History</TabsTrigger>
              </TabsList>

              <TabsContent value="consultation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Medication Recommendations</CardTitle>
                    <CardDescription>
                      Prescribe medications for the patient
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <Label
                        htmlFor="medication-select"
                        className="text-lg font-semibold mb-2 block"
                      >
                        Select Medication
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
                                  src={med.image_url || "/placeholder.svg"}
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

                    <div className="mb-6 space-y-3">
                      {selectedMedications.map((med) => (
                        <div
                          key={med.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-[#FFE9D0] rounded-lg"
                        >
                          <div className="flex items-center mb-2 sm:mb-0">
                            <Image
                              src={med.image_url || "/placeholder.svg"}
                              alt={med.name}
                              width={40}
                              height={40}
                              className="mr-3"
                            />
                            <div>
                              <h4 className="font-medium">{med.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Stock: {med.stock}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleQuantityChange(med.id, -1)}
                                disabled={med.quantity <= 1}
                                className="h-8 w-8"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">
                                {med.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleQuantityChange(med.id, 1)}
                                disabled={med.quantity >= med.stock}
                                className="h-8 w-8"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <input
                              type="text"
                              className="px-3 py-1 border border-gray-300 rounded-md"
                              placeholder="Dosage (e.g., 1 pill daily)"
                              value={med.dosage}
                              onChange={(e) =>
                                handleDosageChange(med.id, e.target.value)
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Consultation Notes</CardTitle>
                    <CardDescription>
                      Document your observations and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-[#F8F8F8] p-4 rounded-lg">
                      <Textarea
                        value={consultationNotes}
                        onChange={(e) => setConsultationNotes(e.target.value)}
                        className="w-full min-h-[300px] resize-none bg-transparent focus:outline-none"
                        style={{
                          backgroundImage: `repeating-linear-gradient(transparent, transparent 31px, #ccc 31px, #ccc 32px)`,
                          backgroundAttachment: "local",
                          lineHeight: "32px",
                          padding: "8px",
                          border: "none",
                        }}
                        placeholder="Enter consultation notes here..."
                      />
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={handleFinishConsultation}
                        className="px-6"
                      >
                        Save Consultation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Past Appointments</CardTitle>
                    <CardDescription>
                      Previous consultation history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pastAppointments.length > 0 ? (
                      <div className="space-y-6">
                        {pastAppointments.map((appointment) => (
                          <div
                            key={appointment.appointment_id}
                            className="border rounded-lg overflow-hidden"
                          >
                            <div className="bg-[#FFE9D0] p-4 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">
                                  {new Date(
                                    appointment.date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <Badge variant="outline">Completed</Badge>
                            </div>
                            <div className="p-4">
                              <h4 className="font-medium mb-2">Notes:</h4>
                              <p className="text-muted-foreground mb-4">
                                {appointment.conclusion || "No notes available"}
                              </p>

                              <h4 className="font-medium mb-2">
                                Prescribed Medications:
                              </h4>
                              {appointment.medications &&
                              appointment.medications.length > 0 ? (
                                <ul className="list-disc list-inside text-muted-foreground">
                                  {appointment.medications.map((med, index) => (
                                    <li key={index}>
                                      {med.name} - {med.dosage || "No dosage"} (
                                      {med.quantity || "No quantity"})
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground">
                                  No medications prescribed
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-muted-foreground">
                        No past appointments found
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mood" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>30-Day Mood History</CardTitle>
                    <CardDescription>
                      Patient&apos;s emotional wellbeing over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(
                            Date.now() - 29 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full mb-4">
                        <div
                          className="h-2 bg-[#FFE9D0] rounded-full"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-15 gap-2">
                      {moodHistory.map((day, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-[#FFE9D0] flex items-center justify-center">
                            {getMoodEmoji(day.mood_score)}
                          </div>
                          <span className="text-xs mt-1">
                            {new Date(day.check_in_date).getDate()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(day.check_in_date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                              }
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-[#FFE9D0] rounded-lg">
                        <Smile className="h-6 w-6 text-green-500 mx-auto mb-2" />
                        <p className="font-medium">
                          {
                            moodHistory.filter((d) =>
                              [8, 9, 10].includes(d.mood_score)
                            ).length
                          }{" "}
                          Happy Days
                        </p>
                      </div>

                      <div className="p-3 bg-[#FFE9D0] rounded-lg">
                        <Meh className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                        <p className="font-medium">
                          {
                            moodHistory.filter((d) =>
                              [4, 5, 6, 7].includes(d.mood_score)
                            ).length
                          }{" "}
                          Neutral Days
                        </p>
                      </div>

                      <div className="p-3 bg-[#FFE9D0] rounded-lg">
                        <Frown className="h-6 w-6 text-red-500 mx-auto mb-2" />
                        <p className="font-medium">
                          {
                            moodHistory.filter((d) =>
                              [1, 2, 3].includes(d.mood_score)
                            ).length
                          }{" "}
                          Sad Days
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mood Analysis</CardTitle>
                    <CardDescription>
                      Insights from patient&apos;s mood patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Based on the patient&apos;s mood history, there appears to
                      be fluctuations in emotional wellbeing. Consider
                      discussing potential triggers and coping strategies during
                      your next consultation.
                    </p>

                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>Continue monitoring mood patterns</li>
                      <li>
                        Explore correlation between activities and mood changes
                      </li>
                      <li>Consider cognitive behavioral therapy techniques</li>
                      <li>Evaluate effectiveness of current treatment plan</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="fixed bottom-6 right-6">
          <Link href="/chat">
            <Button className="rounded-full h-14 w-14 shadow-lg">
              <MessageCircle className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
