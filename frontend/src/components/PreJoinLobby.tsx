import { useState, useEffect, useRef } from 'react';
import {
  Video as VideoIcon,
  Plus,
  Copy,
  X,
  Mic,
  MicOff,
  VideoOff,
} from 'lucide-react';

interface PreJoinLobbyProps {
  onJoin: (roomName: string, userName: string) => void;
}

export default function PreJoinLobby({ onJoin }: PreJoinLobbyProps) {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [showMeetingReady, setShowMeetingReady] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Démarrer l'aperçu vidéo quand on a un room name
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const getMediaStream = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: videoEnabled,
            audio: audioEnabled,
          });
          currentStream = mediaStream;
          setStream(mediaStream);
          if (videoRef.current && videoEnabled) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (error) {
          console.error('Erreur accès média:', error);
        }
    };

    getMediaStream();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoEnabled, audioEnabled]);

  const handleNewMeeting = () => {
    if (!userName.trim()) {
      const defaultName = `User-${Math.random().toString(36).substr(2, 9)}`;
      setUserName(defaultName);
    }
    const newRoomName = `meet-${Math.random().toString(36).substr(2, 9)}`;
    setRoomName(newRoomName);
    setMeetingLink(`${window.location.origin}?room=${newRoomName}`);
    setShowMeetingReady(true);
  };

  const handleJoinWithCode = () => {
    const finalUserName = userName.trim() || `User-${Math.random().toString(36).substr(2, 9)}`;
    if (roomName.trim()) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onJoin(roomName, finalUserName);
    }
  };

  const handleJoinFromPopup = () => {
    const finalUserName = userName.trim() || `User-${Math.random().toString(36).substr(2, 9)}`;
    if (roomName.trim()) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setShowMeetingReady(false);
      onJoin(roomName, finalUserName);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
  };

  const toggleVideo = async () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        if (videoEnabled) {
          videoTrack.enabled = false;
          setVideoEnabled(false);
        } else {
          videoTrack.enabled = true;
          setVideoEnabled(true);
        }
      }
    }
  };

  const toggleAudio = async () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        if (audioEnabled) {
          audioTrack.enabled = false;
          setAudioEnabled(false);
        } else {
          audioTrack.enabled = true;
          setAudioEnabled(true);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header simple */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <VideoIcon className="w-6 h-6 text-gray-700" />
          <span className="text-lg font-medium text-gray-900">Visioconférence</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-normal text-gray-900">
                Rejoindre une réunion
              </h1>
              <p className="text-gray-600">
                Créez une nouvelle réunion ou rejoignez une réunion existante
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la salle ou code
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Saisir un code ou un lien"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinWithCode()}
                  />
                  {roomName.trim() && (
                    <button
                      onClick={handleJoinWithCode}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Participer
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre nom
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Votre nom (optionnel)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleNewMeeting}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <VideoIcon className="w-5 h-5" />
                <Plus className="w-5 h-5" />
                <span>Nouvelle réunion</span>
              </button>
            </div>
          </div>

          {/* Aperçu vidéo */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-300">
              {videoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-4xl text-white font-medium">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
                <button
                  onClick={toggleAudio}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${audioEnabled
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  {audioEnabled ? (
                    <Mic className="w-5 h-5 text-white" />
                  ) : (
                    <MicOff className="w-5 h-5 text-white" />
                  )}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${videoEnabled
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  {videoEnabled ? (
                    <VideoIcon className="w-5 h-5 text-white" />
                  ) : (
                    <VideoOff className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pop-up "Votre réunion est prête" */}
      {showMeetingReady && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowMeetingReady(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-normal text-gray-900 mb-4">Votre réunion est prête</h2>
            <button
              onClick={handleJoinFromPopup}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mb-4"
            >
              <VideoIcon className="w-5 h-5" />
              <span>Rejoindre maintenant</span>
            </button>
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
                Vous participez en tant que {userName || 'invité'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
