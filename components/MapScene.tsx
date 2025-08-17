
// "use client";

// import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
// import { OrbitControls, useGLTF } from "@react-three/drei";
// import { useRef, useState } from "react";
// import * as THREE from "three";

// const Model = () => {
//   const gltf = useGLTF("/models/test.glb");
//   const [targetObjectName] = useState("desk"); // 例: 対象のオブジェクト名
//   const targetRef = useRef<THREE.Object3D | null>(null);

//   const handleClick = (e: ThreeEvent<PointerEvent>) => {
//     const clicked = e.object;
//     if (clicked.name === targetObjectName) {
//       // 任意の位置へ移動
//       clicked.position.set(1000, 0, 0); // ← 好きな座標へ
//     }
//   }

//   gltf.scene.traverse((child) => {
//     if (child.name === targetObjectName) {
//       targetRef.current = child;
//     }
//   });

//   return (
//     <primitive object={gltf.scene} onPointerDown={handleClick} />
//   );
// };

// export const ModelView = () => {
//   return (
//     <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
//       <ambientLight />
//       <directionalLight position={[10, 10, 10]} />
//       <Model />
//       <OrbitControls />
//     </Canvas>
//   );
// };



// components/AnimatedModel.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Object3D } from "three";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";

// クリック対象オブジェクト名と対応するアニメーション名のマッピング
const TARGET_OBJECT_TO_ANIMATION_MAP: { [objectName: string]: string } = {
  "F1": "transform_p_1",
  "F2": "transform_p_2",
  "F3": "transform_p_3",
  "F4": "transform_p_4",
  // 必要に応じて他のオブジェクトとアニメーションのペアを追加
};

const CLICK_THRESHOLD_MS = 200;

interface AnimationControlState {
  isPlayingForward: boolean; // true: 開始位置にあり次に順再生 / false: 終了位置にあり次に逆再生
  hasInteracted: boolean;    // 一度でも操作されたか (ボタンリセット含む)
}

interface AnimatedModelProps {
  resetAnimationTrigger: { name: string; timestamp: number } | null;
}

export function AnimatedModel({ resetAnimationTrigger }: AnimatedModelProps) {
  const gltf = useGLTF("/models/finish.glb"); // モデルパスを確認
  const group = useRef<Object3D>(null);
  const { actions } = useAnimations(gltf.animations, group);
  const activeResetTimeoutsRef = useRef<{ [key: string]: NodeJS.Timeout | null }>({});

  const [animationStates, setAnimationStates] = useState<{ [animationName: string]: AnimationControlState }>(() => {
    const initialState: { [animationName: string]: AnimationControlState } = {};
    Object.values(TARGET_OBJECT_TO_ANIMATION_MAP).forEach(animName => {
      initialState[animName] = { isPlayingForward: true, hasInteracted: false };
    });
    return initialState;
  });

  const pointerDownInfoRef = useRef<{
    time: number;
    objectName: string;
    animationName: string;
  } | null>(null);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    const clickedObjectName = event.object.name;
    const animationName = TARGET_OBJECT_TO_ANIMATION_MAP[clickedObjectName];

    if (animationName) {
      event.stopPropagation();
      pointerDownInfoRef.current = {
        time: Date.now(),
        objectName: clickedObjectName,
        animationName: animationName,
      };
    } else {
      pointerDownInfoRef.current = null;
    }
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    const pdi = pointerDownInfoRef.current;
    const upObjectName = event.object.name;

    if (pdi && upObjectName === pdi.objectName) {
      event.stopPropagation();
      const pressDuration = Date.now() - pdi.time;

      if (pressDuration < CLICK_THRESHOLD_MS) {
        const animName = pdi.animationName;
        const action = actions[animName];
        if (!action) return;

        const currentState = animationStates[animName];
        const playForwardActual = currentState.isPlayingForward;

        Object.values(actions).forEach(otherAction => {
          if (otherAction && otherAction !== action && otherAction.isRunning()) {
            otherAction.fadeOut(0.2).stop();
          }
        });

        action.stop().reset();
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;

        if (playForwardActual) {
          action.timeScale = 1;
          action.fadeIn(0.2).play();
        } else {
          action.timeScale = -1;
          action.time = action.getClip().duration;
          action.weight = 1;
          action.play();
        }

        setAnimationStates(prev => ({
          ...prev,
          [animName]: {
            hasInteracted: true,
            isPlayingForward: !playForwardActual,
          },
        }));
      }
    }
    pointerDownInfoRef.current = null;
  };

  useEffect(() => {
    if (!actions || !resetAnimationTrigger) return;

    const animNameToResetTarget = resetAnimationTrigger.name; // ボタンで指定された、再生前に戻したいアニメーション

    // 1. ボタンで指定されたアニメーションの処理
    const targetAction = actions[animNameToResetTarget];
    const targetState = animationStates[animNameToResetTarget];

    if (targetAction && targetState) {
      if (activeResetTimeoutsRef.current[animNameToResetTarget]) {
        clearTimeout(activeResetTimeoutsRef.current[animNameToResetTarget]!);
        activeResetTimeoutsRef.current[animNameToResetTarget] = null;
      }

      if (targetState.hasInteracted && !targetState.isPlayingForward) { // 再生後の位置にいる場合
        targetAction.stop().reset();
        targetAction.timeScale = -1;
        targetAction.time = targetAction.getClip().duration;
        targetAction.setLoop(THREE.LoopOnce, 1);
        targetAction.clampWhenFinished = true;
        targetAction.weight = 1;
        targetAction.play();

        const duration = targetAction.getClip().duration * 1000;
        activeResetTimeoutsRef.current[animNameToResetTarget] = setTimeout(() => {
          setAnimationStates(prev => ({
            ...prev,
            [animNameToResetTarget]: { isPlayingForward: true, hasInteracted: false },
          }));
          activeResetTimeoutsRef.current[animNameToResetTarget] = null;
        }, duration + 50);
      } else { // 既に再生前の位置、または再生前とみなせる状態
        targetAction.stop().reset();
        if (targetState.hasInteracted) { // hasInteractedがtrueならfalseに戻す
            setAnimationStates(prev => ({
                ...prev,
                [animNameToResetTarget]: { isPlayingForward: true, hasInteracted: false },
            }));
        }
      }
    }

    // 2. それ以外のアニメーションの処理
    Object.values(TARGET_OBJECT_TO_ANIMATION_MAP).forEach(otherAnimName => {
      if (otherAnimName === animNameToResetTarget) return; // ターゲット自身はスキップ

      const otherAction = actions[otherAnimName];
      const otherState = animationStates[otherAnimName];

      if (otherAction && otherState) {
        if (activeResetTimeoutsRef.current[otherAnimName]) {
          clearTimeout(activeResetTimeoutsRef.current[otherAnimName]!);
          activeResetTimeoutsRef.current[otherAnimName] = null;
        }

        if (!otherState.hasInteracted || otherState.isPlayingForward) { // 再生前の位置にいる場合
          otherAction.stop().reset();
          otherAction.timeScale = 1;
          otherAction.setLoop(THREE.LoopOnce, 1);
          otherAction.clampWhenFinished = true;
          otherAction.fadeIn(0.2).play();

          const duration = otherAction.getClip().duration * 1000;
          activeResetTimeoutsRef.current[otherAnimName] = setTimeout(() => {
            setAnimationStates(prev => ({
              ...prev,
              [otherAnimName]: { isPlayingForward: false, hasInteracted: true },
            }));
            activeResetTimeoutsRef.current[otherAnimName] = null;
          }, duration + 50);
        }
        // 既に再生後の位置にいる場合は何もしない
      }
    });

    return () => {
      Object.values(activeResetTimeoutsRef.current).forEach(timeoutId => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
  }, [resetAnimationTrigger, actions, animationStates]);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const initialStates: { [key: string]: AnimationControlState } = {};
      Object.values(TARGET_OBJECT_TO_ANIMATION_MAP).forEach(animName => {
        initialStates[animName] = { isPlayingForward: true, hasInteracted: false };
        if (actions[animName]) {
          actions[animName].reset().stop();
        }
      });
      setAnimationStates(initialStates);
    }
    return () => {
      Object.values(activeResetTimeoutsRef.current).forEach(timeoutId => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  return (
    <group
      ref={group}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        pointerDownInfoRef.current = null;
      }}
    >
      <primitive object={gltf.scene} />
    </group>
  );
}