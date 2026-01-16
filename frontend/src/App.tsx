import PreJoinLobby from './components/PreJoinLobby';
import ConferenceRoom from './components/ConferenceRoom';
import { useState, useEffect } from 'react';

interface RoomState {
  roomName: string;
  userName: string;
  token: string;
  serverUrl: string;
}

function App() {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  // Lire le paramètre room de l'URL au chargement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomNameFromUrl = urlParams.get('room');
    
    if (roomNameFromUrl && !roomState) {
      // Si un room name est présent dans l'URL mais qu'on n'est pas encore connecté,
      // on pourrait pré-remplir le formulaire, mais pour l'instant on ne fait rien
      // car on a besoin aussi du userName
    }
  }, []);

  const handleJoin = async (roomName: string, userName: string) => {
    setIsGeneratingToken(true);

    try {
      const serverUrl = 'ws://localhost:7880';
      const token = await generateDemoToken(roomName, userName);

      // Mettre à jour l'URL avec le paramètre room
      const url = new URL(window.location.href);
      url.searchParams.set('room', roomName);
      window.history.pushState({}, '', url.toString());

      setRoomState({
        roomName,
        userName,
        token,
        serverUrl,
      });
    } catch (error) {
      console.error('Erreur lors de la génération du token:', error);
      alert('Erreur: Impossible de générer le token. Assurez-vous que votre serveur LiveKit est démarré.');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleLeave = () => {
    // Nettoyer l'URL en supprimant le paramètre room
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url.toString());
    
    setRoomState(null);
  };

  if (isGeneratingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  if (roomState) {
    return (
      <ConferenceRoom
        token={roomState.token}
        serverUrl={roomState.serverUrl}
        roomName={roomState.roomName}
        userName={roomState.userName}
        onLeave={handleLeave}
      />
    );
  }

  return <PreJoinLobby onJoin={handleJoin} />;
}

async function generateDemoToken(roomName: string, userName: string): Promise<string> {
  const response = await fetch(`http://localhost:8000/api/video/token?room=${encodeURIComponent(roomName)}&user=${encodeURIComponent(userName)}`);

  if (!response.ok) {
    throw new Error('Échec de la génération du token');
  }

  const data = await response.json();
  return data.token;
}

export default App;
