'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, ArrowLeft, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createWebSocket } from "../../util/socket";

import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { fetchChatMessages } from '@/app/api/service';



export interface ChatMessage {
  ID: string;
  SenderID: string;
  ChatRoomID: string;
  MessageContent: string;
  SentAt: string;
}

interface ChatRoomProps {
  params: {
    roomId: string;
  };
}

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || ""


const ChatPage :React.FC<ChatRoomProps> = ({ params }) => {
   const {roomId} = params
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showChatEndedPopup, setShowChatEndedPopup] = useState(false);
    const router = useRouter()
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
  
    useEffect(scrollToBottom, [messages]);

    
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
      const initializeWebSocket = async () => {
        try {
          const userId = await getCookie('user_id'); // Assuming getCookie returns a promise, if not, no need for await here.
          setCurrentUserId(userId);
          console.log(userId);
    
          const websocket = await createWebSocket(SOCKET_SERVER_URL);
    
          websocket.onopen = () => {
            console.log('WebSocket connected');
            websocket.send(JSON.stringify({ event: "check_match", data: "" }));
            setWs(websocket);
          };
    
          websocket.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data);
    
            if (message.event === "message") {
              console.log(message.data)
              setMessages((prevMessages) => [...prevMessages, message.data]);
            }
    
            if (message.event === "free") {
              router.push("/find");
            }
    
            if (message.event === "end") {
              setShowChatEndedPopup(true);
              setTimeout(() => {
                setShowChatEndedPopup(false);
                router.push("/find");
              }, 3000);
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
  
    const handleSendMessage = () => {
      if (ws && newMessage.trim()) {
        ws.send(JSON.stringify({ event: "send_message", data: newMessage.trim() }));
        setNewMessage(''); // Clear the input after sending
      }
    };
  

    const formatTime = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    

    const handleEndChat = () => {
      // Implement end chat logic here
      console.log('Ending chat...');
      setShowSettings(false);
       // Send the end_match event to the server via WebSocket
      if (ws) {
        ws.send(JSON.stringify({ event: "end_match", data: "" }));
      }
    };
  
    return (
      <div className="h-screen bg-[#F0F8FF] font-sans flex flex-col items-center justify-center px-5 rounded-lg">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl flex flex-col">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center rounded-t-xl" >
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Button>
          <div className="flex items-center flex-1 ">
            <div className="w-10 h-10 rounded-full bg-[#FFD3E4] flex items-center justify-center mr-3">
              <span className="text-pink-600 font-bold">A</span>
            </div>
            <div>
              <h1 className="font-semibold text-lg text-gray-800">Anonymous User</h1>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight:'55vh', maxHeight: '55vh' }}>
          {messages.map((message) => (
            <div key={message.ID} className={`flex ${message.SenderID === currentUserId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${
                message.SenderID === currentUserId 
                  ? 'bg-[#FFD3E4] text-pink-800 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'
              } p-3 shadow-md`}>
                <p className="mb-1">{message.MessageContent}</p>
                <p className="text-xs opacity-70">{formatTime(message.SentAt)}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>



        <div className="bg-white p-4 border-t border-gray-200 rounded-b-xl">
          <div className="flex items-center space-x-2">
              <div className='relative'>


                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700" onClick={() => setShowSettings(!showSettings)}>
                    <Settings className="h-5 w-5" />
                </Button>

                {showSettings && (
                  <div className="absolute bottom-full mb-2 left-0 w-32 bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-2 bg-gray-100 flex justify-between items-center">
                      {/* <span className="font-semibold text-gray-700">Settings</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-500 hover:text-gray-700" 
                        onClick={() => setShowSettings(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button> */}
                    </div>
                    <ul>
                      <li 
                        className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer transition-colors duration-200"
                        onClick={handleEndChat}
                      >
                        End Chat
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              className="bg-[#FFD3E4] text-pink-600 hover:bg-pink-200 rounded-full p-2"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {showChatEndedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-xl transform transition-all ease-in-out duration-300 scale-100 opacity-100">
            <div className="mb-4">
              <div className="w-16 h-16 bg-[#FFD3E4] rounded-full flex items-center justify-center mx-auto">
                <X className="h-8 w-8 text-pink-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chat Ended</h2>
            <p className="text-gray-600 mb-4">Your chat session has ended. Thank you for participating!</p>
            <p className="text-sm text-gray-500">Redirecting to find new matches...</p>
          </div>
        </div>
      )}
      </div>
    );
  }


export default ChatPage
