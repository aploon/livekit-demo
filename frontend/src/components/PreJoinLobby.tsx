import { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  HelpCircle, 
  MessageSquare, 
  Settings, 
  Grid3x3, 
  Calendar,
  Video as VideoIcon,
  Plus,
  Copy,
  X
} from 'lucide-react';

interface PreJoinLobbyProps {
  onJoin: (roomName: string, userName: string) => void;
}

export default function PreJoinLobby({ onJoin }: PreJoinLobbyProps) {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [showMeetingReady, setShowMeetingReady] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [activeTab, setActiveTab] = useState<'meetings' | 'calls'>('meetings');

  const handleNewMeeting = () => {
    // Générer un nom d'utilisateur par défaut si non défini
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
    // Utiliser un nom par défaut si non fourni
    const finalUserName = userName.trim() || `User-${Math.random().toString(36).substr(2, 9)}`;
    if (roomName.trim()) {
      onJoin(roomName, finalUserName);
    }
  };

  const handleJoinFromPopup = () => {
    // Utiliser un nom par défaut si non fourni
    const finalUserName = userName.trim() || `User-${Math.random().toString(36).substr(2, 9)}`;
    if (roomName.trim()) {
      setShowMeetingReady(false);
      onJoin(roomName, finalUserName);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    // Vous pourriez ajouter un toast ici
  };

  const getCurrentTime = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    return `${time} • ${date}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded flex items-center justify-center bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500">
              <VideoIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-medium text-gray-900">Google Meet</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{getCurrentTime()}</span>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MessageSquare className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Grid3x3 className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm ml-2">
            A
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 p-4">
          <button
            onClick={() => setActiveTab('meetings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-full transition-colors ${
              activeTab === 'meetings'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Réunions</span>
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-full mt-2 transition-colors ${
              activeTab === 'calls'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <VideoIcon className="w-5 h-5" />
            <span className="font-medium">Appels</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-2xl w-full space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-normal text-gray-900">
                Appels vidéo et visioconférences pour tous
              </h1>
              <p className="text-lg text-gray-600">
                Communiquez, collaborez et célébrez les bons moments où que vous soyez avec Google Meet
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleNewMeeting}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors shadow-sm"
                >
                  <VideoIcon className="w-5 h-5" />
                  <Plus className="w-5 h-5" />
                  <span>Nouvelle réunion</span>
                </button>
                <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-full px-4 py-3 hover:shadow-md transition-shadow">
                  <Grid3x3 className="w-5 h-5 text-gray-500 mr-2" />
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Saisir un code ou un lien"
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinWithCode()}
                  />
                </div>
                {roomName.trim() && (
                  <button
                    onClick={handleJoinWithCode}
                    className="px-6 py-3 text-blue-600 hover:bg-blue-50 rounded-full font-medium transition-colors"
                  >
                    Participer
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-full px-4 py-3 hover:shadow-md transition-shadow">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Votre nom (optionnel)"
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-64 h-64 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p className="text-center mt-6 text-gray-600">Obtenir un lien de partage</p>
            </div>
          </div>
        </main>
      </div>

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
            <div className="flex items-start space-x-2 text-xs text-gray-600">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Les personnes utilisant le lien de cette réunion doivent obtenir votre autorisation pour y participer.</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
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
