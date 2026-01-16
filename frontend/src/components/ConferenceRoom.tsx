import { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Copy,
  X,
  MessageSquare,
} from 'lucide-react';
import { Track } from 'livekit-client';
import GoogleMeetVideoInterface from './GoogleMeetVideoInterface';
import ChatPanel from './ChatPanel';

interface ConferenceRoomProps {
  token: string;
  serverUrl: string;
  roomName: string;
  userName: string;
  onLeave: () => void;
}

function ControlBarButtons({ onLeave, roomName, onChatToggle, onScreenShareStop }: { 
  onLeave: () => void; 
  roomName: string;
  onChatToggle: () => void;
  onScreenShareStop?: () => void;
}) {
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Vérifier l'état du partage d'écran
  const screenShareTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  useEffect(() => {
    setIsScreenSharing(screenShareTracks.length > 0);
  }, [screenShareTracks]);

  // Synchroniser l'état avec le participant local
  useEffect(() => {
    if (localParticipant) {
      // Initialiser l'état basé sur l'état réel du participant
      setIsMuted(!localParticipant.isMicrophoneEnabled);
      setIsVideoOff(!localParticipant.isCameraEnabled);
      
      // Vérifier périodiquement l'état pour rester synchronisé
      const interval = setInterval(() => {
        if (localParticipant) {
          setIsMuted(!localParticipant.isMicrophoneEnabled);
          setIsVideoOff(!localParticipant.isCameraEnabled);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [localParticipant]);

  const toggleMic = async () => {
    if (localParticipant) {
      try {
        const newState = !isMuted;
        await localParticipant.setMicrophoneEnabled(newState);
        setIsMuted(!newState);
      } catch (error) {
        console.error('Erreur lors du changement du micro:', error);
      }
    }
  };

  const toggleVideo = async () => {
    if (localParticipant) {
      try {
        const newState = !isVideoOff;
        await localParticipant.setCameraEnabled(newState);
        setIsVideoOff(!newState);
      } catch (error) {
        console.error('Erreur lors du changement de la caméra:', error);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (localParticipant) {
      try {
        if (isScreenSharing) {
          await localParticipant.setScreenShareEnabled(false);
          setIsScreenSharing(false);
          if (onScreenShareStop) {
            onScreenShareStop();
          }
        } else {
          await localParticipant.setScreenShareEnabled(true);
          setIsScreenSharing(true);
        }
      } catch (error) {
        console.error('Erreur lors du partage d\'écran:', error);
      }
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-16 bg-[#202124] flex items-center justify-between px-4 relative z-50">
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
          title={isMuted ? 'Activer le micro' : 'Désactiver le micro'}
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
          title={isVideoOff ? 'Activer la caméra' : 'Désactiver la caméra'}
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
          title={isScreenSharing ? "Arrêter le partage d'écran" : "Partager l'écran"}
        >
          <Monitor className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={onChatToggle}
          className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          title="Ouvrir le chat"
        >
          <MessageSquare className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={onLeave}
          className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
          title="Quitter la réunion"
        >
          <PhoneOff className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Right side - Empty for now */}
      <div className="w-32"></div>
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
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    setMeetingLink(url.toString());
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
  };

  return (
    <div className="h-screen w-screen bg-[#202124] flex flex-col relative">
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
        <div className="flex-1 flex flex-col min-h-0 relative">
          <GoogleMeetVideoInterface />
          <RoomAudioRenderer />
        </div>
        <ControlBarButtons 
          onLeave={onLeave} 
          roomName={roomName} 
          onChatToggle={() => setIsChatOpen(!isChatOpen)}
        />
        {/* Chat Panel - doit être à l'intérieur du contexte LiveKitRoom */}
        <ChatPanel 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          userName={userName}
        />
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
            <p className="text-sm text-gray-600 mb-3">
              Partagez ce lien avec les personnes que vous souhaitez inviter
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
