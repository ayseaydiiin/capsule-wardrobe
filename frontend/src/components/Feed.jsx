import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Trash2, Share2, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import ClothingItem from './ClothingItem';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return 'Şimdi';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}d`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}s`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}g`;
    
    return postDate.toLocaleDateString('tr-TR');
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/posts');
      setPosts(response.data.posts);
      // Her post için like durumunu kontrol et
      const likes = {};
      response.data.posts.forEach(post => {
        likes[post._id] = post.likes?.some(l => l._id === user.id) || false;
      });
      setLikedPosts(likes);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const isCurrentlyLiked = likedPosts[postId];
      setLikedPosts({ ...likedPosts, [postId]: !isCurrentlyLiked });
      
      const response = await axiosInstance.patch(`/posts/${postId}/like`);
      setPosts(posts.map(p => (p._id === postId ? response.data.post : p)));
      setLikedPosts({ ...likedPosts, [postId]: response.data.post.likes?.some(l => l._id === user.id) || false });
    } catch (error) {
      console.error('Error liking post:', error);
      setLikedPosts({ ...likedPosts, [postId]: likedPosts[postId] });
    }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;

    try {
      const response = await axiosInstance.post(`/posts/${postId}/comment`, {
        text: commentText[postId],
      });
      setPosts(posts.map(p => (p._id === postId ? response.data.post : p)));
      setCommentText({ ...commentText, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axiosInstance.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-40 bg-gray-200 rounded mb-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <Share2 size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Henüz paylaşılan kombin yok</p>
        <p className="text-gray-400 text-sm">Kombininizi paylaşmaya başlayın!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <motion.div
          key={post._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-soft overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800">{post.userId.username}</h3>
              <p className="text-xs text-gray-500">
                {formatTime(post.createdAt)}
              </p>
            </div>
            {post.userId._id === user.id && (
              <button
                onClick={() => handleDelete(post._id)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Sil"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          {/* Title & Description */}
          <div className="p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-1">{post.title}</h2>
            {post.description && (
              <p className="text-gray-600 text-sm mb-3">{post.description}</p>
            )}

            {/* Weather Info */}
            {post.weather && (
              <div className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full mb-3">
                🌡️ {post.weather.temperature}°C - {post.weather.condition}
              </div>
            )}
          </div>

          {/* Outfit Items Grid */}
          <div className="px-4 pb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Kombiniz</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {post.outfitItems.top && (
                <div>
                  <ClothingItem item={post.outfitItems.top} size="small" />
                  <p className="text-xs text-gray-600 mt-1 text-center">Üst</p>
                </div>
              )}
              {post.outfitItems.bottom && (
                <div>
                  <ClothingItem item={post.outfitItems.bottom} size="small" />
                  <p className="text-xs text-gray-600 mt-1 text-center">Alt</p>
                </div>
              )}
              {post.outfitItems.shoes && (
                <div>
                  <ClothingItem item={post.outfitItems.shoes} size="small" />
                  <p className="text-xs text-gray-600 mt-1 text-center">Ayakkabı</p>
                </div>
              )}
              {post.outfitItems.outerwear && (
                <div>
                  <ClothingItem item={post.outfitItems.outerwear} size="small" />
                  <p className="text-xs text-gray-600 mt-1 text-center">Dış Giyim</p>
                </div>
              )}
            </div>
            {post.outfitItems.accessories?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Aksesuarlar
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.outfitItems.accessories.map((acc) => (
                    <div key={acc._id} className="w-12 h-12">
                      <ClothingItem item={acc} size="small" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Likes & Comments */}
          <div className="px-4 py-2 border-t border-gray-200 flex items-center space-x-4 text-sm text-gray-600">
            <span>❤️ {post.likes?.length} beğeni</span>
            <span>💬 {post.comments?.length} yorum</span>
          </div>

          {/* Like Button */}
          <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLike(post._id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-colors ${
                likedPosts[post._id]
                  ? 'bg-red-50 text-red-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Heart
                size={20}
                fill={likedPosts[post._id] ? 'currentColor' : 'none'}
              />
              <span className="text-sm font-semibold">
                {post.likes?.length > 0 ? post.likes.length : 'Beğen'}
              </span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLike(post._id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-colors ${
                likedPosts[post._id]
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              <ThumbsDown size={20} />
              <span className="text-sm font-semibold">Beğenmem</span>
            </motion.button>
          </div>

          {/* Comments Section */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
              {post.comments?.map((comment) => (
                <div key={comment._id} className="bg-gray-50 p-2 rounded">
                  <p className="text-xs font-semibold text-gray-800">
                    {comment.userId.username}
                  </p>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={commentText[post._id] || ''}
                onChange={(e) =>
                  setCommentText({ ...commentText, [post._id]: e.target.value })
                }
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleComment(post._id);
                  }
                }}
                placeholder="Yorum ekle..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <button
                onClick={() => handleComment(post._id)}
                disabled={!commentText[post._id]?.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors disabled:bg-gray-400 text-sm"
              >
                <MessageCircle size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Feed;
