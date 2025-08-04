import { useGLTF, Text, MeshTransmissionMaterial } from "@react-three/drei";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

function BackgroundVideo({
  position = [0, 0, -10],
  size = [20, 20],
  opacity = 1,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  darkness = 0.5 // 暗さの度合い（0-1、0が完全に暗い）
}: {
  position?: [number, number, number];
  size?: [number, number];
  opacity?: number;
  rotation?: [number, number, number];
  scale?: [number, number, number];
  darkness?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    // DOM要素としてvideoを作成
    const video = document.createElement('video');
    video.src = "/158384-816637349_small.mp4";
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.style.display = 'none';
    document.body.appendChild(video);

    // VideoTextureを作成
    textureRef.current = new THREE.VideoTexture(video);
    textureRef.current.minFilter = THREE.LinearFilter;
    textureRef.current.magFilter = THREE.LinearFilter;
    textureRef.current.format = THREE.RGBFormat;

    // ビデオを開始
    video.play();

    return () => {
      // クリーンアップ
      if (video) {
        video.pause();
        document.body.removeChild(video);
      }
    };
  }, []);

  useFrame(() => {
    if (textureRef.current && textureRef.current.image) {
      // ビデオが十分なデータを持っている場合のみ更新
      if (textureRef.current.image.readyState === textureRef.current.image.HAVE_ENOUGH_DATA) {
        textureRef.current.needsUpdate = true;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={textureRef.current}
        transparent={opacity < 1}
        opacity={opacity}
        color={new THREE.Color(darkness, darkness, darkness)} // 暗くするための色
      />
    </mesh>
  );
}

function GradientOverlay({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // カスタムシェーダーマテリアルを作成
  const gradientMaterial = new THREE.ShaderMaterial({
    uniforms: {
      scrollProgress: { value: scrollProgress },
      time: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float scrollProgress;
      uniform float time;
      varying vec2 vUv;

      void main() {
        // 初期状態: 下から40%から60%の間でグラデーション
        float initialStart = 0.4;
        float initialEnd = 0.6;

        // スクロールに応じて境界を上に移動
        float scrollOffset = scrollProgress * 1.5; // 最大80%まで移動
        float startY = initialStart + scrollOffset;
        float endY = initialEnd + scrollOffset;

        // 湾曲効果（初期状態で上に凸）
        float curve = sin(vUv.x * 3.14159) * 0.1 * (1.0 - scrollProgress);
        float adjustedY = vUv.y - curve;

        // グラデーション計算
        float alpha = 0.0;
        if (adjustedY < startY) {
          alpha = 1.0; // 上部は完全に不透明（黒）
        } else if (adjustedY > endY) {
          alpha = 0.0; // 下部は完全に透明
        } else {
          // グラデーション部分
          float t = (adjustedY - startY) / (endY - startY);
          alpha = 1.0 - t;
        }

        gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.scrollProgress.value = scrollProgress;
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <planeGeometry args={[50, 20]} />
      <primitive object={gradientMaterial} ref={materialRef} />
    </mesh>
  );
}

function ModelContent() {
  const { nodes, scene } = useGLTF("/taurus.glb");
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [font, setFont] = useState<{ mincho: any; greatVibes: any } | null>(null);



  // モデルが読み込まれていない場合は何も表示しない
  if (!nodes || !scene) {
    return null;
  }

  // LocomotiveScrollのスクロール状況を監視
  useEffect(() => {
    let locomotiveScroll: any = null;
    let intervalId: NodeJS.Timeout | null = null;

    // LocomotiveScrollの初期化を待つ
    const waitForLocomotiveScroll = () => {
      locomotiveScroll = (window as any).locomotiveScroll;

      if (locomotiveScroll) {
        const handleScroll = (e: any) => {
          try {
            // LocomotiveScrollのイベント構造に応じてスクロール位置を取得
            const scrollY = e.detail?.scroll?.y || e.scroll?.y || 0;
            const scrollLimit = e.detail?.scroll?.limit || e.scroll?.limit || document.body.scrollHeight;

            // スクロール進捗を0-1の範囲で計算
            const progress = scrollY / (scrollLimit - window.innerHeight);
            setScrollProgress(Math.max(0, Math.min(1, progress)));
          } catch (error) {
            console.warn('Scroll progress calculation error:', error);
          }
        };

        locomotiveScroll.on('scroll', handleScroll);

        // インターバルをクリア
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }

        return () => {
          if (locomotiveScroll) {
            locomotiveScroll.off('scroll', handleScroll);
          }
        };
      }
    };

    // 初回チェック
    waitForLocomotiveScroll();

    // LocomotiveScrollがまだ初期化されていない場合、ポーリングで待つ
    if (!locomotiveScroll) {
      intervalId = setInterval(waitForLocomotiveScroll, 100);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // 固定された回転設定
  const rotationSpeed = 0.002;
  const rotateX = false;
  const rotateY = true;
  const rotateZ = true;

  useFrame(() => {
    if (groupRef.current) {
      if (rotateX) {
        groupRef.current.rotation.x += rotationSpeed;
      }
      if (rotateY) {
        groupRef.current.rotation.y += rotationSpeed;
      }
      if (rotateZ) {
        groupRef.current.rotation.z += rotationSpeed;
      }
    }
  });

  // スクロールに応じたx座標の計算
  const calculateXPosition = (baseX: number, scrollMultiplier: number = .5) => {
    return baseX + (scrollProgress * scrollMultiplier);
  };

  const calculateOpacity = (scrollProgress: number) => {
    return 1 - scrollProgress * 4;
  };

  // 固定されたマテリアル設定
  const materialProps = {
    thickness: 0.05,
    transmission: 1,
    roughness: 0,
    ior: 1,
    chromaticAberration: 0.2,
    backside: true,
  };

  // シーン内のメッシュを再帰的に処理してMeshTransmissionMaterialを適用
  const applyTransmissionMaterial = (object: THREE.Object3D) => {
    if (object instanceof THREE.Mesh) {
      return (
        <mesh key={object.uuid} geometry={object.geometry}>
          <MeshTransmissionMaterial {...materialProps}/>
        </mesh>
      );
    }

    if (object.children.length > 0) {
      return (
        <group ref={groupRef} key={object.uuid}>
          {object.children.map((child) => applyTransmissionMaterial(child))}
        </group>
      );
    }

    return null;
  };

  // フォントを読み込む関数
  const loadFont = async (fontPath: string) => {
    try {
      const fontLoader = new FontLoader();
      const response = await fetch(fontPath);
      const fontData = await response.json();
      return fontLoader.parse(fontData);
    } catch (error) {
      console.warn('Font loading error:', error);
      return null;
    }
  };

  // フォントを読み込み
  useEffect(() => {
    const loadFonts = async () => {
      const minchoFont = await loadFont('/fonts/ZenOldMincho_Regular.json');
      const greatVibesFont = await loadFont('/fonts/Great Vibes_Regular.json');
      setFont({ mincho: minchoFont, greatVibes: greatVibesFont });
    };

    loadFonts();
  }, []);

  // テキストを生成する関数（フォント指定可能）
  const createText = (text: string, position: [number, number, number], fontSize: number = 2, opacity: number = 1, fontType: 'mincho' | 'greatVibes' = 'mincho') => {
    if (!font || !font[fontType]) return null;

    const shapes = font[fontType].generateShapes(text, fontSize);
    const geometry = new THREE.ShapeGeometry(shapes, 4);
    geometry.computeBoundingBox();
    geometry.center();

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: opacity,
    });

    return (
      <mesh position={position} geometry={geometry} material={material} />
    );
  };

  // 後方互換性のための関数
  const createMinchoText = (text: string, position: [number, number, number], fontSize: number = 2, opacity: number = 1) => {
    return createText(text, position, fontSize, opacity, 'mincho');
  };

  return (
    <group scale={viewport.width / 7}>
      {/* 背景映像をgroupの中に追加 */}
      <BackgroundVideo
        position={[0, 0, -10]}
        size={[64, 32]}
        rotation={[0, 0, 0]}
        scale={[1, 1, 1]}
        darkness={0.03} // 背景映像を暗くするためにdarknessを追加
      />

      {/* テキスト */}
      {createMinchoText("青霞祭", [calculateXPosition(0, 10), 1.5, -3], 1, calculateOpacity(scrollProgress))}
      {createText("Sparkle.", [calculateXPosition(0, -10), -1, -3], 2, calculateOpacity(scrollProgress), 'greatVibes')}

      {/* <GradientOverlay scrollProgress={scrollProgress} /> */}

      {/* <mesh position={[0, 0, -5]}>
        <planeGeometry args={[50, 20]} />
        <meshBasicMaterial color={0x000000} opacity={0.5} />
      </mesh> */}

      {applyTransmissionMaterial(scene)}
    </group>
  );
}

export default function Model() {
  return (
    <Suspense fallback={null}>
      <ModelContent />
    </Suspense>
  );
}