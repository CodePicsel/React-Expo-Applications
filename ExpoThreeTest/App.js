import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { Accelerometer } from 'expo-sensors';
import * as THREE from 'three';

// --- Box that falls under gravity and collides with y=0 plane ---
function FallingBox({ position }) {
  const mesh = useRef();
  const velocity = useRef(new THREE.Vector3(0, 0, 0));

  // On each render frame...
  useFrame((_, delta) => {
    // Apply gravity
    velocity.current.addScaledVector(gravity.current, delta);
    // Update position
    mesh.current.position.addScaledVector(velocity.current, delta);

    // Simple ground collision
    if (mesh.current.position.y < 0.5) {
      mesh.current.position.y = 0.5;
      velocity.current.y = 0;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="tomato" />
    </mesh>
  );
}

// --- Shared gravity vector updated from the accelerometer ---
const gravity = {
  current: new THREE.Vector3(0, -9.81, 0),
};

function GravityUpdater() {
  useEffect(() => {
    Accelerometer.setUpdateInterval(50);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      // Map device axes → world axes (tweak signs/axes to your liking)
      gravity.current.set(x * 9.81, -y * 9.81, z * 9.81);
    });
    return () => sub.remove();
  }, []);
  return null; // This component only updates gravity.current
}

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <Canvas>
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        {/* Gravity sensor */}
        <GravityUpdater />

        {/* A bunch of falling boxes */}
        {Array.from({ length: 5 }).map((_, i) => (
          <FallingBox
            key={i}
            position={[(Math.random() - 0.5) * 4, 5 + i * 2, (Math.random() - 0.5) * 4]}
          />
        ))}

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="lightgrey" />
        </mesh>
      </Canvas>
    </View>
  );
}
