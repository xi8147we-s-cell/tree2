import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

// Generate a soft glow texture programmatically
const createParticleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
  }
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
};

const InteractiveParticles: React.FC = () => {
  const { viewport, camera, pointer } = useThree();
  const lowPowerMode = useStore((s) => s.lowPowerMode);
  const isFinished = useStore((s) => s.isFinished);
  const burstData = useStore((s) => s.burstData);

  // --- Constants & Refs ---
  // Reduced counts for Gold Motes (Sparse, interactive, magical)
  const count = lowPowerMode ? 120 : 350; 
  const burstCount = lowPowerMode ? 40 : 120;
  
  const meshRef = useRef<THREE.Points>(null);
  const burstRef = useRef<THREE.Points>(null);
  const texture = useMemo(() => createParticleTexture(), []);
  
  // Track game finish animation state
  const finishAnimRef = useRef({ time: 0, active: false });

  // --- Ambient Particles Data ---
  const { positions, velocities, homes, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const hom = new Float32Array(count * 3);
    const siz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Random distribution around the tree (roughly cone/cylinder shape)
      const r = 2 + Math.random() * 3; // radius
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 10; // height spread
      
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      hom[i * 3] = x;
      hom[i * 3 + 1] = y;
      hom[i * 3 + 2] = z;

      siz[i] = Math.random(); // Varied sizes (used in shader/scale)
    }
    return { positions: pos, velocities: vel, homes: hom, sizes: siz };
  }, [count]);

  // --- Burst Particles Data (Object Pool) ---
  const { burstPos, burstVel, burstLife } = useMemo(() => {
    // Pool size = roughly 3 simultaneous bursts max
    const poolSize = burstCount * 3;
    const pos = new Float32Array(poolSize * 3);
    const vel = new Float32Array(poolSize * 3);
    const life = new Float32Array(poolSize); // 0 = dead, >0 = alive (value is alpha/time)

    // Move off-screen initially
    for(let i=0; i<poolSize*3; i++) pos[i] = 9999; 

    return { burstPos: pos, burstVel: vel, burstLife: life };
  }, [burstCount]);

  // --- Handle Burst Trigger ---
  const lastBurstId = useRef<number>(0);
  useEffect(() => {
    if (burstData && burstData.id !== lastBurstId.current) {
      lastBurstId.current = burstData.id;
      
      // Find dead particles in pool and activate them
      let spawned = 0;
      for (let i = 0; i < burstLife.length; i++) {
        if (burstLife[i] <= 0 && spawned < burstCount) {
          // Spawn
          spawned++;
          burstLife[i] = 1.0; // Full life

          // Position: Burst center
          burstPos[i * 3] = burstData.position[0];
          burstPos[i * 3 + 1] = burstData.position[1];
          burstPos[i * 3 + 2] = burstData.position[2];

          // Velocity: Explosion
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const speed = 0.1 + Math.random() * 0.15; // Explosive speed

          burstVel[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
          burstVel[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
          burstVel[i * 3 + 2] = speed * Math.cos(phi);
        }
      }
    }
  }, [burstData, burstCount, burstLife, burstPos, burstVel]);

  // --- Animation Loop ---
  useFrame((state, delta) => {
    // 1. Calculate Interaction Point (Mouse on Z=0 Plane)
    // Simple raycast logic for performance
    const vec = new THREE.Vector3(pointer.x, pointer.y, 0.5);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const mousePos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    // Limits
    const repulsionRadius = 1.5;
    const forceStrength = 5.0 * delta;
    const springStrength = 2.0 * delta;
    const damping = 0.95;

    // Finale State Logic
    let attractMode = false;
    let explodeMode = false;
    const starPos = new THREE.Vector3(0, 3.2, 0);

    if (isFinished) {
      if (!finishAnimRef.current.active) {
        finishAnimRef.current.active = true;
        finishAnimRef.current.time = 0;
      }
      finishAnimRef.current.time += delta;
      
      // Sequence: 0-0.8s Attract, 0.8s+ Explode/Float
      if (finishAnimRef.current.time < 0.8) {
        attractMode = true;
      } else if (finishAnimRef.current.time < 2.0) {
        explodeMode = true;
      }
    } else {
        finishAnimRef.current.active = false;
    }

    // --- Update Ambient Particles ---
    if (meshRef.current) {
      const posAttr = meshRef.current.geometry.attributes.position;
      
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        let px = positions[ix];
        let py = positions[iy];
        let pz = positions[iz];

        let vx = velocities[ix];
        let vy = velocities[iy];
        let vz = velocities[iz];

        // Target: Normal Home or Star?
        let tx = homes[ix];
        let ty = homes[iy];
        let tz = homes[iz];

        if (attractMode) {
          tx = starPos.x;
          ty = starPos.y;
          tz = starPos.z;
          // Stronger pull
          vx += (tx - px) * 2.0 * delta;
          vy += (ty - py) * 2.0 * delta;
          vz += (tz - pz) * 2.0 * delta;
        } else if (explodeMode) {
           // Gentle push out from center
           vx += (px - 0) * 0.5 * delta;
           vy += (py - 2) * 0.5 * delta;
           vz += (pz - 0) * 0.5 * delta;
        } else {
          // Normal Spring back to home
          vx += (tx - px) * springStrength;
          vy += (ty - py) * springStrength;
          vz += (tz - pz) * springStrength;

          // Mouse Repulsion
          const dx = px - mousePos.x;
          const dy = py - mousePos.y;
          const dz = pz - mousePos.z; // usually z diff is large, but check anyway
          const d2 = dx*dx + dy*dy + dz*dz;

          if (d2 < repulsionRadius * repulsionRadius) {
            const d = Math.sqrt(d2);
            const force = (repulsionRadius - d) / repulsionRadius; // 1 at center, 0 at edge
            vx += (dx / d) * force * forceStrength;
            vy += (dy / d) * force * forceStrength;
            vz += (dz / d) * force * forceStrength;
          }
        }

        // Apply Damping & Move
        vx *= damping;
        vy *= damping;
        vz *= damping;

        px += vx;
        py += vy;
        pz += vz;

        // Save State
        positions[ix] = px;
        positions[iy] = py;
        positions[iz] = pz;
        velocities[ix] = vx;
        velocities[iy] = vy;
        velocities[iz] = vz;
      }

      posAttr.needsUpdate = true;
    }

    // --- Update Burst Particles ---
    if (burstRef.current) {
        const bPosAttr = burstRef.current.geometry.attributes.position;
        
        let activeBursts = false;

        for (let i = 0; i < burstLife.length; i++) {
            if (burstLife[i] > 0) {
                activeBursts = true;
                const ix = i * 3;
                
                // Gravity / Drag
                burstVel[ix+1] -= 0.2 * delta; // Gravity
                burstVel[ix] *= 0.98;
                burstVel[ix+1] *= 0.98;
                burstVel[ix+2] *= 0.98;

                // Move
                burstPos[ix] += burstVel[ix];
                burstPos[ix+1] += burstVel[ix+1];
                burstPos[ix+2] += burstVel[ix+2];

                // Decay
                burstLife[i] -= delta * 1.5; // Life duration approx 0.6s

                if (burstLife[i] <= 0) {
                    burstPos[ix] = 9999; // Hide
                }
            }
        }
        
        if (activeBursts) {
            bPosAttr.needsUpdate = true;
        }
    }
  });

  return (
    <>
      {/* Ambient Field */}
      <points ref={meshRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={texture}
          color="#fbbf24"
          size={0.15}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.6}
          alphaTest={0.01}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Burst Field */}
      <points ref={burstRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
             attach="attributes-position"
             count={burstPos.length / 3}
             array={burstPos}
             itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={texture}
          color="#ffeb3b" // Brighter gold
          size={0.25}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
};

export default InteractiveParticles;