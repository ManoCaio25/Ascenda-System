import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User, Achievement, ShopItem } from '@estagiario/Entities/all';
import { motion } from 'framer-motion';
import { Trophy, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@estagiario/Components/ui/button';
import { Progress } from '@estagiario/Components/ui/progress';
import { useI18n } from '@estagiario/Components/utils/i18n';

const buildRarityMap = (t) => ({
  legendary: { label: t('rarityLegendary'), badge: 'bg-gradient-to-r from-purple-500 to-orange-400 text-white', accent: 'text-orange-300' },
  epic: { label: t('rarityEpic'), badge: 'bg-purple-500/20 text-purple-200 border border-purple-500/40', accent: 'text-purple-200' },
  rare: { label: t('rarityRare'), badge: 'bg-blue-500/20 text-blue-200 border border-blue-500/40', accent: 'text-blue-200' },
  uncommon: { label: t('rarityUncommon'), badge: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40', accent: 'text-emerald-200' },
  common: { label: t('rarityCommon'), badge: 'bg-slate-700/20 text-slate-200 border border-slate-500/40', accent: 'text-slate-200' },
});

const ProfileTab = ({ user, onAvatarUpload, isUploading, t }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const [file] = event.target.files || [];
    if (file) {
      onAvatarUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="relative w-32 h-32 mx-auto">
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="w-32 h-32 rounded-full mx-auto border-4 border-purple-500 object-cover"
          />
          <span className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 bg-purple-600/90 text-white text-xs font-semibold px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3" /> {user.pontos_gamificacao || 0} {t('pointsSuffix')}
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">{user.full_name}</h2>
          {user.equipped_tag && (
            <p className="text-lg text-orange-400 font-semibold">{user.equipped_tag}</p>
          )}
          <p className="text-text-secondary text-sm">{user.email}</p>
          <p className="text-text-secondary text-sm">{user.area_atuacao}</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? t('uploading') : t('changePhoto')}
          </Button>
          <p className="text-xs text-text-secondary">{t('uploadHint')}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{
          label: t('statsPoints'),
          value: user.pontos_gamificacao || 0,
          accent: 'text-orange-400',
        }, {
          label: t('statsBadges'),
          value: user.badge_count || 0,
          accent: 'text-purple-400',
        }, {
          label: t('statsActiveMissions'),
          value: user.active_missions || 2,
          accent: 'text-blue-400',
        }, {
          label: t('statsMentorSyncs'),
          value: user.mentor_syncs || 5,
          accent: 'text-emerald-400',
        }].map((stat) => (
          <div key={stat.label} className="cosmic-card rounded-xl p-4 text-center border border-purple-500/20">
            <p className="text-xs uppercase tracking-wide text-text-secondary">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.accent}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const BadgesTab = ({ achievements, onEquip, equippedTag, t }) => {
  const badgeRarity = useMemo(() => buildRarityMap(t), [t]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-text-primary">{t('myBadges')}</h2>
        <p className="text-text-secondary text-sm">{t('profileBadgesSubtitle')}</p>
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
                  <h3 className="font-semibold text-lg text-text-primary">{badge.nome_conquista}</h3>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">{badge.descricao}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                    <span>{t('progressLabel')}</span>
                    <span className={rarity.accent}>{badge.progresso}%</span>
                  </div>
                  <Progress value={badge.progresso} className="h-2" />
                </div>
              </div>

              <Button
                onClick={() => onEquip(`${badge.url_icone} ${badge.nome_conquista}`)}
                variant={equipped ? 'gradient' : 'outline'}
                className="mt-4"
              >
                {equipped ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> {t('equipped')}
                  </>
                ) : (
                  t('equip')
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const ShopTab = ({ items, points, onEquip, equippedTag, t }) => {
  const badgeRarity = useMemo(() => buildRarityMap(t), [t]);
  const [filter, setFilter] = useState('all');

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'equippable') return items.filter((item) => item.tipo_item === 'Tag');
    return items.filter((item) => item.raridade === filter);
  }, [items, filter]);

  const filterOptions = [
    { id: 'all', label: t('shopFilterAll') },
    { id: 'equippable', label: t('shopFilterEquippable') },
    { id: 'legendary', label: t('rarityLegendary') },
    { id: 'epic', label: t('rarityEpic') },
    { id: 'rare', label: t('rarityRare') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{t('avatarShop')}</h2>
          <p className="text-sm text-text-secondary">{t('profileShopSubtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-lg font-bold text-orange-400">{points} {t('pointsSuffix')}</div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.id}
                size="sm"
                variant={filter === option.id ? 'gradient' : 'outline'}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
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
                  <h3 className="font-semibold text-lg text-text-primary">{item.nome_item}</h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{item.descricao}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{item.tipo_item}</span>
                  <span className={item.estoque === 'limited' ? 'text-orange-400' : 'text-emerald-400'}>
                    {item.estoque === 'limited' ? t('shopLimited') : t('shopAvailable')}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button variant="outline" className="w-full border-purple-500/50 text-purple-200 hover:bg-purple-500/10">
                  {item.custo_pontos} {t('pointsSuffix')}
                </Button>
                {item.tipo_item === 'Tag' && (
                  <Button
                    onClick={() => onEquip(`${item.url_imagem} ${item.nome_item}`)}
                    variant={equipped ? 'gradient' : 'outline'}
                    className="w-full"
                  >
                    {equipped ? (
                      <>
                        <Check className="w-4 h-4 mr-2" /> {t('equipped')}
                      </>
                    ) : (
                      t('equip')
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

export default function Profile() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab');
  const { t } = useI18n();

  const [user, setUser] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [activeTab, setActiveTab] = useState(tab || 'profile');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setActiveTab(tab || 'profile');
  }, [tab]);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await User.me().catch(() => ({
        id: 'intern-1',
        full_name: 'Caio Menezes',
        email: 'caio.alvarenga@ascenda.com',
        pontos_gamificacao: 2847,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
        area_atuacao: 'Frontend Development',
        equipped_tag: '🚀 Cosmic Explorer'
      }));
      setUser(currentUser);

      const [achievementsData, shopData] = await Promise.all([
        Achievement.list('-created_date').catch(() => []),
        ShopItem.list('-created_date').catch(() => []),
      ]);
      setAchievements(achievementsData);
      setShopItems(shopData);
    };
    fetchData();
  }, []);

  const handleEquipTag = async (tag) => {
    if (!user) return;
    const updated = await User.update(user.id, { equipped_tag: tag }).catch(() => ({ ...user, equipped_tag: tag }));
    setUser(updated || { ...user, equipped_tag: tag });
  };

  const handleAvatarUpload = async (file) => {
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const avatarUrl = reader.result;
        const updated = await User.update(user.id, { avatar_url: avatarUrl }).catch(() => ({ ...user, avatar_url: avatarUrl }));
        setUser(updated || { ...user, avatar_url: avatarUrl });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Avatar upload failed', error);
      setIsUploading(false);
    }
  };

  if (!user) {
    return <div className="text-center p-10 text-text-secondary">{t('loading')}</div>;
  }

  const tabs = [
    { id: 'profile', label: t('profile') },
    { id: 'badges', label: t('myBadges'), icon: Trophy },
    { id: 'shop', label: t('avatarShop'), icon: ShoppingBag },
  ];

  return (
    <div className="p-6 space-y-8 text-text-primary">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap gap-4 border-b border-default pb-4">
          {tabs.map((tabItem) => (
            <Button
              key={tabItem.id}
              variant={activeTab === tabItem.id ? 'gradient' : 'ghost'}
              onClick={() => setActiveTab(tabItem.id)}
              className="flex items-center gap-2"
            >
              {tabItem.icon && <tabItem.icon className="w-4 h-4" />}
              {tabItem.label}
            </Button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <ProfileTab user={user} onAvatarUpload={handleAvatarUpload} isUploading={isUploading} t={t} />
        )}

        {activeTab === 'badges' && (
          <BadgesTab achievements={achievements} onEquip={handleEquipTag} equippedTag={user.equipped_tag} t={t} />
        )}

        {activeTab === 'shop' && (
          <ShopTab items={shopItems} points={user.pontos_gamificacao || 0} onEquip={handleEquipTag} equippedTag={user.equipped_tag} t={t} />
        )}
      </div>
    </div>
  );
}
