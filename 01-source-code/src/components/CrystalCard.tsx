import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CrystalCardProps {
  title: string;
  description: string;
  glowColor: 'blue' | 'purple' | 'green' | 'amber';
  icon: React.ReactNode;
  delay?: number;
  onClick?: () => void;
}

const glowColors = {
  blue: {
    border: 'rgba(37, 99, 235, 0.3)',
    shadow: 'rgba(37, 99, 235, 0.4)',
    bg: 'rgba(37, 99, 235, 0.05)',
    gradient: 'from-blue-500/20 to-blue-600/5',
  },
  purple: {
    border: 'rgba(124, 58, 237, 0.3)',
    shadow: 'rgba(124, 58, 237, 0.4)',
    bg: 'rgba(124, 58, 237, 0.05)',
    gradient: 'from-purple-500/20 to-purple-600/5',
  },
  green: {
    border: 'rgba(5, 150, 105, 0.3)',
    shadow: 'rgba(5, 150, 105, 0.4)',
    bg: 'rgba(5, 150, 105, 0.05)',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
  },
  amber: {
    border: 'rgba(217, 119, 6, 0.3)',
    shadow: 'rgba(217, 119, 6, 0.4)',
    bg: 'rgba(217, 119, 6, 0.05)',
    gradient: 'from-amber-500/20 to-amber-600/5',
  },
};

export default function CrystalCard({
  title,
  description,
  glowColor,
  icon,
  delay = 0,
  onClick,
}: CrystalCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const colors = glowColors[glowColor];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.05, y: -8 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      onClick={onClick}
      className="relative cursor-pointer group"
      style={{
        perspective: '1000px',
      }}
    >
      <motion.div
        className="relative overflow-hidden rounded-3xl p-8 min-h-[280px] flex flex-col justify-between"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${colors.bg}, rgba(255,255,255,0.02))`,
          border: `1px solid ${isHovered ? colors.shadow : colors.border}`,
          boxShadow: isHovered
            ? `0 0 40px ${colors.shadow}, 0 0 80px ${colors.shadow}40, inset 0 0 40px ${colors.bg}`
            : `0 0 20px ${colors.shadow}20, inset 0 0 20px ${colors.bg}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transform: `rotateX(${(mousePos.y - 0.5) * -10}deg) rotateY(${(mousePos.x - 0.5) * 10}deg)`,
          transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
        }}
      >
        {/* Inner glow orb */}
        <div
          className="absolute w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
          style={{
            background: colors.shadow,
            left: `${mousePos.x * 100}%`,
            top: `${mousePos.y * 100}%`,
            transform: 'translate(-50%, -50%)',
            opacity: isHovered ? 0.5 : 0.2,
          }}
        />

        {/* Top gradient band */}
        <div
          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${glowColor === 'blue' ? 'blue' : glowColor === 'purple' ? 'purple' : glowColor === 'green' ? 'emerald' : 'amber'}-400/50 to-transparent`}
        />

        {/* Icon */}
        <div
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 0 20px ${colors.shadow}30`,
          }}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="relative">
          <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Bottom shimmer line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.shadow}, transparent)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s linear infinite',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
