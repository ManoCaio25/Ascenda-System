import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@estagiario/utils';
import { ForumTopic, ForumCategory } from '@estagiario/Entities/all';
import { motion } from 'framer-motion';
import { MessageSquare, User, Calendar, Eye, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

// Mock user data for display purposes
const mockUsers = {
  'user_1': { full_name: 'Galileo', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face' },
  'user_2': { full_name: 'Newton', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
  'user_3': { full_name: 'Curie', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face' },
};

export default function ForumTopicsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryId = searchParams.get('category');

  const [category, setCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    const fetchData = async () => {
      setIsLoading(true);
      const [categoryData, topicsData] = await Promise.all([
        ForumCategory.get(categoryId),
        ForumTopic.filter({ id_categoria_forum: categoryId }, '-created_date')
      ]);
      setCategory(categoryData);
      setTopics(topicsData);
      setIsLoading(false);
    };
    fetchData();
  }, [categoryId]);

  if (isLoading) return <div className="text-white text-center p-10">Loading Topics...</div>;
  if (!category) return <div className="text-white text-center p-10">Category not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <div className="mb-8">
        <Link to={createPageUrl('Forum')} className="flex items-center gap-2 text-slate-400 hover:text-purple-400 mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to Categories
        </Link>
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-4xl font-bold">{category.nome_categoria}</h1>
                <p className="text-slate-300 mt-1">{category.descricao}</p>
            </div>
            <button className="cosmic-gradient text-white font-bold py-2 px-4 rounded-lg">New Topic</button>
        </div>
      </div>
      
      <div className="space-y-4">
        {topics.map((topic, index) => {
          const creator = mockUsers[topic.id_usuario_criador] || { full_name: 'Anonymous', avatar_url: '' };
          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={createPageUrl(`ForumTopicView?id=${topic.id}`)} className="block cosmic-card rounded-lg p-5 hover:border-purple-500 transition-colors">
                <div className="flex items-start gap-4">
                  <img src={creator.avatar_url} alt={creator.full_name} className="w-10 h-10 rounded-full" />
                  <div className="flex-grow">
                    <h2 className="font-semibold text-lg">{topic.titulo}</h2>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      <div className="flex items-center gap-1"><User className="w-3 h-3" /><span>{creator.full_name}</span></div>
                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>{format(new Date(topic.created_date), 'MMM d, yyyy')}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-center">
                      <div>
                          <div className="font-bold">{topic.reply_count || 0}</div>
                          <div className="text-xs text-slate-500">Replies</div>
                      </div>
                      <div>
                          <div className="font-bold">{topic.visualizacoes}</div>
                          <div className="text-xs text-slate-500">Views</div>
                      </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
}