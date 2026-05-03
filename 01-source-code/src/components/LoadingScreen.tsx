import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 800);
          }, 300);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: '#02040a' }}
        >
          {/* Rotating crystal polyhedron */}
          <motion.div
            className="relative w-24 h-24 mb-8"
            animate={{
              rotateY: 360,
              rotateX: [0, 15, -15, 0],
            }}
            transition={{
              rotateY: { duration: 4, repeat: Infinity, ease: 'linear' },
              rotateX: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ perspective: 600 }}
          >
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(37,99,235,0.4), rgba(124,58,237,0.4))',
                boxShadow: '0 0 60px rgba(37,99,235,0.4), 0 0 120px rgba(124,58,237,0.2), inset 0 0 40px rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transformStyle: 'preserve-3d',
              }}
            />
            <div
              className="absolute inset-2 rounded-xl"
              style={{
                background: 'linear-gradient(225deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
                boxShadow: 'inset 0 0 30px rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                transform: 'translateZ(10px)',
              }}
            />
            {/* Inner glow */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'radial-gradient(circle at 40% 40%, rgba(100,150,255,0.3), transparent 70%)',
              }}
            />
          </motion.div>

          {/* Brand text */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gradient-hero mb-2"
          >
            极光职途
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-slate-400 mb-8"
          >
            AI 驱动的职业加速引擎
          </motion.p>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 0 10px rgba(59,130,246,0.5)',
              }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Particle burst on complete */}
          {progress >= 100 && (
            <>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: i % 2 === 0 ? '#3b82f6' : '#8b5cf6',
                    left: '50%',
                    top: '45%',
                  }}
                  animate={{
                    x: Math.cos((i / 12) * Math.PI * 2) * 150,
                    y: Math.sin((i / 12) * Math.PI * 2) * 150,
                    opacity: [1, 0],
                    scale: [1, 0],
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
