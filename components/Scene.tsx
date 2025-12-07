import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Cloud } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { useStore } from '../store';
import Tree from './Tree';
import InteractiveParticles from './InteractiveParticles';
import Snow from './Snow';

const Scene: React.FC = () => {
  const lowPowerMode = useStore((state) => state.lowPowerMode);

  return (
    <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-b from-climb-dark to-climb-green">
      <Canvas
        dpr={lowPowerMode ? [1, 1] : [1, 1.5]}
        camera={{ position: [0, 0, 9], fov: 45 }}
        gl={{ antialias: false, toneMappingExposure: 0.9 }}
      >
        {/* Environment */}
        <ambientLight intensity={0.2} color="#ccfbf1" />
        <pointLight position={[5, 5, 5]} intensity={1} color="#fbbf24" distance={20} />
        <pointLight position={[-5, 2, -5]} intensity={0.5} color="#3b82f6" distance={20} />
        <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={1} castShadow />

        <Stars radius={100} depth={50} count={lowPowerMode ? 500 : 2000} factor={4} saturation={0} fade speed={1} />
        
        {/* Soft fog for atmosphere */}
        {!lowPowerMode && <Cloud opacity={0.3} speed={0.2} bounds={[10, 2, 5]} segments={10} position={[0, -2, -5]} />}
        
        {/* Particle Layers */}
        <Snow />
        <InteractiveParticles />

        <Tree />

        {/* Controls */}
        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
          minDistance={5}
          maxDistance={14}
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />

        {/* Post Processing */}
        <EffectComposer enableNormalPass={false} enabled={!lowPowerMode}>
            <Bloom 
                luminanceThreshold={1.2} 
                mipmapBlur 
                intensity={1.5} 
                radius={0.4} 
            />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default Scene;