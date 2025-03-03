'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Send, ChevronLeft } from 'lucide-react'
import { ChatRoom, fetchChatMessages, fetchChatRoomsWithMessages } from '@/app/api/service'
import { ChatMessage } from '@/app/find/[roomId]/page'
import { getCookie } from 'cookies-next'
import { createWebSocket } from '@/app/util/socket'


interface MessageDetail {
  room_id: string;
  message: string;

} 

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || ""


const ChatInterface: React.FC = () => {

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [opponent, setOpponent] = useState<{ID:string, name: string; image_url: string } | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])


  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        const userId = await getCookie('user_id'); // Assuming getCookie returns a promise, if not, no need for await here.
        setCurrentUserId(userId);
        console.log(userId);
  
        const websocket = await createWebSocket(SOCKET_SERVER_URL);
  
        websocket.onopen = () => {
          console.log('WebSocket connected');
          setWs(websocket);
        };
  
        websocket.onmessage = (event: MessageEvent) => {
          const message = JSON.parse(event.data);
          console.log("message")
          console.log(message)
          if (message.event === "messageTherapis") {
            console.log(message.data)
            console.log("user")
            console.log(selectedRoom?.ID)
            setMessages((prevMessages) => [...prevMessages, message.data]);
            
            
          }
  
        };
  
        websocket.onerror = (event: Event) => {
          console.error('WebSocket error:', event);
        };
  
        websocket.onclose = () => {
          console.log('WebSocket disconnected');
          setTimeout(initializeWebSocket, 1000);
        };
  
        return () => {
          websocket.close(); // Clean up WebSocket connection on component unmount
        };
      } catch (error) {
        console.error('Failed to initialize WebSocket or get user ID:', error);
      }
    };
  
    initializeWebSocket();
  }, []); 

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (ws && newMessage.trim() && selectedRoom?.ID) {

      const messageDetail: MessageDetail = {
        room_id: selectedRoom?.ID,
        message: newMessage.trim(),
      };
      ws.send(JSON.stringify({ event: "therapy_message", data: JSON.stringify(messageDetail) }));
      setNewMessage(''); // Clear the input after sending
    }
  }

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const rooms = await fetchChatRoomsWithMessages(); // Fetch chat rooms with at least one message
        console.log(rooms)
        setChatRooms(rooms || []); // Set the rooms if available
      } catch (error) {
        console.error("Failed to fetch chat rooms", error);
      }
    };
    fetchChatRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchChatMessages(selectedRoom.ID)
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

        if (currentUserId) {
          if (currentUserId === selectedRoom.FirstUserID) {
            setOpponent(selectedRoom.SecondUser);
          } else if (currentUserId === selectedRoom.SecondUserID) {
            setOpponent(selectedRoom.FirstUser);
          }
    }
  }
  }, [selectedRoom, currentUserId]);

  const handleSelectedRoom = (room: ChatRoom) => {
    setSelectedRoom(room)
  }

  const handleBackToList = () => {
    setSelectedRoom(null)
  }

  
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-[#FFF5EB] p-4 md:p-20">
      {/* Sidebar (visible on desktop) */}
      <div className="w-64 p-4 overflow-y-auto hidden md:block">
        <h2 className="text-xl font-semibold mb-4">Inbox</h2>
        {chatRooms.map((room) => (
          <div 
            key={room.ID} 
            className="flex items-center p-3 mb-2 bg-[#FFE9B1] rounded-lg cursor-pointer"
            onClick={() => handleSelectedRoom(room)}
          >
            <Image
                  src={room.FirstUser.image_url || "/profile.png"}
                  alt={room.FirstUser.name}
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
              />
            <span className="font-medium">{room.FirstUser.name}</span>
          </div>
        ))}
      </div>

      {/* Mobile view */}
      <div className="flex-1 py-20 md:hidden">
        {selectedRoom ? (
          // Chat Area (Mobile)
          <div className="flex flex-col h-full bg-[#FFE9D0]">
            {/* Mobile Header */}
            <div className="flex items-center p-4 bg-[#FFE9B1] rounded-t-lg">
              <button onClick={handleBackToList} className="mr-4">
                <ChevronLeft className="h-6 w-6" />
              </button>
              {opponent && (
                <div className="flex items-center">
                  <Image
                    src={opponent.image_url}
                    alt={opponent.name}
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                  <span className="font-medium">{opponent.name}</span>
                </div>
              )}

            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.ID} className={`flex ${message.SenderID === currentUserId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end space-x-2 ${message.SenderID === currentUserId ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    <Image
                      src={'/profile.png'}
                      alt={message.ID}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className={`max-w-xs sm:max-w-md text-[12px] ${
                      message.SenderID === currentUserId 
                        ? 'bg-white text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' 
                        : 'bg-[#FFE9B1] text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'
                    } p-3 shadow-md`}>
                      <p>{message.MessageContent}</p>
                      <p className={`text-[10px] text-gray-500 mt-1 ${
                      message.SenderID === currentUserId
                        ? 'text-left' 
                        : 'text-right'
                    } `}>
                        {formatTime(message.SentAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFE9B1]"
              />
              <button
                onClick={handleSendMessage}
                className="bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FFE9B1] focus:ring-offset-2"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          // User list (Mobile)
          <div className="bg-[#FFE9D0] h-[calc(100vh-15rem)] p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Inbox</h2>
            {chatRooms.map((room) => (
              <div 
                key={room.ID} 
                className="flex items-center p-3 mb-2 bg-[#FFE9B1] rounded-lg cursor-pointer"
                onClick={() => handleSelectedRoom(room)}
              >
                <Image
                  src={room.FirstUser.image_url || "/profile.png"}
                  alt={room.FirstUser.name}
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <span className="font-medium">{room.FirstUser.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Chat Area */}
      <div className="flex-1 hidden md:flex md:flex-col h-[calc(100vh-15rem)] bg-[#FFE9D0]">
        <div className="flex-1 overflow-y-auto p-5 lg:p-20 space-y-4">
          {messages.map((message) => (
            <div key={message.ID} className={`flex ${message.SenderID === currentUserId ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end space-x-2 ${message.SenderID === currentUserId ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                <Image
                  src={'/profile.png'}
                  alt={message.SenderID}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl ${
                  message.SenderID === 'user' 
                    ? 'bg-white text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' 
                    : 'bg-[#FFE9B1] text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'
                } p-3 shadow-md`}>
                  <p>{message.MessageContent}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(message.SentAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFE9B1]"
          />
          <button
            onClick={handleSendMessage}
            className="bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FFE9B1] focus:ring-offset-2"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface