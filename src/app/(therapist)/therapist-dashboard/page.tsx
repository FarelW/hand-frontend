"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MessageCircle,
  Clock,
  MapPin,
  DollarSign,
  Award,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/datePicker";
import { closeSchedule, fetchUpcomingAppointment } from "@/app/api/therapist";
import { getCookie } from "cookies-next";

interface Therapist {
  image_url: string;
  name: string;
  location: string;
  appointment_rate: string;
  specialization: string;
}

interface Appointment {
  ID: string;
  TherapistID: string;
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

export default function TherapistDashboard() {
  const userId = getCookie("user_id");
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [totalAppointments, setTotalAppointments] = useState<number>();
  const [completedAppointments, setCompletedAppointments] = useState<number>();
  const [upcomingAppointments, setUpcomingAppointments] = useState<number>();

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
        setAppointments(fetchAppointments.appointments || []);
      }
    };

    fetchAppointmentsData();
  }, [userId]);

  const addSchedule = async () => {
    if (selectedDate) {
      await closeSchedule(selectedDate);
      alert("Schedule closed successfully!");
    } else {
      alert("Please select a date first");
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date ? date : null);
  };

  const convertToLocalTime = (dateString: string) => {
    const date = new Date(dateString);
    const localHour = date.getUTCHours() + 7;
    const startHour = localHour % 24;
    const endHour = (startHour + 1) % 24;
    const startTime = `${startHour.toString().padStart(2, "0")}:00`;
    const endTime = `${endHour.toString().padStart(2, "0")}:00`;
    return { startTime, endTime };
  };

  const formatAppointmentRate = (rate: number) => {
    return rate >= 1000 ? `${rate / 1000}k/jam` : `${rate}/jam`;
  };

  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const response = await fetch(
          `${API_URL}/therapist/${userId}/blocked-dates`
        );
        const data = await response.json();
        setBlockedDates(
          data.blocked_dates.map((d: { date: string }) => d.date)
        );
      } catch (error) {
        console.error("Error fetching blocked dates:", error);
        setBlockedDates([]);
      }
    };

    if (userId) {
      fetchBlockedDates();
    }
  }, [userId]);

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    const fetchAppointmentSummary = async () => {
      try {
        const response = await fetch(
          `${API_URL}/appointment/therapist/${userId}/appointment-summary`
        );
        const data = await response.json();

        const summary = data.summary || {
          total_appointments: 0,
          completed_appointments: 0,
          upcoming_appointments: 0,
        };

        setTotalAppointments(summary.total_appointments);
        setCompletedAppointments(summary.completed_appointments);
        setUpcomingAppointments(summary.upcoming_appointments);
      } catch (error) {
        console.error("Error fetching appointment summary:", error);
        setTotalAppointments(0);
        setCompletedAppointments(0);
        setUpcomingAppointments(0);
      }
    };

    if (userId) {
      fetchAppointmentSummary();
    }
  }, [userId]);

  return (
    <div className="min-h-screen bg-[#FFF5EB]">
      <div className="container mx-auto px-4 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-md rounded-xl overflow-hidden sticky top-28">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage
                      src={therapist?.image_url || "/therapist.png"}
                      alt={therapist?.name || "Therapist"}
                    />
                    <AvatarFallback>
                      {therapist?.name?.charAt(0) || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold font-teachers">
                    {therapist?.name || "Dr. Abraham"}
                  </h2>
                  <p className="text-muted-foreground">Therapist</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{therapist?.location || "Bandung"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span>
                      {therapist?.appointment_rate
                        ? formatAppointmentRate(
                            Number(therapist.appointment_rate)
                          )
                        : "100k/jam"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <span>{therapist?.specialization || "Mental Health"}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="w-full" variant="outline">
                    <Link
                      href="/profile"
                      className="flex items-center justify-center w-full"
                    >
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <Tabs
              defaultValue="overview"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="schedule">Manage Schedule</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Appointments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {totalAppointments}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Upcoming
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {upcomingAppointments}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Completed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {completedAppointments}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>
                      Your next scheduled sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {appointments.length > 0 ? (
                      <div className="space-y-4">
                        {appointments.slice(0, 3).map((appointment) => {
                          const { startTime, endTime } = convertToLocalTime(
                            appointment.AppointmentDate
                          );
                          return (
                            <Link
                              key={appointment.ID}
                              href={`/therapist-dashboard/${appointment.ID}?userID=${appointment.User.ID}&therapistID=${appointment.TherapistID}`}
                            >
                              <div className="flex items-center justify-between p-4 rounded-lg bg-[#FFE9D0] hover:bg-[#FFD6B0] transition-colors">
                                <div className="flex items-center gap-4">
                                  <Avatar>
                                    <AvatarFallback>
                                      <User className="h-5 w-5" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {appointment.User.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(
                                        appointment.AppointmentDate
                                      ).toLocaleDateString()}{" "}
                                      • {startTime}-{endTime}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={getAppointmentStatusColor(
                                    appointment.Status.toLowerCase()
                                  )}
                                >
                                  {appointment.Type}
                                </Badge>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-muted-foreground">
                        No upcoming appointments
                      </p>
                    )}
                  </CardContent>
                  {appointments.length > 3 && (
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("appointments")}
                      >
                        View All Appointments
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                    <CardDescription>
                      Manage your upcoming and past sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {appointments.length > 0 ? (
                      <div className="space-y-4">
                        {appointments.map((appointment) => {
                          const { startTime, endTime } = convertToLocalTime(
                            appointment.AppointmentDate
                          );
                          return (
                            <Link
                              key={appointment.ID}
                              href={`/therapist-dashboard/${appointment.ID}`}
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-[#FFE9D0] hover:bg-[#FFD6B0] transition-colors">
                                <div className="flex items-center gap-4 mb-2 md:mb-0">
                                  <Avatar>
                                    <AvatarFallback>
                                      <User className="h-5 w-5" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {appointment.User.name}
                                    </p>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {new Date(
                                        appointment.AppointmentDate
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center text-sm">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {startTime}-{endTime}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={getAppointmentStatusColor(
                                      appointment.Status.toLowerCase()
                                    )}
                                  >
                                    {appointment.Type}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-2"
                                  >
                                    <ChevronRight className="h-5 w-5" />
                                  </Button>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-muted-foreground">
                        No appointments available
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="fixed bottom-6 right-6">
                  <Link href="/chat">
                    <Button className="rounded-full h-14 w-14 shadow-lg">
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                  </Link>
                </div>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Your Schedule</CardTitle>
                    <CardDescription>
                      Block dates when you're unavailable
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <DatePicker onDateChange={handleDateChange} />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            Selected Date
                          </h3>
                          {selectedDate ? (
                            <p className="text-2xl font-bold">
                              {selectedDate.toLocaleDateString()}
                            </p>
                          ) : (
                            <p className="text-muted-foreground">
                              No date selected
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={addSchedule}
                          disabled={!selectedDate}
                          className="mt-4"
                        >
                          Block This Date
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Blocked Dates</CardTitle>
                    <CardDescription>
                      Dates you've marked as unavailable
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {blockedDates.length > 0 ? (
                      <ul className="space-y-2">
                        {blockedDates.map((date) => (
                          <li
                            key={date}
                            className="text-center bg-[#FFE9D0] rounded-md py-2"
                          >
                            {new Date(date).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center py-6 text-muted-foreground">
                        No blocked dates yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
