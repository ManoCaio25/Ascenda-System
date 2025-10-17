
import React, { useEffect, useMemo, useState } from 'react';
import { User, Achievement, ShopItem } from '@estagiario/Entities/all';
import { motion } from 'framer-motion';
import { Trophy, ShoppingBag, User as UserIcon, Check, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@estagiario/Components/ui/button';
import { Progress } from '@estagiario/Components/ui/progress';

const ProfileTab = ({ user }) => (
  <div className="space-y-6">
    <div className="text-center space-y-3">
      <div className="relative w-32 h-32 mx-auto">
        <img
          src={user.avatar_url}
          alt="Avatar"
          className="w-32 h-32 rounded-full mx-auto border-4 border-purple-500 object-cover"
        />
        <span className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 bg-purple-600/90 text-white text-xs font-semibold px-2 py-1 rounded-full">
          <Sparkles className="w-3 h-3" /> {user.pontos_gamificacao || 0} pts
        </span>
      </div>
      <div>
        <h2 className="text-2xl font-bold">{user.full_name}</h2>
        {user.equipped_tag && (
          <p className="text-lg text-orange-400 font-semibold">{user.equipped_tag}</p>
        )}
        <p className="text-slate-400">{user.email}</p>
        <p className="text-slate-300">{user.area_atuacao}</p>
      </div>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Cosmic Points', value: user.pontos_gamificacao || 0, accent: 'text-orange-300' },
        { label: 'Badges', value: user.badge_count || 0, accent: 'text-purple-300' },
        { label: 'Active Missions', value: user.active_missions || 2, accent: 'text-blue-300' },
        { label: 'Mentor Syncs', value: user.mentor_syncs || 5, accent: 'text-emerald-300' },
      ].map((stat) => (
        <div key={stat.label} className="cosmic-card rounded-xl p-4 text-center border border-purple-500/20">
          <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.accent}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  </div>
);

const badgeRarity = {
  legendary: { label: 'Legendary', badge: 'bg-gradient-to-r from-purple-500 to-orange-400 text-white', accent: 'text-orange-300' },
  epic: { label: 'Epic', badge: 'bg-purple-500/20 text-purple-200 border border-purple-500/40', accent: 'text-purple-200' },
  rare: { label: 'Rare', badge: 'bg-blue-500/20 text-blue-200 border border-blue-500/40', accent: 'text-blue-200' },
  uncommon: { label: 'Uncommon', badge: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40', accent: 'text-emerald-200' },
  common: { label: 'Common', badge: 'bg-slate-700/40 text-slate-200 border border-slate-500/40', accent: 'text-slate-200' },
};

const BadgesTab = ({ achievements, onEquip, equippedTag }) => (
  <div className="space-y-6">
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-bold">My Badges</h2>
      <p className="text-slate-400 text-sm">Track your progress and equip the badge that matches your current mission.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {achievements.map((badge, index) => {
        const rarity = badgeRarity[badge.raridade] || badgeRarity.common;
        const equipped = equippedTag === `${badge.url_icone} ${badge.nome_conquista}`;

        return (
          <motion.div
            key={badge.id || index}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="cosmic-card rounded-xl p-5 flex flex-col justify-between border border-purple-500/20"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${rarity.badge}`}>
                  {rarity.label}
                </span>
                <span className="text-4xl">{badge.url_icone}</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">{badge.nome_conquista}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{badge.descricao}</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Progress</span>
                  <span className={rarity.accent}>{badge.progresso}%</span>
                </div>
                <Progress value={badge.progresso} className="h-2 bg-slate-800" />
              </div>
            </div>

            <Button
              onClick={() => onEquip(`${badge.url_icone} ${badge.nome_conquista}`)}
              variant={equipped ? 'gradient' : 'outline'}
              className="mt-4"
            >
              {equipped ? (
                <>
                  <Check className="w-4 h-4 mr-2" /> Equipped
                </>
              ) : (
                'Equip'
              )}
            </Button>
          </motion.div>
        );
      })}
    </div>
  </div>
);

const ShopTab = ({ items, points, onEquip, equippedTag }) => {
  const [filter, setFilter] = useState('all');

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'equippable') return items.filter((item) => item.tipo_item === 'Tag');
    return items.filter((item) => item.raridade === filter);
  }, [items, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Avatar Shop</h2>
          <p className="text-sm text-slate-400">Redeem cosmetics and tags with your cosmic points.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-lg font-bold text-orange-400">{points} pts</div>
          <div className="flex flex-wrap gap-2">
            {['all', 'equippable', 'legendary', 'epic', 'rare'].map((option) => (
              <Button
                key={option}
                size="sm"
                variant={filter === option ? 'gradient' : 'outline'}
                onClick={() => setFilter(option)}
              >
                {option === 'all' && 'All'}
                {option === 'equippable' && 'Equippable'}
                {option !== 'all' && option !== 'equippable' && (option.charAt(0).toUpperCase() + option.slice(1))}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item, index) => {
          const rarity = badgeRarity[item.raridade] || badgeRarity.common;
          const equipped = equippedTag === `${item.url_imagem} ${item.nome_item}`;

          return (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="cosmic-card rounded-xl p-5 flex flex-col justify-between border border-purple-500/20"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${rarity.badge}`}>
                    {rarity.label}
                  </span>
                  <span className="text-4xl">{item.url_imagem}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.nome_item}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.descricao}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{item.tipo_item}</span>
                  <span className={item.estoque === 'limited' ? 'text-orange-300' : 'text-emerald-300'}>
                    {item.estoque === 'limited' ? 'Limited' : 'Available'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button variant="outline" className="w-full border-purple-500/50 text-purple-200 hover:bg-purple-500/10">
                  {item.custo_pontos} pts
                </Button>
                {item.tipo_item === 'Tag' && (
                  <Button
                    onClick={() => onEquip(`${item.url_imagem} ${item.nome_item}`)}
                    variant={equipped ? 'gradient' : 'outline'}
                    className="w-full"
                  >
                    {equipped ? (
                      <>
                        <Check className="w-4 h-4 mr-2" /> Equipped
                      </>
                    ) : (
                      'Equip Tag'
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [equippedTag, setEquippedTag] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      User.me().then((u) => {
        setUser(u);
        setEquippedTag(u.equipped_tag || '');
      }).catch(() => {
        const mockUser = {
          full_name: 'Alex Cosmos',
          email: 'alex@ascenda.com',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
          area_atuacao: 'Frontend Development',
          pontos_gamificacao: 2847,
          equipped_tag: '🚀 Cosmic Explorer',
        };
        setUser(mockUser);
        setEquippedTag(mockUser.equipped_tag);
      });
      Achievement.list().then(setAchievements);
      ShopItem.list().then(setShopItems);
    };
    fetchData();
  }, []);

  const handleEquipTag = async (tag) => {
    setEquippedTag(tag);
    setUser((prevUser) => ({ ...prevUser, equipped_tag: tag }));
    console.log(`Equipped tag: ${tag}`);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'badges', label: 'My Badges', icon: Trophy },
    { id: 'shop', label: 'Avatar Shop', icon: ShoppingBag },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto text-white space-y-8">
      <div className="cosmic-card rounded-2xl p-6 border border-purple-500/30">
        <ProfileTab user={user} />
      </div>

      <div className="flex justify-center">
        <div className="cosmic-card rounded-xl p-2 flex items-center space-x-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'gradient' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              className="px-4"
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === 'profile' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="cosmic-card rounded-xl p-5 border border-purple-500/30 space-y-3">
              <h3 className="text-lg font-semibold text-white">Growth Focus</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Alex is currently exploring motion design patterns and inclusive component libraries. This month’s goal is to
                ship an animated landing page prototype and document the design system updates.
              </p>
            </div>
            <div className="cosmic-card rounded-xl p-5 border border-purple-500/30 space-y-3">
              <h3 className="text-lg font-semibold text-white">Mentor Feedback</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                “Continue compartilhando retrospectivas completas – elas elevam a colaboração do squad e mostram evolução
                consistente.”
              </p>
            </div>
          </div>
        )}
        {activeTab === 'badges' && (
          <BadgesTab achievements={achievements} onEquip={handleEquipTag} equippedTag={equippedTag} />
        )}
        {activeTab === 'shop' && (
          <ShopTab items={shopItems} points={user.pontos_gamificacao} onEquip={handleEquipTag} equippedTag={equippedTag} />
        )}
      </div>
    </div>
  );
}
