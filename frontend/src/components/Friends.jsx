import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');
  const { user } = useAuth();

  useEffect(() => {
    fetchFriendsAndSuggestions();
  }, []);

  const fetchFriendsAndSuggestions = async () => {
    try {
      setLoading(true);
      const [friendsRes, suggestionsRes, receivedRes, sentRes] = await Promise.all([
        axiosInstance.get('/friends'),
        axiosInstance.get('/friends/suggestions'),
        axiosInstance.get('/friends/requests/received'),
        axiosInstance.get('/friends/requests/sent'),
      ]);
      setFriends(friendsRes.data);
      setSuggestions(suggestionsRes.data);
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      const response = await axiosInstance.post(`/friends/request/send/${friendId}`);
      setSentRequests([response.data.request, ...sentRequests]);
      await fetchFriendsAndSuggestions();
    } catch (error) {
      console.error('Error adding friend:', error);
      alert(error.response?.data?.message || 'Arkadaş isteği gönderilemedi');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axiosInstance.post(`/friends/request/accept/${requestId}`);
      await fetchFriendsAndSuggestions();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axiosInstance.post(`/friends/request/reject/${requestId}`);
      await fetchFriendsAndSuggestions();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await axiosInstance.post(`/friends/remove/${friendId}`);
      await fetchFriendsAndSuggestions();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Arkadaşlar</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'friends'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600'
          }`}
        >
          Arkadaşlar ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'received'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600'
          }`}
        >
          İstekler ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'sent'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600'
          }`}
        >
          Gönderilen ({sentRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'suggestions'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-600'
          }`}
        >
          Keşfet ({suggestions.length})
        </button>
      </div>

      {/* Friends List */}
      {activeTab === 'friends' && (
        <div>
          {friends.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Henüz hiç arkadaşınız yok
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{friend.username}</h3>
                    <p className="text-gray-600 text-sm">{friend.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend._id)}
                    className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"
                  >
                    <UserMinus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {activeTab === 'suggestions' && (
        <div>
          {suggestions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Başka arkadaş önerisi yok
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{user.username}</h3>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleAddFriend(user._id)}
                    className="bg-indigo-100 text-indigo-600 p-2 rounded-full hover:bg-indigo-200"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Received Requests */}
      {activeTab === 'received' && (
        <div>
          {receivedRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Henüz arkadaşlık isteği yok
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {receivedRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{request.sender.username}</h3>
                    <p className="text-gray-600 text-sm">{request.sender.email}</p>
                    <p className="text-xs text-yellow-600 mt-1">İstek Bekleniyor</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sent Requests */}
      {activeTab === 'sent' && (
        <div>
          {sentRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Henüz arkadaşlık isteği göndermediniz
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{request.recipient.username}</h3>
                    <p className="text-gray-600 text-sm">{request.recipient.email}</p>
                    <p className="text-xs text-blue-600 mt-1">Bekleniyor...</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
