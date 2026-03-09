import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const FloatingMessenger = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadChats, setUnreadChats] = useState({});

  useEffect(() => {
    fetchFriends();
    const interval = setInterval(() => {
      if (selectedFriend) {
        fetchMessages(selectedFriend._id);
      }
      fetchFriends();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedFriend]);

  const fetchFriends = async () => {
    try {
      const response = await axiosInstance.get('/friends');
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchMessages = async (friendId) => {
    try {
      const response = await axiosInstance.get(`/messages/conversation/${friendId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend) return;

    try {
      await axiosInstance.post('/messages/send', {
        recipient: selectedFriend._id,
        content: newMessage,
      });
      setNewMessage('');
      fetchMessages(selectedFriend._id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    fetchMessages(friend._id);
    setUnreadChats(prev => ({ ...prev, [friend._id]: 0 }));
  };

  const unreadCount = Object.values(unreadChats).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-2xl flex flex-col h-96"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div>
                <h3 className="font-bold">Mesajlar</h3>
                <p className="text-xs text-purple-100">
                  {selectedFriend ? selectedFriend.username : 'Konuşma seç'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedFriend(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Friends List */}
              {!selectedFriend && (
                <div className="w-full overflow-y-auto">
                  {friends.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Henüz arkadaşınız yok
                    </div>
                  ) : (
                    friends.map(friend => (
                      <motion.button
                        key={friend._id}
                        whileHover={{ backgroundColor: '#F5F5F5' }}
                        onClick={() => handleSelectFriend(friend)}
                        className="w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-semibold text-sm text-gray-800">
                          {friend.username}
                        </p>
                        <p className="text-xs text-gray-500">Seç ve yazışmaya başla</p>
                      </motion.button>
                    ))
                  )}
                </div>
              )}

              {/* Chat Area */}
              {selectedFriend && (
                <div className="w-full flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-4 text-sm">
                        Konuşma başla
                      </div>
                    ) : (
                      messages.map(msg => (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              msg.sender._id === user.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.sender._id === user.id
                                  ? 'text-purple-100'
                                  : 'text-gray-600'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mesaj yaz..."
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-purple-600 text-white p-1 rounded hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Back Button */}
                  <button
                    onClick={() => setSelectedFriend(null)}
                    className="w-full p-2 border-t border-gray-200 text-sm text-purple-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Arkadaşlar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
};

export default FloatingMessenger;
