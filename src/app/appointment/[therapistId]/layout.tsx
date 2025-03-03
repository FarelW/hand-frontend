"use client";
import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { UserIcon, CalendarIcon, MessageCircleIcon } from "lucide-react";
import { createWebSocket } from "../../util/socket";
import { useRouter } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
  params: {
    therapistId: string;
  };
}

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || ""

export default function AppointmentLayout({ children, params }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { therapistId } = params;
  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();
  const menuItems = [
    {
      id: "pick",
      label: "Pick Your Therapist",
      icon: UserIcon,
      href: "/consultation",
    },
    {
      id: "details",
      label: "Details & Appointment",
      icon: CalendarIcon,
      href: "#",
    },
    {
      id: "chat",
      label: "Chat the Therapist",
      icon: MessageCircleIcon,
      href: "#",
    },
  ];

  useEffect(() => {
    const initWebSocket = async () => {
      try {
        const websocket = await createWebSocket(SOCKET_SERVER_URL); // Ensure your token is correctly passed if needed
  
        websocket.onopen = () => {
          console.log("connected");
          websocket.send(JSON.stringify({ event: "check_match", data: "" }));
        };
  
        websocket.onmessage = (event: MessageEvent) => {
          const data = JSON.parse(event.data);
          if (data.event === "enter_room") {
            const roomId = data.data;
            router.push(`/appointment/${therapistId}/chat/${roomId}`); // Redirect to the matched room
          }
          
        };
  
        websocket.onerror = (error: Event) => {
          console.error("WebSocket error:", error);
        };
  
        setWs(websocket);
  
        return () => {
          websocket.close();
        };
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
      }
    };
  
    initWebSocket();
  }, [setWs]); // Ensure dependencies are correctly listed

  const handleMenuClick = (id: string) => {
    if (id === "chat" && ws) {
      ws.send(JSON.stringify({ event: "chat_therapy", data: therapistId }));
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-4 bg-[#FFF6EF]">
      <div className="max-w-full mx-auto">
        <div className="lg:flex lg:gap-8">
          <aside className="lg:w-64">
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <span>Menu</span>
                <svg
                  className={`h-5 w-5 transform ${isOpen ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <nav
              className={`space-y-2 ${isOpen ? "block" : "hidden lg:block"}`}
            >
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleMenuClick(item.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out bg-white text-gray-700 hover:bg-gray-50`}
                >
                  {React.createElement(item.icon, {
                    className: "w-5 h-5 mr-3",
                  })}
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="mt-8 lg:mt-0 lg:flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
