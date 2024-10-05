import { Canvas, useFrame } from "@react-three/fiber";
import { Model } from "./Black_hole";
import { OrbitControls, Center } from "@react-three/drei";
import { useState, useEffect, useMemo } from "react";
import * as THREE from 'three';

// Create Stars component (unchanged)
function Stars({ count = 500 }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 1000; // Random x position
      const y = (Math.random() - 0.5) * 1000; // Random y position
      const z = -Math.random() * 2000; // Random z position (far away)
      positions.set([x, y, z], i * 3); // Set (x, y, z) position
    }
    return positions;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#ffffff" 
        size={2} // Increase the size of the points
        sizeAttenuation 
        transparent 
        opacity={0.7} // Set to make the stars slightly transparent
        depthWrite={false} // Prevents z-fighting and gives a softer look
        emissive="#ffffff" // Set the emissive color to create a glow effect
      />
    </points>
  );
}


// Model component with scale animation
function AnimatedModel() {
  const [scale, setScale] = useState([0.001, 0.001, 0.001]); // Start small

  const targetScale = [0.005, 0.005, 0.005]; // Final scale

  // Use Three.js frame loop to smoothly transition the model's scale
  useFrame((state, delta) => {
    setScale((currentScale) => {
      const newScale = new THREE.Vector3(...currentScale).lerp(new THREE.Vector3(...targetScale), delta * 1.5); // Speed factor: delta * 1.5
      return [newScale.x, newScale.y, newScale.z];
    });
  });

  return (
    <Center>
      <Model 
        scale={scale} // Apply the animated scale
        rotation={[Math.PI, 0, 0]}  // Rotate 180 degrees around X-axis
      />
    </Center>
  );
}

export default function BlackHoleModel() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{
          position: [0, 0, 10],
          fov: 50
        }}
        style={{ background: "#000000" }}  // Solid black background
      >
        {/* Stars in the background */}
        <Stars count={1000} />  {/* You can adjust the count for more or fewer stars */}

        {/* The animated model that zooms in on load */}
        <AnimatedModel />

        {/* Ambient light for subtle overall illumination */}
        <ambientLight intensity={0.05} />

        {/* Key light */}
        <directionalLight
          intensity={0.8}
          position={[5, 5, 5]}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Rim light */}
        <spotLight
          intensity={0.6}
          position={[0, 10, -10]}
          angle={0.5}
          penumbra={1}
        />

        {/* Controls for user interaction */}
        <OrbitControls 
          enableZoom={true}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
