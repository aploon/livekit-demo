import { useMemo } from 'react';
import {
  RoomAudioRenderer,
  useParticipants,
  useTracks,
  VideoTrack,
  TrackReference,
} from '@livekit/components-react';
import { Track, Participant } from 'livekit-client';
import { Users } from 'lucide-react';

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
  const screenShareTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const { localParticipant, remoteParticipants } = useMemo(() => {
    const local = participants.find((p) => p.isLocal);
    const remote = participants.filter((p) => !p.isLocal);
    return {
      localParticipant: local,
      remoteParticipants: remote,
    };
  }, [participants]);

  const hasScreenShare = screenShareTracks.length > 0;
  const totalParticipants = participants.length;

  return (
    <div className="h-full w-full flex flex-col bg-[#202124] relative">
      {/* Zone principale de vidéo */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {hasScreenShare ? (
          // Mode partage d'écran
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 rounded-lg overflow-hidden bg-black">
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
          // Plusieurs participants : grille adaptative
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl">
            {remoteParticipants.length > 0 ? (
              <>
                {remoteParticipants[0] && (
                  <div className="md:col-span-2">
                    <ParticipantVideo participant={remoteParticipants[0]} isMain={true} />
                  </div>
                )}
                {remoteParticipants.length > 1 && (
                  <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {remoteParticipants.slice(1).map((participant) => (
                      <ParticipantVideo key={participant.identity} participant={participant} />
                    ))}
                    {localParticipant && (
                      <ParticipantVideo participant={localParticipant} isLocal={true} />
                    )}
                  </div>
                )}
                {remoteParticipants.length === 1 && localParticipant && (
                  <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                    <ParticipantVideo participant={localParticipant} isLocal={true} />
                  </div>
                )}
              </>
            ) : localParticipant ? (
              <div className="md:col-span-2">
                <ParticipantVideo participant={localParticipant} isLocal={true} isMain={true} />
              </div>
            ) : null}
          </div>
        )}

        {/* Indicateur de nombre de participants */}
        {totalParticipants > 0 && (
          <div className="absolute top-6 right-6 flex items-center space-x-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
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
