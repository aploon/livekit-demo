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
  AlertCircle,
  User,
  ChevronDown,
  Plus,
  Check,
} from 'lucide-react';
import { Track } from 'livekit-client';
import MedicalVideoPanel from './MedicalVideoPanel';
import ChatPanel from './ChatPanel';

interface ConferenceRoomProps {
  token: string;
  serverUrl: string;
  roomName: string;
  userName: string;
  onLeave: () => void;
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
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <div
            className={`transition-all duration-300 ${
              isVideoExpanded ? 'w-0 opacity-0 overflow-hidden' : 'w-full md:w-1/2 p-4 md:p-6'
            } bg-white border-r border-gray-200 overflow-y-auto`}
          >
            <PatientAdminPanel />
          </div>

          <div className={`flex-1 transition-all duration-300 ${isVideoExpanded ? 'w-full' : ''} ${isVideoExpanded ? 'h-screen' : ''}`}>
            <div className={`h-full flex flex-col ${isVideoExpanded ? 'overflow-hidden' : ''}`}>

              <VideoPanel
                isVideoExpanded={isVideoExpanded}
                onToggleExpand={() => setIsVideoExpanded((v) => !v)}
                onLeave={onLeave}
                onChatToggle={() => setIsChatOpen((v) => !v)}
              />

              <ObservationPanel hidden={isVideoExpanded} />

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
            <p>Date de naissance : 15/05/1990 — 34 ans</p>
            <p>Sexe : Masculin</p>
            <p>Taille : 1m83</p>
            <p>Poids : 89 kg</p>
            <p>Adresse : 22 rue de Moulins, 39200 Actung HB</p>
            <p>Médecin référent : Dr. Jeanne Dupont (Généraliste)</p>
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
            Antécédents : asthme modéré, vaccination COVID à jour. Allergie connue : pénicilline.
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

function VideoPanel({
  isVideoExpanded,
  onToggleExpand,
  onLeave,
  onChatToggle,
}: {
  isVideoExpanded: boolean;
  onToggleExpand: () => void;
  onLeave: () => void;
  onChatToggle: () => void;
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
    if (!localParticipant) return;
    await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
  };

  const toggleVideo = async () => {
    if (!localParticipant) return;
    await localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
  };

  const toggleScreenShare = async () => {
    if (!localParticipant) return;
    if (isScreenSharing) {
      await localParticipant.setScreenShareEnabled(false);
      setIsScreenSharing(false);
    } else {
      await localParticipant.setScreenShareEnabled(true);
      setIsScreenSharing(true);
    }
  };

  return (
    <div
      className={`relative transition-all duration-300 ${
        isVideoExpanded ? 'h-screen' : 'h-[320px] sm:h-[420px] lg:h-[480px] rounded-3xl p-3 sm:p-5'
      } flex-shrink-0 bg-slate-900 overflow-hidden`}
    >
      <button
        onClick={onToggleExpand}
        className="absolute top-4 right-4 z-30 w-11 h-11 bg-slate-800/80 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center transition-colors"
        title={isVideoExpanded ? 'Réduire' : 'Étendre'}
      >
        {isVideoExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>

      <div className={`w-full h-full ${!isVideoExpanded ? 'rounded-3xl' : ''} overflow-hidden`}>
        <MedicalVideoPanel />
        <RoomAudioRenderer />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full z-30 flex flex-wrap gap-2 sm:gap-3 justify-center">
        <ControlButton
          onClick={toggleMic}
          icon={isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          active={isMuted}
          activeColor="bg-rose-500 hover:bg-rose-600"
          inactiveColor="bg-slate-800/80 hover:bg-slate-800"
        />
        <ControlButton
          onClick={toggleVideo}
          icon={isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          active={isVideoOff}
          activeColor="bg-rose-500 hover:bg-rose-600"
          inactiveColor="bg-slate-800/80 hover:bg-slate-800"
        />
        <ControlButton
          onClick={toggleScreenShare}
          icon={<Monitor className="w-5 h-5" />}
          active={isScreenSharing}
          activeColor="bg-sky-600 hover:bg-sky-700"
          inactiveColor="bg-slate-800/80 hover:bg-slate-800"
        />
        <ControlButton
          onClick={onChatToggle}
          icon={<MessageSquare className="w-5 h-5" />}
          inactiveColor="bg-slate-800/80 hover:bg-slate-800"
          activeColor="bg-slate-800/80 hover:bg-slate-800"
        />
        <ControlButton
          onClick={onLeave}
          icon={<PhoneOff className="w-5 h-5" />}
          variant="danger"
          inactiveColor="bg-rose-600 hover:bg-rose-700"
          activeColor="bg-rose-600 hover:bg-rose-700"
        />
      </div>
    </div>
  );
}

function ControlButton({
  icon,
  onClick,
  active,
  activeColor = 'bg-slate-800/80 hover:bg-slate-800',
  inactiveColor = 'bg-slate-800/80 hover:bg-slate-800',
  variant = 'default',
}: {
  icon: ReactNode;
  onClick?: () => void;
  active?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  variant?: 'default' | 'danger';
}) {
  const base = 'w-12 h-12 rounded-lg flex items-center justify-center transition-colors border border-slate-700/40 text-white';
  const danger = 'bg-rose-600 hover:bg-rose-700';
  const styles = variant === 'danger' ? danger : active ? activeColor : inactiveColor;
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
              <p>- Toux sèche depuis 3 jours, fébricule hier soir (37.8°C)</p>
              <p>- Céphalées légères, pas de dyspnée rapportée</p>
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
              Patient serein, eupnéique, saturation SpO₂ 98% AA, auscultation pulmonaire claire. Pas de signe de détresse respiratoire.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900">Hypothèse diagnostique / Conclusion</h3>
            <p className="text-sm text-gray-700 mt-2">
              Rhinopharyngite virale probable. Traitement symptomatique, hydratation, surveillance. Revue si fièvre &gt; 38.5°C ou dyspnée.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

