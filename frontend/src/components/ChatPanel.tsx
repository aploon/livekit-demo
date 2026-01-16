import { useState, useEffect, useRef } from 'react';
import { useDataChannel, useLocalParticipant, useParticipants } from '@livekit/components-react';
import { MessageSquare, Send, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  participant: string;
  message: string;
  timestamp: Date;
  isLocal: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export default function ChatPanel({ isOpen, onClose, userName }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const { message } = useDataChannel('chat');

  useEffect(() => {
    if (message) {
      try {
        const data = JSON.parse(new TextDecoder().decode(message.payload));
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            participant: data.participant || 'Anonyme',
            message: data.message,
            timestamp: new Date(),
            isLocal: data.participant === userName,
          },
        ]);
      } catch (error) {
        console.error('Erreur lors de la lecture du message:', error);
      }
    }
  }, [message, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() && localParticipant) {
      const messageData = {
        participant: userName,
        message: inputMessage.trim(),
      };

      const encoder = new TextEncoder();
      const payload = encoder.encode(JSON.stringify(messageData));

      localParticipant.publishData(payload, { reliable: true, topic: 'chat' });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          participant: userName,
          message: inputMessage.trim(),
          timestamp: new Date(),
          isLocal: true,
        },
      ]);

      setInputMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 bottom-16 w-80 bg-white flex flex-col shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-gray-700" />
          <h3 className="font-medium text-gray-900">Chat</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-8">
            Aucun message pour le moment
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isLocal ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  msg.isLocal
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {!msg.isLocal && (
                  <div className="text-xs font-medium mb-1 opacity-75">
                    {msg.participant}
                  </div>
                )}
                <div className="text-sm">{msg.message}</div>
                <div
                  className={`text-xs mt-1 ${
                    msg.isLocal ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Tapez un message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
