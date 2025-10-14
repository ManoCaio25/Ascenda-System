
import React, { useState, useEffect } from 'react';
import { User, Achievement, ShopItem } from '@estagiario/Entities/all';
import { motion } from 'framer-motion';
import { Trophy, ShoppingBag, User as UserIcon, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ProfileTab = ({ user }) => (
  <div className="text-center">
    <img src={user.avatar_url} alt="Avatar" className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-purple-500" />
    <h2 className="text-2xl font-bold">{user.full_name}</h2>
    {user.equipped_tag && (
      <p className="text-lg text-orange-400 font-semibold mb-2">{user.equipped_tag}</p>
    )}
    <p className="text-slate-400">{user.email}</p>
    <p className="text-slate-300 mt-2">{user.area_atuacao}</p>
  </div>
);

const BadgesTab = ({ achievements, onEquip, equippedTag }) => (
  <div>
    <h2 className="text-2xl font-bold text-center mb-6">My Badges</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {achievements.map((badge, i) => (
        <motion.div
          key={badge.id || i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="cosmic-card rounded-xl p-4 text-center flex flex-col items-center justify-between aspect-square"
        >
          <div>
            <div className="text-5xl mb-2">{badge.url_icone}</div>
            <h3 className="font-semibold text-sm">{badge.nome_conquista}</h3>
            <p className="text-xs text-slate-400 mt-1">{badge.descricao}</p>
          </div>
          <button 
            onClick={() => onEquip(`${badge.url_icone} ${badge.nome_conquista}`)}
            className={`mt-3 text-xs font-bold py-1 px-3 rounded-lg w-full flex items-center justify-center gap-1 ${equippedTag === `${badge.url_icone} ${badge.nome_conquista}` ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {equippedTag === `${badge.url_icone} ${badge.nome_conquista}` ? <Check className="w-4 h-4"/> : null}
            Equip
          </button>
        </motion.div>
      ))}
    </div>
  </div>
);

const ShopTab = ({ items, points, onEquip, equippedTag }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Avatar Shop</h2>
      <div className="text-lg font-bold text-orange-400">{points} pts</div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <motion.div
          key={item.id || i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="cosmic-card rounded-xl p-4 text-center flex flex-col justify-between"
        >
          <div>
            <div className="text-5xl mb-3 h-16 flex items-center justify-center">{item.url_imagem}</div>
            <h3 className="font-semibold text-sm">{item.nome_item}</h3>
            <p className="text-xs text-slate-400 mb-2">{item.descricao}</p>
          </div>
          <div className="space-y-2">
            <button className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-1 px-3 rounded-lg text-sm w-full">
              {item.custo_pontos} pts
            </button>
            {item.tipo_item === 'Tag' && (
              <button 
                onClick={() => onEquip(`${item.url_imagem} ${item.nome_item}`)}
                className={`text-xs font-bold py-1 px-3 rounded-lg w-full flex items-center justify-center gap-1 ${equippedTag === `${item.url_imagem} ${item.nome_item}` ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {equippedTag === `${item.url_imagem} ${item.nome_item}` ? <Check className="w-4 h-4"/> : null}
                Equip
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

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
      User.me().then(u => {
        setUser(u);
        setEquippedTag(u.equipped_tag || '');
      }).catch(() => {
        const mockUser = { full_name: 'Alex Cosmos', email: 'alex@ascenda.com', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face', area_atuacao: 'Frontend Development', pontos_gamificacao: 2847, equipped_tag: '🚀 Cosmic Explorer' };
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
    // This simulates updating the user. In a real app, you'd persist this.
    // await User.updateMyUserData({ equipped_tag: tag });
    // For visual feedback, we update the local user state
    setUser(prevUser => ({ ...prevUser, equipped_tag: tag }));
    console.log(`Equipped tag: ${tag}`);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'badges', label: 'My Badges', icon: Trophy },
    { id: 'shop', label: 'Avatar Shop', icon: ShoppingBag },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      <div className="flex justify-center mb-8">
        <div className="cosmic-card rounded-xl p-2 flex items-center space-x-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'bg-purple-600' : 'hover:bg-purple-800/20'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        {activeTab === 'profile' && <ProfileTab user={user} />}
        {activeTab === 'badges' && <BadgesTab achievements={achievements} onEquip={handleEquipTag} equippedTag={equippedTag} />}
        {activeTab === 'shop' && <ShopTab items={shopItems} points={user.pontos_gamificacao} onEquip={handleEquipTag} equippedTag={equippedTag} />}
      </div>
    </div>
  );
}
