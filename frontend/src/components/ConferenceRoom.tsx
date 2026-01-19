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
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Track } from 'livekit-client';
import GoogleMeetVideoInterface from './GoogleMeetVideoInterface';
import ChatPanel from './ChatPanel';
import PatientInfoPanel from './PatientInfoPanel';

interface ConferenceRoomProps {
  token: string;
  serverUrl: string;
  roomName: string;
  userName: string;
  onLeave: () => void;
}

function ControlBarButtons({
  onLeave,
  roomName,
  onChatToggle,
  onScreenShareStop,
}: {
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
      const updateState = () => {
        setIsMuted(!localParticipant.isMicrophoneEnabled);
        setIsVideoOff(!localParticipant.isCameraEnabled);
      };
      
      updateState();
      
      // Écouter les événements de changement de track
      localParticipant.on('trackPublished', updateState);
      localParticipant.on('trackUnpublished', updateState);
      
      // Vérifier périodiquement l'état pour rester synchronisé
      const interval = setInterval(updateState, 200);

      return () => {
        localParticipant.off('trackPublished', updateState);
        localParticipant.off('trackUnpublished', updateState);
        clearInterval(interval);
      };
    }
  }, [localParticipant]);

  const toggleMic = async () => {
    if (localParticipant) {
      try {
        // Inverser l'état actuel
        const currentMuted = !localParticipant.isMicrophoneEnabled;
        const newEnabled = currentMuted; // Si muet, on active; si actif, on désactive
        await localParticipant.setMicrophoneEnabled(newEnabled);
        // L'état sera mis à jour automatiquement par l'effet
      } catch (error) {
        console.error('Erreur lors du changement du micro:', error);
      }
    }
  };

  const toggleVideo = async () => {
    if (localParticipant) {
      try {
        // Inverser l'état actuel
        const currentVideoOff = !localParticipant.isCameraEnabled;
        const newEnabled = currentVideoOff; // Si off, on active; si actif, on désactive
        await localParticipant.setCameraEnabled(newEnabled);
        // L'état sera mis à jour automatiquement par l'effet
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

  return (
    <div className="h-14 bg-white border-t border-slate-200 flex items-center justify-between px-4 md:px-6 relative z-40">
      {/* Left side - meeting name */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <span className="font-medium text-slate-700">Observation médicale</span>
        <span className="mx-1 text-slate-300">•</span>
        <span className="truncate max-w-[120px] md:max-w-xs">{roomName}</span>
      </div>

      {/* Center - Main controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleMic}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isMuted
              ? 'bg-rose-500 hover:bg-rose-600'
              : 'bg-slate-800 hover:bg-slate-900'
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
              ? 'bg-rose-500 hover:bg-rose-600'
              : 'bg-slate-800 hover:bg-slate-900'
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
              ? 'bg-sky-600 hover:bg-sky-700'
              : 'bg-slate-800 hover:bg-slate-900'
          }`}
          title={isScreenSharing ? "Arrêter le partage d'écran" : "Partager l'écran"}
        >
          <Monitor className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={onLeave}
          className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center transition-colors ml-1"
          title="Quitter la réunion"
        >
          <PhoneOff className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Right side - Chat toggle */}
      <button
        onClick={onChatToggle}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
        title="Ouvrir le chat"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline">Chat</span>
      </button>
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
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    setMeetingLink(url.toString());
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col relative">
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
        {/* Layout principal */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Colonne gauche : fiche patient (masquée si plein écran) */}
          {!isVideoExpanded && <PatientInfoPanel />}

          {/* Colonne droite : vidéo + observation médicale */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* En-tête de la consultation */}
            <header className="px-6 pt-4 pb-3 border-b border-slate-200 bg-white flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Consultation en cours
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  Observation médicale
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  En ligne
                </span>
              </div>
            </header>

            {/* Contenu principal : vidéo + formulaires */}
            <div
              className={`flex-1 flex flex-col ${isVideoExpanded ? '' : 'lg:flex-row'} gap-4 p-4 md:p-6 overflow-hidden`}
            >
              {/* Bloc vidéo */}
              <section
                className={`flex flex-col bg-slate-950 rounded-3xl shadow-md overflow-hidden relative min-h-[260px] ${
                  isVideoExpanded ? 'flex-1 w-full h-full' : 'lg:w-1/2'
                }`}
              >
                <button
                  onClick={() => setIsVideoExpanded((v) => !v)}
                  className="absolute top-3 right-3 z-30 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 text-slate-800 text-xs font-medium shadow-sm hover:bg-white"
                  title={isVideoExpanded ? 'Réduire' : 'Étendre la visioconférence'}
                >
                  {isVideoExpanded ? (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Réduire</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Étendre</span>
                    </>
                  )}
                </button>
                <GoogleMeetVideoInterface />
                <RoomAudioRenderer />
              </section>

              {/* Bloc observation médicale / notes */}
              {!isVideoExpanded && (
                <section className="lg:w-1/2 flex flex-col gap-3 overflow-y-auto">
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 md:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Observation médicale
                      </h3>
                      <span className="text-xs text-emerald-600 font-medium">
                        Documenté
                      </span>
                    </div>
                    <div className="space-y-3 text-xs text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-800 mb-1">
                          Interrogatoire
                        </p>
                        <p className="text-slate-600">
                          Plaies douloureuses depuis deux jours. Fatigue modérée,
                          pas de fièvre rapportée.
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 mb-1">
                          Examen clinique
                        </p>
                        <p className="text-slate-600">
                          Patient souriant, respiration calme, pas de détresse
                          respiratoire visible. Coloration cutanée normale.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 md:p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">
                      Hypothèse diagnostique / Conclusion
                    </h3>
                    <p className="text-xs text-slate-600">
                      Suspicion d&apos;infection virale bénigne. Poursuivre la
                      surveillance à domicile avec consignes de réévaluation en
                      cas d&apos;aggravation des symptômes ou d&apos;apparition
                      de fièvre.
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* Barre de contrôle visioconférence */}
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
          </div>
        </div>
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
