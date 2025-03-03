'use client'

import { useEffect, useState } from 'react'
import {  Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createWebSocket } from "../util/socket";

interface Mood {
  icon: string
  name: string
  id : number
}

const moods: Mood[] = [
  { icon: "/checkin/emoji1 (10).png", name: "Happy" , id: 1},
  { icon: "/checkin/emoji1 (1).png", name: "Sad" , id: 2},
  { icon: "/checkin/emoji1 (2).png", name: "Anxious", id: 3 },
  { icon: "/checkin/emoji1 (3).png", name: "Excited", id: 4},
  { icon: "/checkin/emoji1 (4).png", name: "Angry", id: 5 },
  { icon: "/checkin/emoji1 (5).png", name: "Calm" , id: 6},
  { icon: "/checkin/emoji1 (6).png", name: "Confused" , id: 7},
  { icon: "/checkin/emoji1 (7).png", name: "Lonely" , id:8},
  { icon: "/checkin/emoji1 (8).png", name: "Bored" , id:9},
  { icon: "/checkin/emoji1 (9).png", name: "Surprised" , id: 10},
]
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || ""
export default function EnhancedAnonymousChat() {
  const [step, setStep] = useState<'select' | 'finding' | 'chatting'>('select')
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)

  const [ws, setWs] = useState<WebSocket | null>(null);
  const router = useRouter();

  // Initialize WebSocket connection
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        const websocket = await createWebSocket(SOCKET_SERVER_URL); // Ensure your token is correctly passed if needed
        console.log(websocket)
        websocket.onopen = () => {
          console.log("connected");
          websocket.send(JSON.stringify({ event: "check_match", data: "" }));
        };
  
        websocket.onmessage = (event: MessageEvent) => {
          const data = JSON.parse(event.data);
          if (data.event === "matched") {
            const roomId = data.data;
            router.push(`/find/${roomId}`); // Redirect to the matched room
          }
          if (data.event === "in_queue") {
            setStep('finding');
          }

          if (data.event === "cancel_find"){
            setStep("select")
          }
        };

        setWs(websocket);
  
        websocket.onerror = (error: Event) => {
          console.error("WebSocket error:", error);
        };

        websocket.onclose = () => {
          console.log('WebSocket disconnected');
          setTimeout(initWebSocket, 1000);
        };
  

  
        return () => {
          websocket.close();
        };
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
      }
    };
  
    initWebSocket();
  }, [setWs]); // Ensure dependencies are correctly listed

  const handleFindMatch = () => {
    if (selectedMood && ws) {
      ws.send(JSON.stringify({
        event: "find_match",
        data: JSON.stringify({ emote: selectedMood.id }),
      }));
    }
  };

  const handleCancelFind = () => {
    if ( ws) {
      ws.send(JSON.stringify({
        event: "cancel_find",
        data: "",
      }));
    }
  };
  return (
    <div className="h-screen bg-[#F0F8FF] max-h-screen font-sans flex flex-col items-center justify-center p-4">
      <div className='w-full  h-[100px] sm:h-[60px]'>


      </div>
      <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 overflow-y-scroll lg:overflow-y-hidden">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-gray-800 text-center font-gloock">Chat Anonymously</h1>

        {step === 'select' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-700 text-center">How are you feeling right now?</h2>
            <div className="flex flex-rows gap-8 flex-wrap items-center justify-center">
              {moods.map((mood) => (
                <button
                  key={mood.name}
                  onClick={() => setSelectedMood(mood)}
                  className={`p-2 relative rounded-lg w-[100px] h-[100px]  text-center transition-all aspect-square ${
                    selectedMood?.name === mood.name
                      ? 'bg-[#FFD3E4] ring-2 ring-pink-400'
                      : 'bg-[#A4E0F2] hover:bg-[#FFD3E4] hover:shadow-md'
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image src={mood.icon} alt={mood.name} layout="fill" objectFit="cover" />
                  </div>
                  <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">{mood.name}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-center mt-10">
              <Button
                className="px-8 py-3 bg-[#FFD3E4] text-pink-600 hover:bg-pink-200 transition-all duration-300 transform hover:scale-105"
                onClick={handleFindMatch}
                disabled={!selectedMood}
              >
                Find a Chat Partner
              </Button>
            </div>
          </div>
        )}

        {step === 'finding' && (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <Loader className="h-16 w-16 animate-spin mx-auto mb-6 text-pink-500" />
            <p className="text-xl text-gray-700">Finding someone who feels {selectedMood?.name.toLowerCase()}...</p>
            <Button
                className="px-8 py-3 bg-[#FFD3E4] text-pink-600 hover:bg-pink-200 transition-all duration-300 transform hover:scale-105"
                onClick={handleCancelFind}
              >
                Cancel Find
              </Button>
          </div>
        )}

       
      </div>
    </div>
  )
}