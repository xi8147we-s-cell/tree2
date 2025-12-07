import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const createSnowTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
  }
  return new THREE.CanvasTexture(canvas);
};

const Snow: React.FC = () => {
  const lowPowerMode = useStore(s => s.lowPowerMode);
  // High count snow for atmosphere
  const count = lowPowerMode ? 700 : 2000;
  const meshRef = useRef<THREE.Points>(null);
  const texture = useMemo(() => createSnowTexture(), []);

  // Initialize Snow Data
  const { positions, userData } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const data = new Float32Array(count * 2); // [0]: speed, [1]: driftOffset

    for(let i=0; i<count; i++) {
       // Spread widely
       const r = 12 * Math.sqrt(Math.random());
       const theta = Math.random() * 2 * Math.PI;
       
       pos[i*3] = r * Math.cos(theta); // x
       pos[i*3+1] = (Math.random() - 0.5) * 20; // y: -10 to 10
       pos[i*3+2] = r * Math.sin(theta); // z

       // Varies fall speed and drift phase
       data[i*2] = 0.5 + Math.random() * 1.5; // speed
       data[i*2+1] = Math.random() * 100; // random drift offset
    }
    return { positions: pos, userData: data };
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;

    for(let i=0; i<count; i++) {
        const ix = i*3;
        let x = positions[ix];
        let y = positions[ix+1];
        let z = positions[ix+2];
        
        const speed = userData[i*2];
        const offset = userData[i*2+1];

        // 1. Fall down
        y -= speed * delta * 0.5;

        // 2. Horizontal Drift (Sin wave)
        // Add a tiny bit of movement to x/z based on time
        // Note: we accumulate position, so we should be careful. 
        // Simpler approach for drift: x = initialX + sin(t). But we don't store initialX.
        // Incremental approach: x += cos(t) * factor.
        x += Math.cos(time + offset) * 0.5 * delta;
        z += Math.sin(time * 0.8 + offset) * 0.3 * delta;

        // 3. Reset if below bottom
        if (y < -8) {
            y = 10;
            // Respawn at random x/z to keep distribution even
            const r = 12 * Math.sqrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            x = r * Math.cos(theta);
            z = r * Math.sin(theta);
        }

        positions[ix] = x;
        positions[ix+1] = y;
        positions[ix+2] = z;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      {/* Non-additive (Normal) blending for snow to avoid burning out in light */}
      <pointsMaterial 
        map={texture}
        color="#e0f2fe"
        size={0.12}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.6}
        alphaTest={0.01}
        depthWrite={false}
        blending={THREE.NormalBlending} 
      />
    </points>
  );
};

export default Snow;