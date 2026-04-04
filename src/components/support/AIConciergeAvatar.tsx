// AI Concierge Avatar — adapted from starline-wayfinder reference
import { motion } from 'framer-motion';
import avatarImg from '@/assets/ai-concierge-avatar.jpg';

interface AIConciergeAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  showGlow?: boolean;
  showOnline?: boolean;
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  hero: 'w-20 h-20',
};

const glowMap = {
  xs: '',
  sm: 'shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]',
  md: 'shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]',
  lg: 'shadow-[0_0_18px_rgba(var(--primary-rgb),0.35)]',
  hero: 'shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)]',
};

export default function AIConciergeAvatar({
  size = 'md',
  showGlow = true,
  showOnline = true,
  className = '',
}: AIConciergeAvatarProps) {
  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <motion.div
        className={`${sizeMap[size]} rounded-full overflow-hidden border-2 border-primary/40 ${showGlow ? glowMap[size] : ''}`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <img
          src={avatarImg}
          alt="Star Line Care AI"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>
      {showOnline && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background">
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
        </span>
      )}
    </div>
  );
}
