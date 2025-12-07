import React, { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Float, Sparkles, useCursor, Ring, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { holds, memories } from '../data';
import { useStore } from '../store';
import { HoldData, Memory } from '../types';

// --- Shared Geometries (Create once to save memory) ---
const BoxGeo = new THREE.BoxGeometry(1, 1, 1);
const SphereGeo = new THREE.SphereGeometry(0.6, 16, 16); // Radius 0.6 matches box scale better
const DodecGeo = new THREE.DodecahedronGeometry(0.6, 0);

// --- Single Hold Component ---
const Hold: React.FC<{ data: HoldData; index: number }> = ({ data, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const clickHold = useStore((state) => state.clickHold);
  const currentIndex = useStore((state) => state.currentHoldIndex);
  const [hovered, setHover] = useState(false);
  
  useCursor(hovered);

  const isCompleted = index < currentIndex;
  const isNext = index === currentIndex;
  const isLocked = index > currentIndex;

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Simple Base Scale
    const baseScale = 0.3;

    // Idle animation for "Next" hold (Breathing)
    if (isNext) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.05;
      meshRef.current.scale.setScalar(baseScale + pulse);
    } else {
      meshRef.current.scale.setScalar(baseScale);
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); 
    console.log(`[Hold] Clicked index ${index} (${data.shape})`);
    clickHold(index);
  };

  // Select Geometry based on data.shape
  let geometry: THREE.BufferGeometry = BoxGeo;
  if (data.shape === 'sphere') geometry = SphereGeo;
  if (data.shape === 'dodecahedron') geometry = DodecGeo;

  // Material Logic
  // Clean, matte look.
  let color = isLocked ? '#64748b' : data.color;
  let emissive = new THREE.Color('#000000');
  let emissiveIntensity = 0;

  if (isCompleted) {
    color = data.color;
    emissive = new THREE.Color(data.color);
    emissiveIntensity = 2.0; // Strong bloom for completed
  } else if (isNext) {
    color = data.color;
    emissive = new THREE.Color(data.color);
    emissiveIntensity = 0.5; // Gentle glow for next
  }

  // Rotation
  const rotation = data.rotation ? new THREE.Euler(...data.rotation) : new THREE.Euler(0,0,0);

  return (
    <group position={data.position} rotation={rotation}>
      
      {/* 1. VISIBLE HOLD MESH */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerDown={handlePointerDown}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={color}
          roughness={0.4} 
          metalness={0.1}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          toneMapped={false}
        />
      </mesh>

      {/* 2. INVISIBLE HIT AREA (Easier clicking) */}
      <mesh 
        visible={false} 
        onPointerDown={handlePointerDown}
        scale={1.4} 
      >
        <sphereGeometry args={[0.5, 12, 12]} />
      </mesh>

      {/* 3. "NEXT" INDICATOR RING (Optional visual aid) */}
      {isNext && (
        <Billboard>
          <Ring args={[0.35, 0.4, 32]}>
            <meshBasicMaterial color={data.color} transparent opacity={0.5} side={THREE.DoubleSide} />
          </Ring>
        </Billboard>
      )}

      {/* 4. COMPLETED SPARKLES */}
      {isCompleted && (
        <Sparkles count={6} scale={1.2} size={4} speed={0.4} opacity={0.8} color={data.color} />
      )}
    </group>
  );
};

// --- Memory Ornament Component ---
const MemoryOrnament: React.FC<{ data: Memory }> = ({ data }) => {
  const openMemory = useStore((state) => state.openMemory);
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  return (
    <group position={data.position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
        <group 
          ref={ref}
          onPointerDown={(e) => { e.stopPropagation(); openMemory(data.id); }}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          {/* String */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.8]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          {/* Gift Box */}
          <mesh rotation={[0.5, 0.5, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={hovered ? "#fff" : "#fbbf24"} roughness={0.2} metalness={0.5} />
          </mesh>
        </group>
      </Float>
    </group>
  );
};

// --- Main Tree Component ---
const Tree: React.FC = () => {
  const isFinished = useStore(state => state.isFinished);
  const starRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (starRef.current) {
      starRef.current.rotation.y += 0.01;
      if (isFinished) {
        const s = 1.5 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
        starRef.current.scale.setScalar(s);
      }
    }
  });

  return (
    <group position={[0, -1, 0]}>
      {/* 
         Tree Layers: raycast null to prevent blocking clicks 
      */}
      <mesh position={[0, 1.5, 0]} raycast={() => null}>
        <coneGeometry args={[1.2, 3, 8]} />
        <meshStandardMaterial color="#064e3b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0]} raycast={() => null}>
        <coneGeometry args={[1.8, 3, 8]} />
        <meshStandardMaterial color="#064e3b" roughness={0.8} />
      </mesh>
      <mesh position={[0, -1.5, 0]} raycast={() => null}>
        <coneGeometry args={[2.4, 3, 8]} />
        <meshStandardMaterial color="#064e3b" roughness={0.8} />
      </mesh>
      
      {/* Trunk */}
      <mesh position={[0, -3.5, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.4, 0.6, 2]} />
        <meshStandardMaterial color="#3f2e18" />
      </mesh>

      {/* Star */}
      <mesh ref={starRef} position={[0, 3.2, 0]} rotation={[0, 0, Math.PI / 5]} raycast={() => null}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#fbbf24" 
          emissiveIntensity={isFinished ? 5 : 1}
          toneMapped={false} 
        />
      </mesh>
      
      {isFinished && (
        <group position={[0, 3.2, 0]}>
          <Sparkles count={80} scale={4} size={5} speed={0.4} opacity={1} color="#fbbf24" />
        </group>
      )}

      {/* Objects */}
      {holds.map((hold, i) => (
        <Hold key={hold.id} data={hold} index={i} />
      ))}

      {memories.map((mem) => (
        <MemoryOrnament key={mem.id} data={mem} />
      ))}
    </group>
  );
};

export default Tree;