import { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
} from '@livekit/components-react';
import '@livekit/components-styles';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Grid3x3,
  Smile,
  MessageSquare,
  Hand,
  MoreVertical,
  PhoneOff,
  Info,
  Users,
  Lock,
  Copy,
  X,
} from 'lucide-react';
import GoogleMeetVideoInterface from './GoogleMeetVideoInterface';

interface ConferenceRoomProps {
  token: string;
  serverUrl: string;
  roomName: string;
  userName: string;
  onLeave: () => void;
}

function ControlBarButtons({ onLeave, roomName }: { onLeave: () => void; roomName: string }) {
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const toggleMic = async () => {
    if (localParticipant) {
      if (isMuted) {
        await localParticipant.setMicrophoneEnabled(true);
        setIsMuted(false);
      } else {
        await localParticipant.setMicrophoneEnabled(false);
        setIsMuted(true);
      }
    }
  };

  const toggleVideo = async () => {
    if (localParticipant) {
      if (isVideoOff) {
        await localParticipant.setCameraEnabled(true);
        setIsVideoOff(false);
      } else {
        await localParticipant.setCameraEnabled(false);
        setIsVideoOff(true);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (localParticipant) {
      if (isScreenSharing) {
        await localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
      } else {
        await localParticipant.setScreenShareEnabled(true);
        setIsScreenSharing(true);
      }
    }
  };

  useEffect(() => {
    if (localParticipant) {
      setIsMuted(!localParticipant.isMicrophoneEnabled);
      setIsVideoOff(!localParticipant.isCameraEnabled);
    }
  }, [localParticipant]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-16 bg-[#202124] flex items-center justify-between px-4">
      {/* Left side - Time and meeting code */}
      <div className="flex items-center space-x-4 text-white text-sm">
        <span>{getCurrentTime()}</span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-400">{roomName}</span>
      </div>

      {/* Center - Main controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleMic}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isMuted ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isVideoOff
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isVideoOff ? (
            <VideoOff className="w-5 h-5 text-white" />
          ) : (
            <Video className="w-5 h-5 text-white" />
          )}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isScreenSharing
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Monitor className="w-5 h-5 text-white" />
        </button>

        <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
          <Grid3x3 className="w-5 h-5 text-white" />
        </button>

        <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
          <Smile className="w-5 h-5 text-white" />
        </button>

        <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
          <MessageSquare className="w-5 h-5 text-white" />
        </button>

        <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
          <Hand className="w-5 h-5 text-white" />
        </button>

        <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
          <MoreVertical className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={onLeave}
          className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
        >
          <PhoneOff className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Right side - Additional controls */}
      <div className="flex items-center space-x-2">
        <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
          <Info className="w-5 h-5 text-white" />
        </button>
        <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors relative">
          <Users className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
            1
          </span>
        </button>
        <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
          <MessageSquare className="w-5 h-5 text-white" />
        </button>
        <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
          <Grid3x3 className="w-5 h-5 text-white" />
        </button>
        <button className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
          <Lock className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function ConferenceRoom({
  token,
  serverUrl,
  roomName,
  userName,
  onLeave,
}: ConferenceRoomProps) {
  const [showMeetingReady, setShowMeetingReady] = useState(true);
  const [meetingLink, setMeetingLink] = useState('');

  useEffect(() => {
    const url = new URL(window.location.href);
    setMeetingLink(url.toString());
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
  };

  return (
    <div className="h-screen w-screen bg-[#202124] flex flex-col">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        onConnected={() => {}}
        onDisconnected={() => {
          onLeave();
        }}
        data-lk-theme="default"
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="flex-1 flex flex-col min-h-0">
          <GoogleMeetVideoInterface />
          <RoomAudioRenderer />
        </div>
        {/* Control Bar - doit être à l'intérieur du contexte LiveKitRoom */}
        <ControlBarButtons onLeave={onLeave} roomName={roomName} />
      </LiveKitRoom>

      {/* Pop-up "Votre réunion est prête" */}
      {showMeetingReady && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-start p-4 z-50 pointer-events-none">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative pointer-events-auto">
            <button
              onClick={() => setShowMeetingReady(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-normal text-gray-900 mb-4">Votre réunion est prête</h2>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mb-4">
              <Users className="w-5 h-5" />
              <span>Ajouter des participants</span>
            </button>
            <p className="text-sm text-gray-600 mb-3">
              Ou partagez ce lien avec les personnes que vous souhaitez inviter à la réunion
            </p>
            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
              <span className="flex-1 text-sm text-gray-700 truncate">{meetingLink}</span>
              <button
                onClick={handleCopyLink}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex items-start space-x-2 text-xs text-gray-600 mb-4">
              <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Les personnes utilisant le lien de cette réunion doivent obtenir votre autorisation pour y participer.</span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Vous participez en tant que {userName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
