'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Send } from 'lucide-react'
import { createWebSocket } from '@/app/util/socket'
import { ChatMessage } from '@/app/find/[roomId]/page'
import { getCookie } from 'cookies-next'
import { fetchChatMessages } from '@/app/api/service'


const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || ""

interface MessageDetail {
  room_id: string;
  message: string;

}

interface ChatRoomProps {
  params: {
    roomId: string;
  };
}

const ChatRoom: React.FC<ChatRoomProps> = ({params}) => {
  const {roomId} = params
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [ws, setWs] = useState<WebSocket | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    if (roomId) {
      fetchChatMessages(roomId)
        .then(fetchedMessages => {
          if (fetchedMessages && fetchedMessages.length > 0) {
            setMessages(fetchedMessages);
            console.log("Messages fetched and set:", fetchedMessages);
          } else {
            console.log("No messages or empty response:", fetchedMessages);
          }
        })
        .catch(error => {
          console.error("Failed to fetch messages:", error);
        });
    }
  }, [roomId]);

  useEffect(() => {
    const initWebSocket = async () => {
      try {
        const userId = await getCookie('user_id'); // Assuming getCookie returns a promise, if not, no need for await here.
          setCurrentUserId(userId);
        const websocket = await createWebSocket(SOCKET_SERVER_URL); // Ensure your token is correctly passed if needed
  
        websocket.onopen = () => {
          console.log("connected");
        };
  
        websocket.onmessage = (event: MessageEvent) => {
          const data = JSON.parse(event.data);
          console.log("masuk event")
          console.log(data)
          if (data.event === "messageTherapis") {
            console.log("masuk")
            setMessages((prevMessages) => [...prevMessages, data.data]);
          }
          
        };
  
        websocket.onerror = (error: Event) => {
          console.error("WebSocket error:", error);
        };

        websocket.onclose = () => {
          console.log('WebSocket disconnected');
          setTimeout(initWebSocket, 1000);
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (ws && newMessage.trim()) {

      const messageDetail: MessageDetail = {
        room_id: roomId,
        message: newMessage.trim(),
      };
      ws.send(JSON.stringify({ event: "therapy_message", data: JSON.stringify(messageDetail) }));
      setNewMessage(''); // Clear the input after sending
    }
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-[#FFE9D0] rounded-2xl shadow-md h-[calc(100vh-18rem)] lg:h-[calc(100vh-15rem)] mx-5 sm:mx-10 md:mx-20 flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-10 space-y-4">
        {messages.map((message) => (
          <div key={message.ID} className={`flex ${message.SenderID === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end space-x-2 ${message.SenderID === currentUserId ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <Image
                src={message.SenderID === currentUserId ? '/therapist.png' : '/therapist.png'}
                alt={message.SenderID}
                width={40}
                height={40}
                className="rounded-full border-2 border-black"
              />
              <div className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl ${
                message.SenderID === currentUserId
                  ? 'bg-white text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' 
                  : 'bg-white text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'
              } p-3 shadow-md`}>
                <p className='text-xs lg:text-lg'>{message.MessageContent}</p>
                <p className={`text-[0.5rem] lg:text-xs text-gray-500 mt-1 w-full ${ message.SenderID === currentUserId 
                  ? 'text-left' 
                  : 'text-right'
              }`}>
                  {formatTime(message.SentAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className=" p-4 flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default ChatRoom