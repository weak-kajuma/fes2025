// app/components/OpeningAnimation.tsx
"use client";

import { motion } from "framer-motion";

export default function OpeningAnimation({ onFinish }: { onFinish: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 2 }}
      onAnimationComplete={onFinish}
      className="fixed inset-0 bg-black text-white flex items-center justify-center z-50"
    >
      <h1 className="text-4xl">ようこそ！</h1>
    </motion.div>
  );
}
