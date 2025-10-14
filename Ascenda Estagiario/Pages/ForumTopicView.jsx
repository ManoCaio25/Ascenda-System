import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ForumTopic, ForumReply } from '@estagiario/Entities/all';
import { motion } from 'framer-motion';
import { User, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const mockUsers = {
  'user_1': { full_name: 'Galileo', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face' },
  'user_2': { full_name: 'Newton', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
  'user_3': { full_name: 'Curie', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face' },
};

const ReplyCard = ({ reply }) => {
  const author = mockUsers[reply.id_usuario_criador] || { full_name: 'Anonymous', avatar_url: '' };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-4 p-5 rounded-lg ${reply.melhor_resposta ? 'cosmic-card border-green-500' : 'cosmic-card'}`}
    >
      <img src={author.avatar_url} alt={author.full_name} className="w-10 h-10 rounded-full" />
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-white">{author.full_name}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">{format(new Date(reply.created_date), 'MMM d, yyyy')}</span>
          </div>
          {reply.melhor_resposta && (
            <div className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span>Best Answer</span>
            </div>
          )}
        </div>
        <p className="text-slate-300 mt-2">{reply.conteudo_resposta}</p>
      </div>
    </motion.div>
  );
};


export default function ForumTopicViewPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const topicId = searchParams.get('id');

  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!topicId) return;
    const fetchData = async () => {
      setIsLoading(true);
      const [topicData, repliesData] = await Promise.all([
        ForumTopic.get(topicId),
        ForumReply.filter({ id_topico: topicId }, 'created_date')
      ]);
      setTopic(topicData);
      setReplies(repliesData);
      setIsLoading(false);
    };
    fetchData();
  }, [topicId]);

  const handlePostReply = () => {
    if (!newReply.trim()) return;
    const reply = {
      id: `new_${Date.now()}`,
      id_topico: topicId,
      conteudo_resposta: newReply,
      id_usuario_criador: 'user_1', // Mock current user
      created_date: new Date().toISOString(),
      melhor_resposta: false
    };
    setReplies([...replies, reply]);
    setNewReply('');
  };

  if (isLoading || !topic) return <div className="text-white text-center p-10">Loading Topic...</div>;
  
  const creator = mockUsers[topic.id_usuario_criador] || { full_name: 'Anonymous' };
  const bestAnswer = replies.find(r => r.melhor_resposta);
  const otherReplies = replies.filter(r => !r.melhor_resposta);


  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <h1 className="text-4xl font-bold mb-2">{topic.titulo}</h1>
      <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
        <span>By {creator.full_name}</span>
        <span>·</span>
        <span>{format(new Date(topic.created_date), 'MMMM d, yyyy')}</span>
      </div>

      <div className="cosmic-card p-6 mb-8">
        <p>{topic.conteudo_topico}</p>
      </div>
      
      <div className="space-y-5">
        {bestAnswer && <ReplyCard reply={bestAnswer} />}
        {otherReplies.map(reply => <ReplyCard key={reply.id} reply={reply} />)}
      </div>

      <div className="mt-10 cosmic-card p-6">
        <h3 className="font-semibold mb-4 text-lg">Post a Reply</h3>
        <textarea
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 h-32"
        ></textarea>
        <button onClick={handlePostReply} className="cosmic-gradient text-white font-bold py-2 px-5 rounded-lg mt-4">
          Post Reply
        </button>
      </div>
    </div>
  );
}