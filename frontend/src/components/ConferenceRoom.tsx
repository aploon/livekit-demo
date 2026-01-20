import { useEffect, useState, ReactNode } from 'react';
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
  Camera,
  AlertCircle,
  User,
  ChevronDown,
  Plus,
  Check,
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

  const screenShareTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);

  useEffect(() => {
    setIsScreenSharing(screenShareTracks.length > 0);
  }, [screenShareTracks]);

  useEffect(() => {
    if (localParticipant) {
      const updateState = () => {
        setIsMuted(!localParticipant.isMicrophoneEnabled);
        setIsVideoOff(!localParticipant.isCameraEnabled);
      };
      updateState();
      localParticipant.on('trackPublished', updateState);
      localParticipant.on('trackUnpublished', updateState);
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
        const currentMuted = !localParticipant.isMicrophoneEnabled;
        await localParticipant.setMicrophoneEnabled(currentMuted);
      } catch (error) {
        console.error('Erreur lors du changement du micro:', error);
      }
    }
  };

  const toggleVideo = async () => {
    if (localParticipant) {
      try {
        const currentVideoOff = !localParticipant.isCameraEnabled;
        await localParticipant.setCameraEnabled(currentVideoOff);
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
          if (onScreenShareStop) onScreenShareStop();
        } else {
          await localParticipant.setScreenShareEnabled(true);
          setIsScreenSharing(true);
        }
      } catch (error) {
        console.error("Erreur lors du partage d'écran:", error);
      }
    }
  };

  return (
    <div className="h-14 bg-white border-t border-slate-200 flex items-center justify-between px-4 md:px-6 relative z-40">
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <span className="font-medium text-slate-700">Observation médicale</span>
        <span className="mx-1 text-slate-300">•</span>
        <span className="truncate max-w-[120px] md:max-w-xs">{roomName}</span>
      </div>

      <div className="flex items-center space-x-2">
        <CircleButton
          active={isMuted}
          onClick={toggleMic}
          activeColor="bg-rose-500 hover:bg-rose-600"
          inactiveColor="bg-slate-800 hover:bg-slate-900"
          title={isMuted ? 'Activer le micro' : 'Désactiver le micro'}
          icon={isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
        />
        <CircleButton
          active={isVideoOff}
          onClick={toggleVideo}
          activeColor="bg-rose-500 hover:bg-rose-600"
          inactiveColor="bg-slate-800 hover:bg-slate-900"
          title={isVideoOff ? 'Activer la caméra' : 'Désactiver la caméra'}
          icon={isVideoOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
        />
        <CircleButton
          active={isScreenSharing}
          onClick={toggleScreenShare}
          activeColor="bg-sky-600 hover:bg-sky-700"
          inactiveColor="bg-slate-800 hover:bg-slate-900"
          title={isScreenSharing ? "Arrêter le partage d'écran" : "Partager l'écran"}
          icon={<Monitor className="w-5 h-5 text-white" />}
        />
        <CircleButton
          onClick={onLeave}
          active
          activeColor="bg-rose-600 hover:bg-rose-700"
          inactiveColor="bg-rose-600 hover:bg-rose-700"
          title="Quitter la réunion"
          icon={<PhoneOff className="w-5 h-5 text-white" />}
        />
      </div>

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
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    setMeetingLink(url.toString());
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
  };

  return (
    <div className={`h-screen ${isVideoExpanded ? 'w-full' : 'max-w-screen-2xl mx-auto'} bg-gray-50 flex overflow-hidden`}>
      <LiveKitRoom
        video
        audio
        token={token}
        serverUrl={serverUrl}
        onConnected={() => {}}
        onDisconnected={onLeave}
        data-lk-theme="default"
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="flex-1 flex flex-row min-h-0">
          <div
            className={`transition-all duration-300 ${
              isVideoExpanded ? 'w-0 opacity-0 overflow-hidden' : 'w-1/2'
            } bg-white border-r border-gray-200 p-6 overflow-y-auto`}
          >
            <PatientAdminPanel />
          </div>

          <div className={`flex-1 transition-all duration-300 ${isVideoExpanded ? 'w-full' : ''} ${isVideoExpanded ? 'h-screen' : ''}`}>
            <div className={`h-full flex flex-col ${isVideoExpanded ? 'overflow-hidden' : ''}`}>
              {!isVideoExpanded && <TopRightHeader />}

              <VideoPanel isVideoExpanded={isVideoExpanded} onToggleExpand={() => setIsVideoExpanded((v) => !v)} />

              <ObservationPanel hidden={isVideoExpanded} />

              <ControlBarButtons
                onLeave={onLeave}
                roomName={roomName}
                onChatToggle={() => setIsChatOpen(!isChatOpen)}
                onScreenShareStop={() => setIsVideoExpanded(false)}
              />

              {/* Chat Panel reste optionnel mais on le garde accessible */}
              <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} userName={userName} />
            </div>
          </div>
        </div>
      </LiveKitRoom>

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
              <button onClick={handleCopyLink} className="p-1 hover:bg-gray-200 rounded transition-colors">
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">Vous participez en tant que {userName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PatientAdminPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-900 rounded-full" />
          Informations administratives
        </h2>

        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Marcus Patient LEBERT</h3>
            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">
              Pas encore communiqué
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-700">
            <p>Date de naissance : 15/05/1990 — 20 ans</p>
            <p>Taille : 1m83</p>
            <p>Poids : 89 kg</p>
            <p>Adresse : 22 rue de Moulins, 39200 Actung HB</p>
          </div>

          <button className="text-sm text-cyan-500 hover:text-cyan-600 font-medium">
            Changer de bénéficiaire
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Identité Nationale de Santé</span>
            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">identité provisoire</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Information consultative sur ce patient
            </h4>
            <p className="text-sm text-gray-700">
              Pour information : suivi d&apos;infection respiratoire récente (7 derniers jours).
            </p>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex gap-3">
          <User className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-sm font-semibold text-gray-900">Identité du patient pas vérifiée</h4>
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-sm text-gray-700">
              Un contrôle d&apos;identité doit être réalisé avant de conclure la consultation.
            </p>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            Important : rappeler au patient les consignes de réévaluation si les symptômes évoluent.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-900 rounded-full" />
          Contact d&apos;urgence
        </h2>

        <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 rounded-lg transition-colors">
          Appeler le contact
        </button>
      </div>
    </div>
  );
}

function TopRightHeader() {
  return (
    <div className="flex items-center justify-between px-2 py-5">
      <div>
        <div className="text-xs font-medium text-gray-800 leading-tight">Marcus Patient Laboirt</div>
        <div className="text-[11px] text-gray-500">Dit que l&apos;irenti 6 jours</div>
      </div>
      <div className="flex items-center space-x-2">
        <button className="border border-red-300 text-red-500 bg-red-50 hover:bg-red-100 font-medium text-xs px-4 h-8 rounded transition-colors">
          Apporter le bénéf
        </button>
        <button className="border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium px-4 h-8 flex items-center gap-1 rounded transition-colors">
          <span className="inline-block">
            <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
              <rect x="4" y="7" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 7V6a3 3 0 1 1 6 0v1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          Ajouté
        </button>
        <button className="border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium px-4 h-8 flex items-center gap-1 rounded transition-colors">
          <span className="inline-block">
            <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
              <circle cx="8.5" cy="8.5" r="5.25" stroke="currentColor" strokeWidth="1.5" />
              <path d="M14 14l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          Message
        </button>
      </div>
    </div>
  );
}

function VideoPanel({
  isVideoExpanded,
  onToggleExpand,
}: {
  isVideoExpanded: boolean;
  onToggleExpand: () => void;
}) {
  return (
    <div
      className={`relative transition-all duration-300 ${
        isVideoExpanded ? 'h-screen' : 'h-[480px] rounded-3xl p-5'
      } flex-shrink-0 bg-slate-900 overflow-hidden`}
    >
      <button
        onClick={onToggleExpand}
        className="absolute top-4 right-4 z-30 w-11 h-11 bg-slate-800/80 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center transition-colors"
        title={isVideoExpanded ? 'Réduire' : 'Étendre'}
      >
        {isVideoExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>

      <div className="absolute top-8 left-8 w-32 h-40 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-slate-800">
        <div className="w-full h-full flex items-center justify-center text-white text-sm">Vous</div>
      </div>

      <div className="absolute bottom-8 right-8 flex gap-3 z-30">
        <ControlButton icon={<Camera className="w-5 h-5" />} />
        <ControlButton
          icon={isVideoExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          onClick={onToggleExpand}
        />
        <ControlButton icon={<Mic className="w-5 h-5" />} />
        <ControlButton icon={<PhoneOff className="w-5 h-5" />} variant="danger" />
      </div>

      <div className={`w-full h-full ${!isVideoExpanded ? 'rounded-3xl' : ''} overflow-hidden`}>
        <GoogleMeetVideoInterface />
        <RoomAudioRenderer />
      </div>
    </div>
  );
}

function ControlButton({
  icon,
  variant = 'default',
  onClick,
}: {
  icon: ReactNode;
  variant?: 'default' | 'danger';
  onClick?: () => void;
}) {
  const base = 'w-12 h-12 rounded-lg flex items-center justify-center transition-colors border border-slate-700/40';
  const styles =
    variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-slate-800/80 hover:bg-slate-800 text-white';
  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {icon}
    </button>
  );
}

function ObservationPanel({ hidden }: { hidden: boolean }) {
  return (
    <div className={`transition-all duration-300 ${hidden ? 'hidden' : 'flex-1 bg-white p-6 overflow-y-auto'}`}>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Observation médicale</h2>
            <button className="flex items-center gap-1 text-sm text-cyan-500 hover:text-cyan-600">
              <Check className="w-4 h-4" />
              Documenté
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Interrogatoire</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>- Plaies douloureuses depuis deux jours</p>
              <p>- Idées de voyage</p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Examen clinique</h3>
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" id="non-applicable" className="w-4 h-4 rounded border-gray-300" />
              <label htmlFor="non-applicable" className="text-sm text-gray-700">
                Non applicable
              </label>
            </div>
            <p className="text-sm text-gray-700">
              Patient souriant, respiration calme, pas de détresse respiratoire. Coloration cutanée normale.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900">Hypothèse diagnostique / Conclusion</h3>
            <p className="text-sm text-gray-700 mt-2">
              Suspicion d&apos;infection virale bénigne. Surveillance à domicile, réévaluation si fièvre ou aggravation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CircleButton({
  active,
  icon,
  onClick,
  title,
  activeColor,
  inactiveColor,
}: {
  active?: boolean;
  icon: ReactNode;
  onClick?: () => void;
  title?: string;
  activeColor: string;
  inactiveColor: string;
}) {
  const classes = `${active ? activeColor : inactiveColor} w-10 h-10 rounded-full flex items-center justify-center transition-colors`;
  return (
    <button onClick={onClick} className={classes} title={title}>
      {icon}
    </button>
  );
}
