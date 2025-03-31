"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone, Video, X, Mic, MicOff, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface CallRequestModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  callerName: string;
  callerImage?: string;
  callType: "video" | "audio";
}

export const CallRequestModal: React.FC<CallRequestModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  callerName,
  callerImage,
  callType,
}) => {
  const [ringTimer, setRingTimer] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setRingTimer((prev) => {
        if (prev >= 30) {
          clearInterval(timer);
          onDecline();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, onDecline]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-[#FFF5EB] rounded-xl overflow-hidden shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 text-[#FFB74D]">
            {callType === "video" ? (
              <Video className="h-8 w-8 animate-pulse" />
            ) : (
              <Phone className="h-8 w-8 animate-pulse" />
            )}
          </div>
          <h3 className="text-xl font-bold mb-1">Incoming {callType} call</h3>
          <p className="text-gray-500 mb-6">from {callerName}</p>
          <div className="relative mb-8">
            <Avatar className="h-24 w-24 border-4 border-[#FFE9D0]">
              <AvatarImage
                src={callerImage || "/placeholder.svg?height=96&width=96"}
                alt={callerName}
              />
              <AvatarFallback className="text-2xl">
                {callerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full border-4 border-[#FFB74D] animate-ping opacity-75"></div>
          </div>
          <div className="flex items-center justify-center space-x-6 w-full">
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full h-14 w-14 bg-red-500 hover:bg-red-600"
              onClick={onDecline}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600"
              onClick={onAccept}
            >
              {callType === "video" ? (
                <Video className="h-6 w-6" />
              ) : (
                <Phone className="h-6 w-6" />
              )}
            </Button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            Call will be declined in {30 - ringTimer} seconds
          </div>
        </div>
      </div>
    </div>
  );
};

export interface OutgoingCallModalProps {
  isOpen: boolean;
  onCancel: () => void;
  recipientName: string;
  recipientImage?: string;
  callType: "video" | "audio";
}

export const OutgoingCallModal: React.FC<OutgoingCallModalProps> = ({
  isOpen,
  onCancel,
  recipientName,
  recipientImage,
  callType,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => {
        if (prev >= 60) {
          clearInterval(timer);
          onCancel();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, onCancel]);

  useEffect(() => {
    if (!isOpen) return;
    const dotsTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);
    return () => clearInterval(dotsTimer);
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-[#FFF5EB] rounded-xl overflow-hidden shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 text-[#FFB74D]">
            {callType === "video" ? (
              <Video className="h-8 w-8 animate-pulse" />
            ) : (
              <Phone className="h-8 w-8 animate-pulse" />
            )}
          </div>
          <h3 className="text-xl font-bold mb-1">Calling{dots}</h3>
          <p className="text-gray-500 mb-6">{recipientName}</p>
          <div className="relative mb-8">
            <Avatar className="h-24 w-24 border-4 border-[#FFE9D0]">
              <AvatarImage
                src={recipientImage || "/placeholder.svg?height=96&width=96"}
                alt={recipientName}
              />
              <AvatarFallback className="text-2xl">
                {recipientName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full border-4 border-[#FFB74D] animate-ping opacity-75"></div>
            <div
              className="absolute -inset-3 rounded-full border-4 border-[#FFB74D] animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full px-8 bg-red-500 hover:bg-red-600"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <div className="mt-6 text-sm text-gray-500">
            Call will automatically end in {60 - callDuration} seconds
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Active Video Call Modal --- */
export interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  targetUserId: string;
  targetUserName: string;
  targetUserImage?: string;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  targetUserId,
  targetUserName,
  targetUserImage,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isOpen) return;
    const getLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        // For demo, we simulate the remote stream after a delay
        setTimeout(() => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        }, 2000);
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };
    getLocalStream();
    return () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted; 
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
    }
  };

  const handleEndCall = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div
        className={`relative bg-[#1A1A1A] rounded-xl overflow-hidden ${
          isFullScreen ? "w-full h-full" : "w-full max-w-4xl h-[80vh]"
        }`}
      >
        <div className="w-full h-full relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage
                  src={targetUserImage || "/placeholder.svg?height=40&width=40"}
                  alt={targetUserName}
                />
                <AvatarFallback>{targetUserName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-3 text-white">
                <p className="font-semibold">{targetUserName}</p>
                <p className="text-xs opacity-80">
                  {formatDuration(callDuration)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={toggleFullScreen}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute bottom-24 right-4 w-1/4 max-w-[180px] aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-center bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full p-3 ${
                  isMuted
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-white/20 hover:bg-white/30"
                }`}
                onClick={toggleMute}
              >
                {isMuted ? (
                  <MicOff className="h-6 w-6 text-white" />
                ) : (
                  <Mic className="h-6 w-6 text-white" />
                )}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full p-4 bg-red-500 hover:bg-red-600"
                onClick={handleEndCall}
              >
                <Phone className="h-6 w-6 text-white rotate-135" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full p-3 ${
                  !isVideoEnabled
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-white/20 hover:bg-white/30"
                }`}
                onClick={toggleVideo}
              >
                {isVideoEnabled ? (
                  <Video className="h-6 w-6 text-white" />
                ) : (
                  <VideoOff className="h-6 w-6 text-white" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
