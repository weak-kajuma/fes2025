"use client"

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Model from "./Model";
import { Environment } from "@react-three/drei";

export default function Scene() {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-5, -5, -5]} intensity={0.5} />
          <ambientLight intensity={0.8} />
          <Environment preset="city" />
          <Model />
        </Suspense>
      </Canvas>
    </div>
  );
}
