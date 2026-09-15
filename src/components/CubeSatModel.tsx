import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Edges } from '@react-three/drei';
import * as THREE from 'three';

interface CubeSatModelProps {
  pitch: number;
  roll: number;
  yaw: number;
}

export function CubeSatModel({ pitch, roll, yaw }: CubeSatModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Target quaternion based on IMU data
  const targetQuaternion = new THREE.Quaternion();

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Convert degrees to radians
      const pitchRad = THREE.MathUtils.degToRad(pitch);
      const rollRad = THREE.MathUtils.degToRad(roll);
      const yawRad = THREE.MathUtils.degToRad(yaw);

      // Set target rotation (Euler order is important, depending on IMU mapping)
      const euler = new THREE.Euler(pitchRad, yawRad, rollRad, 'YXZ');
      targetQuaternion.setFromEuler(euler);

      // Smoothly interpolate current rotation to target rotation
      // 2.0 is the interpolation factor (higher = faster snapping, lower = smoother)
      groupRef.current.quaternion.slerp(targetQuaternion, delta * 3.0);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main Body (1U Cube) */}
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        <Edges scale={1.0} threshold={15} color="#ef4444" /> {/* Red strips */}
      </Box>

      {/* Solar Panels */}
      {/* Right Panel */}
      <Box args={[0.05, 1.2, 1.2]} position={[0.55, 0, 0]}>
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        <Edges scale={1.0} threshold={15} color="#334155" />
      </Box>
      <Box args={[0.06, 1.0, 1.0]} position={[0.55, 0, 0]}>
        <meshStandardMaterial color="#1d4ed8" metalness={1.0} roughness={0.0} emissive="#1e3a8a" emissiveIntensity={0.2} />
      </Box>

      {/* Left Panel */}
      <Box args={[0.05, 1.2, 1.2]} position={[-0.55, 0, 0]}>
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        <Edges scale={1.0} threshold={15} color="#334155" />
      </Box>
      <Box args={[0.06, 1.0, 1.0]} position={[-0.55, 0, 0]}>
        <meshStandardMaterial color="#1d4ed8" metalness={1.0} roughness={0.0} emissive="#1e3a8a" emissiveIntensity={0.2} />
      </Box>

      {/* Antenna (Top) */}
      <Cylinder args={[0.02, 0.02, 0.8]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.5} />
      </Cylinder>
    </group>
  );
}
