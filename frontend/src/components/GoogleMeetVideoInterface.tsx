import { useMemo } from 'react';
import {
  RoomAudioRenderer,
  useParticipants,
  useTracks,
  VideoTrack,
  TrackReference,
  GridLayout,
  ParticipantTile,
  useLocalParticipant,
} from '@livekit/components-react';
import { Track, Participant } from 'livekit-client';
import { Users, X } from 'lucide-react';

interface ParticipantAvatarProps {
  participant: Participant;
  size?: 'small' | 'medium' | 'large';
}

function ParticipantAvatar({ participant, size = 'large' }: ParticipantAvatarProps) {
  const sizeClasses = {
    small: 'w-12 h-12 text-lg',
    medium: 'w-16 h-16 text-xl',
    large: 'w-32 h-32 text-4xl',
  };

  const name = participant.name || participant.identity;
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-blue-500 flex items-center justify-center text-white font-medium`}>
      {initial}
    </div>
  );
}

interface ParticipantVideoProps {
  participant: Participant;
  isLocal?: boolean;
  isMain?: boolean;
}

function ParticipantVideo({ participant, isLocal = false, isMain = false }: ParticipantVideoProps) {
  const tracks = useTracks([{ source: Track.Source.Camera, participant }]);
  const videoTrack = tracks.find((track) => track.publication?.kind === 'video');

  const name = participant.name || participant.identity;

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-gray-800 ${
        isMain ? 'w-full h-full' : 'aspect-video'
      }`}
    >
      {videoTrack && videoTrack.publication?.isSubscribed ? (
        <VideoTrack
          trackRef={videoTrack as TrackReference}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ParticipantAvatar participant={participant} size={isMain ? 'large' : 'medium'} />
        </div>
      )}
      
      {/* Nom du participant en bas */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white font-medium truncate">
            {isLocal ? `${name} (Vous)` : name}
          </span>
          <div className="flex items-center space-x-1">
            {participant.isMicrophoneEnabled ? (
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            ) : (
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoogleMeetVideoInterface() {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const screenShareTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const cameraTracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
  ]);

  const { remoteParticipants } = useMemo(() => {
    const remote = participants.filter((p) => !p.isLocal);
    return {
      remoteParticipants: remote,
    };
  }, [participants]);

  const hasScreenShare = screenShareTracks.length > 0;
  const totalParticipants = participants.length;
  const screenShareParticipant = hasScreenShare
    ? screenShareTracks[0]?.participant
    : null;

  const handleStopScreenShare = async () => {
    if (localParticipant) {
      try {
        await localParticipant.setScreenShareEnabled(false);
      } catch (error) {
        console.error('Erreur lors de l\'arrêt du partage d\'écran:', error);
      }
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#202124] relative">
      {/* Zone principale de vidéo */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {hasScreenShare ? (
          // Mode partage d'écran
          <div className="w-full h-full flex flex-col relative">
            {/* Barre de contrôle pour le partage d'écran */}
            {screenShareParticipant && (
              <div className="absolute top-4 left-4 right-4 z-40 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-white text-sm">
                  <span className="font-medium">
                    {screenShareParticipant.isLocal
                      ? 'Vous partagez votre écran'
                      : `${screenShareParticipant.name || screenShareParticipant.identity} partage son écran`}
                  </span>
                </div>
                {screenShareParticipant.isLocal && (
                  <button
                    onClick={handleStopScreenShare}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Arrêter le partage</span>
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 rounded-lg overflow-hidden bg-black mt-12">
              {screenShareTracks.map((track) => (
                <VideoTrack
                  key={track.publication?.trackSid}
                  trackRef={track as TrackReference}
                  className="w-full h-full object-contain"
                />
              ))}
            </div>
            {totalParticipants > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {localParticipant && (
                  <div className="flex-shrink-0 w-48">
                    <ParticipantVideo participant={localParticipant} isLocal={true} />
                  </div>
                )}
                {remoteParticipants.map((participant) => (
                  <div key={participant.identity} className="flex-shrink-0 w-48">
                    <ParticipantVideo participant={participant} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : totalParticipants === 0 ? (
          // Aucun participant
          <div className="flex flex-col items-center justify-center space-y-4">
            {localParticipant ? (
              <ParticipantAvatar participant={localParticipant} size="large" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-medium">
                U
              </div>
            )}
            <p className="text-gray-400 text-sm">En attente de participants...</p>
          </div>
        ) : totalParticipants === 1 ? (
          // Un seul participant (soi-même)
          <div className="w-full h-full flex items-center justify-center">
            {localParticipant && (
              <div className="w-full max-w-4xl aspect-video">
                <ParticipantVideo participant={localParticipant} isLocal={true} isMain={true} />
              </div>
            )}
          </div>
        ) : (
          // Plusieurs participants : utiliser GridLayout pour une meilleure structure
          <div className="w-full h-full">
            <GridLayout tracks={cameraTracks} className="h-full">
              <ParticipantTile />
            </GridLayout>
          </div>
        )}

        {/* Indicateur de nombre de participants */}
        {totalParticipants > 0 && (
          <div className="absolute top-6 right-6 z-30 flex items-center space-x-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
            <Users className="w-4 h-4 text-white" />
            <span className="text-xs text-white">
              {totalParticipants} {totalParticipants > 1 ? 'participants' : 'participant'}
            </span>
          </div>
        )}
      </div>

      {/* Rendu audio (obligatoire mais invisible) */}
      <RoomAudioRenderer />
    </div>
  );
}
