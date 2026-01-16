import { useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Video, PhoneOff } from 'lucide-react';

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
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <div className="relative min-h-screen flex flex-col">
        <header className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <h1 className="text-lg sm:text-xl font-semibold text-white truncate">{roomName}</h1>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                <span className="text-xs sm:text-sm text-slate-300 whitespace-nowrap">
                  {isConnected ? 'Connecté' : 'Connexion...'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800/50 rounded-full border border-slate-700/50">
                <span className="text-xs sm:text-sm text-slate-300 truncate">{userName}</span>
              </div>
              <button
                onClick={onLeave}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all duration-200 flex items-center space-x-2 hover:scale-105 flex-shrink-0"
              >
                <PhoneOff className="w-4 h-4" />
                <span className="hidden sm:inline">Quitter</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0 p-3 sm:p-4 md:p-6">
          <div className="flex-1 flex flex-col min-h-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
            <LiveKitRoom
              video={true}
              audio={true}
              token={token}
              serverUrl={serverUrl}
              onConnected={() => setIsConnected(true)}
              onDisconnected={() => {
                setIsConnected(false);
                onLeave();
              }}
              data-lk-theme="default"
              className="flex-1 flex flex-col min-h-0"
              style={{
                '--lk-bg': '#1e293b',
                '--lk-bg2': '#334155',
                '--lk-fg': '#ffffff',
                '--lk-fg2': '#e2e8f0',
                '--lk-control-bg': '#1e293b',
                '--lk-control-hover-bg': '#334155',
              } as React.CSSProperties}
            >
              <div className="flex-1 flex flex-col min-h-0 overflow-auto">
                <VideoConference />
              </div>
              <RoomAudioRenderer />
            </LiveKitRoom>
          </div>
        </main>
      </div>
    </div>
  );
}
