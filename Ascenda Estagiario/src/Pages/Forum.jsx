import React, { useState, useEffect } from 'react';
import { ForumCategory } from '@estagiario/Entities/all';
import { motion } from 'framer-motion';
import { Hash, MessageSquare, Book, Users, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@estagiario/utils';

const categoryIcons = {
  "Technical Questions": Hash,
  "Career Development": Users,
  "Project Showcase": GitBranch,
  "General Discussion": MessageSquare,
  "Resources & Tools": Book
}

export default function ForumPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ForumCategory.list().then(data => {
      setCategories(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div className="text-white text-center p-10">Loading Forum...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Forum Categories</h1>
        <button className="cosmic-gradient text-white font-bold py-2 px-4 rounded-lg">New Topic</button>
      </div>

      <div className="space-y-4">
        {categories.map((category, index) => {
          const Icon = categoryIcons[category.nome_categoria] || MessageSquare;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={createPageUrl(`ForumTopics?category=${category.id}`)} className="block cosmic-card rounded-lg p-6 hover:border-purple-500 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <Icon className="w-8 h-8 text-purple-400" />
                  <div className="flex-grow">
                    <h2 className="font-semibold text-lg text-white">{category.nome_categoria}</h2>
                    <p className="text-sm text-slate-400">{category.descricao}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{category.topic_count}</div>
                    <div className="text-sm text-slate-500">Topics</div>
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