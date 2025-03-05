"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Send, ChevronLeft, Phone, Video, ArrowLeft } from "lucide-react"
import { type ChatRoom, fetchChatMessages, fetchChatRoomsWithMessages } from "@/app/api/service"
import type { ChatMessage } from "@/app/find/[roomId]/page"
import { getCookie } from "cookies-next"
import { createWebSocket } from "@/app/util/socket"
import { useSearchParams } from "next/navigation"

interface MessageDetail {
  room_id: string
  message: string
}

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || ""

const ChatInterface: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [opponent, setOpponent] = useState<{ ID: string; name: string; image_url: string } | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const searchParams = useSearchParams()
  const targetUserID = searchParams.get("userID")

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        const userId = await getCookie("user_id")
        setCurrentUserId(userId)
        console.log(userId)

        const websocket = await createWebSocket(SOCKET_SERVER_URL)

        websocket.onopen = () => {
          console.log("WebSocket connected")
          setWs(websocket)
        }

        websocket.onmessage = (event: MessageEvent) => {
          const message = JSON.parse(event.data)
          console.log("message")
          console.log(message)
          if (message.event === "messageTherapis") {
            console.log(message.data)
            console.log("user")
            console.log(selectedRoom?.ID)
            setMessages((prevMessages) => [...prevMessages, message.data])
          }
        }

        websocket.onerror = (event: Event) => {
          console.error("WebSocket error:", event)
        }

        websocket.onclose = () => {
          console.log("WebSocket disconnected")
          setTimeout(initializeWebSocket, 1000)
        }

        return () => {
          websocket.close()
        }
      } catch (error) {
        console.error("Failed to initialize WebSocket or get user ID:", error)
      }
    }

    initializeWebSocket()
  }, [selectedRoom?.ID])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (ws && newMessage.trim() && selectedRoom?.ID) {
      const messageDetail: MessageDetail = {
        room_id: selectedRoom?.ID,
        message: newMessage.trim(),
      }
      ws.send(JSON.stringify({ event: "therapy_message", data: JSON.stringify(messageDetail) }))
      setNewMessage("")
    }
  }

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const rooms = await fetchChatRoomsWithMessages()
        setChatRooms(rooms || [])

        if (targetUserID) {
          const matchedRoom = rooms?.find(
            (room) => room.FirstUserID === targetUserID || room.SecondUserID === targetUserID,
          )
          if (matchedRoom) {
            setSelectedRoom(matchedRoom)
          }
        }
      } catch (error) {
        console.error("Failed to fetch chat rooms", error)
      }
    }
    fetchChatRooms()
  }, [targetUserID])

  useEffect(() => {
    if (selectedRoom) {
      fetchChatMessages(selectedRoom.ID)
        .then((fetchedMessages) => {
          if (fetchedMessages && fetchedMessages.length > 0) {
            setMessages(fetchedMessages)
            console.log("Messages fetched and set:", fetchedMessages)
          } else {
            console.log("No messages or empty response:", fetchedMessages)
          }
        })
        .catch((error) => {
          console.error("Failed to fetch messages:", error)
        })

      if (currentUserId) {
        if (currentUserId === selectedRoom.FirstUserID) {
          setOpponent(selectedRoom.SecondUser)
        } else if (currentUserId === selectedRoom.SecondUserID) {
          setOpponent(selectedRoom.FirstUser)
        }
      }
    }
  }, [selectedRoom, currentUserId])

  const handleSelectedRoom = (room: ChatRoom) => {
    setSelectedRoom(room)
  }

  const handleBackToList = () => {
    setSelectedRoom(null)
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex h-screen bg-[#FFF5EB] p-4 md:p-20">
      <div className="w-64 p-4 overflow-y-auto hidden md:block bg-white rounded-l-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-center py-2 border-b">Inbox</h2>
        {chatRooms.map((room) => (
          <div
            key={room.ID}
            className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-all hover:bg-[#FFE9B1]/50 ${selectedRoom?.ID === room.ID ? "bg-[#FFE9B1] shadow-md" : "bg-white"}`}
            onClick={() => handleSelectedRoom(room)}
          >
            <div className="relative">
              <Image
                src={room.FirstUser.image_url || "/profile.png"}
                alt={room.FirstUser.name}
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              {selectedRoom?.ID === room.ID && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1">
              <span className="font-medium block">{room.FirstUser.name}</span>
              <span className="text-xs text-gray-500">
                {selectedRoom?.ID === room.ID ? "Active now" : "Click to view messages"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 py-20 md:hidden">
        {selectedRoom ? (
          <div className="flex flex-col h-full bg-[#FFE9D0] rounded-lg shadow-md">
            <div className="flex items-center justify-between p-4 bg-[#FFE9B1] rounded-t-lg shadow-sm">
              <div className="flex items-center">
                <button onClick={handleBackToList} className="mr-4">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                {opponent && (
                  <div className="flex items-center">
                    <Image
                      src={opponent.image_url || "/profile.png"}
                      alt={opponent.name}
                      width={40}
                      height={40}
                      className="rounded-full mr-3"
                    />
                    <span className="font-medium">{opponent.name}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                  <Phone className="h-5 w-5 text-gray-700" />
                </button>
                <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                  <Video className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.ID}
                  className={`flex ${message.SenderID === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-end space-x-2 ${message.SenderID === currentUserId ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
                  >
                    <Image src={"/profile.png"} alt={message.ID} width={40} height={40} className="rounded-full" />
                    <div
                      className={`max-w-xs sm:max-w-md text-[12px] ${
                        message.SenderID === currentUserId
                          ? "bg-white text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                          : "bg-[#FFE9B1] text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl"
                      } p-3 shadow-md`}
                    >
                      <p>{message.MessageContent}</p>
                      <p
                        className={`text-[10px] text-gray-500 mt-1 ${
                          message.SenderID === currentUserId ? "text-left" : "text-right"
                        } `}
                      >
                        {formatTime(message.SentAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 flex items-center space-x-2 bg-white rounded-b-lg shadow-inner">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFE9B1]"
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#FFE9B1] text-gray-800 rounded-full p-2 hover:bg-[#FFE9B1]/80 focus:outline-none focus:ring-2 focus:ring-[#FFE9B1] focus:ring-offset-2"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white h-[calc(100vh-15rem)] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center py-2 border-b">Inbox</h2>
            {chatRooms.map((room) => (
              <div
                key={room.ID}
                className="flex items-center p-3 mb-2 bg-white hover:bg-[#FFE9B1]/50 rounded-lg cursor-pointer transition-all border border-gray-100"
                onClick={() => handleSelectedRoom(room)}
              >
                <Image
                  src={room.FirstUser.image_url || "/profile.png"}
                  alt={room.FirstUser.name}
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium block">{room.FirstUser.name}</span>
                  <span className="text-xs text-gray-500">Click to view messages</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 hidden md:block">
        {selectedRoom ? (
          <div className="flex flex-col h-full bg-[#FFE9D0] rounded-r-lg shadow-md">
            <div className="flex items-center justify-between p-4 bg-[#FFE9B1] rounded-tr-lg shadow-sm">
              {opponent && (
                <div className="flex items-center">
                  <Image
                    src={opponent.image_url || "/profile.png"}
                    alt={opponent.name}
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                  <div>
                    <span className="font-medium block">{opponent.name}</span>
                    <span className="text-xs text-gray-600">Online</span>
                  </div>
                </div>
              )}
              <div className="flex space-x-3">
                <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                  <Phone className="h-5 w-5 text-gray-700" />
                </button>
                <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                  <Video className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 lg:p-10 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.ID}
                  className={`flex ${message.SenderID === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-end space-x-2 ${message.SenderID === currentUserId ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
                  >
                    <Image
                      src={"/profile.png"}
                      alt={message.SenderID}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div
                      className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl ${
                        message.SenderID === currentUserId
                          ? "bg-white text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                          : "bg-[#FFE9B1] text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl"
                      } p-3 shadow-md`}
                    >
                      <p>{message.MessageContent}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(message.SentAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 flex items-center space-x-2 bg-white rounded-br-lg shadow-inner">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
                placeholder="Type a message..."
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFE9B1]"
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#FFE9B1] text-gray-800 rounded-full p-2 hover:bg-[#FFE9B1]/80 focus:outline-none focus:ring-2 focus:ring-[#FFE9B1] focus:ring-offset-2"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-[#FFE9D0] rounded-r-lg">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
              <div className="mb-4 bg-[#FFE9B1] w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Send className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatInterface;