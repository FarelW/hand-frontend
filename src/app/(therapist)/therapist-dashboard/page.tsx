"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { closeSchedule } from "@/app/api/therapist";
import { getCookie } from "cookies-next";
import { fetchUpcomingAppointment } from "@/app/api/therapist";
import { DatePicker } from "@/components/ui/datePicker";
import Link from "next/link";

interface Therapist {
  image_url: string;
  name: string;
  location: string;
  appointment_rate: string;
  specialization: string;
}

interface Appointment {
  ID: string; 
  AppointmentDate: string;
  Type: string;
  Therapist: {
    ID: string;
    TherapistID: string;
  };
  User: {
    ID: string;
    name: string;
    UserID: string;
  };
  Status: string;
  Price: number;
  PaymentStatus: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TherapistClient() {
  const userId = getCookie("user_id");
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchTherapistData = async () => {
      try {
        const response = await fetch(`${API_URL}/therapist/${userId}/details`);
        const data = await response.json();
        setTherapist(data.therapist);
      } catch (error) {
        console.error("Error fetching therapist data:", error);
      }
    };

    fetchTherapistData();
  }, [userId]);

  useEffect(() => {
    const fetchAppointmentsData = async () => {
      if (userId) {
        const fetchAppointments = await fetchUpcomingAppointment(userId);
        console.log("Fetched Appointments:", fetchAppointments);
        setAppointments(fetchAppointments.appointments);
      }
    };

    fetchAppointmentsData();
  }, [userId]);

  console.log(appointments);

  const addSchedule = async () => {
    await closeSchedule(selectedDate);
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date ? date : null);
  };

  const convertToLocalTime = (dateString: string) => {
    const date = new Date(dateString);

    const localHour = date.getUTCHours() + 7;

    const startHour = localHour % 24;

    const endHour = (startHour + 2) % 24;

    const startTime = `${startHour.toString().padStart(2, "0")}:00`;
    const endTime = `${endHour.toString().padStart(2, "0")}:00`;

    return { startTime, endTime };
  };

  const formatAppointmentRate = (rate: number) => {
    return rate >= 1000 ? `${rate / 1000}k/jam` : `${rate}/jam`;
  };

  return (
    <div className="min-h-screen bg-[#FFF1E6] pt-28 px-10">
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-[#FFE9D0] rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <Image
                src={therapist?.image_url || "/therapist.png"}
                alt={therapist?.name || "Therapist"}
                width={200}
                height={200}
                className="rounded-2xl"
              />
              <div className="text-center font-teachers">
                <h2 className="text-3xl font-bold mb-2 font-teachers">
                  {therapist?.name || "Dr. Abraham"}
                </h2>
                <p className="mb-1">
                  Lokasi: {therapist?.location || "Bandung"}
                </p>
                <p className="mb-1">
                  Biaya:{" "}
                  {therapist?.appointment_rate
                    ? formatAppointmentRate(Number(therapist.appointment_rate))
                    : "100k/jam"}
                </p>
                <p className="mb-1">
                  Spesialisasi:{" "}
                  {therapist?.specialization || "Best Mental Health Doctor"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#FFE9D0] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-4xl font-bold font-gloock">Tutup Jadwal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <DatePicker onDateChange={handleDateChange} />
              <Button onClick={addSchedule} variant="outline">
                Save
              </Button>
            </div>

            <h3 className="text-4xl font-bold mb-4 mt-8 font-gloock">Lihat Jadwal</h3>
            {appointments?.length > 0 ? (
              appointments.map((appointment) => {
                const { startTime, endTime } = convertToLocalTime(
                  appointment.AppointmentDate
                );
                console.log(appointments.length);
                return (
                  <Link key={appointment.ID} href={`/therapist-dashboard/${appointment.ID}`}>
                  <Card 
                    className="bg-gray-100 p-4 flex items-center justify-between mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 rounded-full p-2">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {new Date(
                            appointment.AppointmentDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.User.name}</p>
                    </div>
                    <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                      {appointment.Type}
                      <span className="ml-2 text-sm">
                        {startTime} - {endTime}
                      </span>
                    </Button>
                  </Card>
                  </Link>
                );
              })
            ) : (
              <p>No appointments available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
