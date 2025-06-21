"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AnimatedModel } from "../../components/MapScene";

// ボタンに対応するアニメーション名を定義
const BUTTON_TARGETS: { [buttonLabel: string]: string } = {
  "1F": "transform_p_1",
  "2F": "transform_p_2",
  "3F": "transform_p_3",
  "4F": "transform_p_4",
};

export default function Map() {
  const [resetTrigger, setResetTrigger] = useState<{ name: string; timestamp: number } | null>(null);

  const handleResetButtonClick = (animationName: string) => {
    setResetTrigger({ name: animationName, timestamp: Date.now() });
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{
          position: [-17.3065, 5.39917, -10.1376], // YをZに、Zを-Yに変換
          fov: 50,
        }}
      >
        <ambientLight />
        <directionalLight position={[5, 10, 5]} />

        {/* あなたのGLBモデル（アニメーション付き） */}
        <AnimatedModel resetAnimationTrigger={resetTrigger} />

        {/* 注視点をオブジェクト中心に合わせたいなら target を調整 */}
        <OrbitControls target={[1.3127, 0, -2.1926]} /> {/* モデルが原点近くならこれでOK */}
      </Canvas>
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 10, display: "flex", flexDirection: "column-reverse", gap: "10px" }}>
        {Object.entries(BUTTON_TARGETS).map(([label, animName]) => (
          <button
            key={label}
            onClick={() => handleResetButtonClick(animName)}
            style={{ padding: "10px", cursor: "pointer" }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}