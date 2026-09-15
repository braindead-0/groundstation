import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface CubeSatModelProps {
  pitch: number;
  roll: number;
  yaw: number;
}

export function CubeSatModel({ pitch, roll, yaw }: CubeSatModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetQuaternion = new THREE.Quaternion();

  useFrame((_, delta) => {
    if (groupRef.current) {
      const pitchRad = THREE.MathUtils.degToRad(pitch);
      const rollRad  = THREE.MathUtils.degToRad(roll);
      const yawRad   = THREE.MathUtils.degToRad(yaw);
      const euler    = new THREE.Euler(pitchRad, yawRad, rollRad, 'YXZ');
      targetQuaternion.setFromEuler(euler);
      groupRef.current.quaternion.slerp(targetQuaternion, delta * 3.0);
    }
  });

  return (
    <group ref={groupRef}>

      {/* ── Main Body ── */}
      {/* Core structure */}
      <Box args={[1.0, 1.1, 1.0]}>
        <meshStandardMaterial color="#18202e" metalness={0.85} roughness={0.18} />
      </Box>

      {/* Red accent strips – top */}
      <Box args={[1.02, 0.06, 1.02]} position={[0, 0.52, 0]}>
        <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.3} emissive="#ef4444" emissiveIntensity={0.5} />
      </Box>
      {/* Red accent strips – bottom */}
      <Box args={[1.02, 0.06, 1.02]} position={[0, -0.52, 0]}>
        <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.3} emissive="#ef4444" emissiveIntensity={0.5} />
      </Box>

      {/* Front face panel (grey brushed metal) */}
      <Box args={[0.01, 0.9, 0.9]} position={[0.505, 0, 0]}>
        <meshStandardMaterial color="#1e2d45" metalness={0.7} roughness={0.25} />
      </Box>
      {/* Back face */}
      <Box args={[0.01, 0.9, 0.9]} position={[-0.505, 0, 0]}>
        <meshStandardMaterial color="#1e2d45" metalness={0.7} roughness={0.25} />
      </Box>

      {/* Camera / payload module on front face */}
      <Cylinder args={[0.12, 0.12, 0.05, 16]} rotation={[0, 0, Math.PI / 2]} position={[0.54, 0.15, 0]}>
        <meshStandardMaterial color="#0c1622" metalness={0.95} roughness={0.05} />
      </Cylinder>
      <Cylinder args={[0.07, 0.07, 0.04, 16]} rotation={[0, 0, Math.PI / 2]} position={[0.555, 0.15, 0]}>
        <meshStandardMaterial color="#1d4ed8" metalness={1} roughness={0} emissive="#2563eb" emissiveIntensity={0.6} />
      </Cylinder>
      {/* Lens glint */}
      <Sphere args={[0.03, 8, 8]} position={[0.58, 0.15, 0]}>
        <meshStandardMaterial color="#93c5fd" emissive="#bfdbfe" emissiveIntensity={1} />
      </Sphere>

      {/* DHT11 sensor block */}
      <Box args={[0.14, 0.14, 0.06]} position={[0.54, -0.2, 0.25]}>
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.5} />
      </Box>
      <Box args={[0.10, 0.10, 0.04]} position={[0.545, -0.2, 0.25]}>
        <meshStandardMaterial color="#22c55e" metalness={0.3} roughness={0.6} emissive="#16a34a" emissiveIntensity={0.3} />
      </Box>

      {/* ── Solar Panels ── */}
      {/* RIGHT panel arm */}
      <Box args={[0.08, 0.06, 0.06]} position={[0, 0, 0.7]}>
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </Box>
      {/* RIGHT panel frame */}
      <Box args={[0.04, 1.5, 0.9]} position={[0, 0, 1.25]}>
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.15} />
      </Box>
      {/* RIGHT panel cells */}
      <Box args={[0.015, 1.38, 0.82]} position={[0, 0, 1.25]}>
        <meshStandardMaterial
          color="#1e3a8a"
          metalness={1} roughness={0}
          emissive="#1d4ed8"
          emissiveIntensity={0.35}
        />
      </Box>
      {/* Cell grid lines right */}
      {[-0.28, -0.05, 0.18, 0.41].map((y, i) => (
        <Box key={`rcell-h-${i}`} args={[0.016, 0.01, 0.82]} position={[0.008, y, 1.25]}>
          <meshStandardMaterial color="#3b82f6" emissive="#93c5fd" emissiveIntensity={0.3} />
        </Box>
      ))}
      {[-0.24, 0.05, 0.34].map((z, i) => (
        <Box key={`rcell-v-${i}`} args={[0.016, 1.38, 0.01]} position={[0.008, 0, 1.25 + z - 0.17]}>
          <meshStandardMaterial color="#3b82f6" emissive="#93c5fd" emissiveIntensity={0.3} />
        </Box>
      ))}

      {/* LEFT panel arm */}
      <Box args={[0.08, 0.06, 0.06]} position={[0, 0, -0.7]}>
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </Box>
      {/* LEFT panel frame */}
      <Box args={[0.04, 1.5, 0.9]} position={[0, 0, -1.25]}>
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.15} />
      </Box>
      {/* LEFT panel cells */}
      <Box args={[0.015, 1.38, 0.82]} position={[0, 0, -1.25]}>
        <meshStandardMaterial
          color="#1e3a8a"
          metalness={1} roughness={0}
          emissive="#1d4ed8"
          emissiveIntensity={0.35}
        />
      </Box>
      {[-0.28, -0.05, 0.18, 0.41].map((y, i) => (
        <Box key={`lcell-h-${i}`} args={[0.016, 0.01, 0.82]} position={[0.008, y, -1.25]}>
          <meshStandardMaterial color="#3b82f6" emissive="#93c5fd" emissiveIntensity={0.3} />
        </Box>
      ))}
      {[-0.24, 0.05, 0.34].map((z, i) => (
        <Box key={`lcell-v-${i}`} args={[0.016, 1.38, 0.01]} position={[0.008, 0, -1.25 + z - 0.17]}>
          <meshStandardMaterial color="#3b82f6" emissive="#93c5fd" emissiveIntensity={0.3} />
        </Box>
      ))}

      {/* ── Antenna & Comms ── */}
      {/* Main comms antenna */}
      <Cylinder args={[0.022, 0.014, 1.0, 8]} position={[0, 1.05, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
      </Cylinder>
      {/* Antenna tip */}
      <Sphere args={[0.03, 8, 8]} position={[0, 1.57, 0]}>
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} />
      </Sphere>

      {/* NRF antenna stub */}
      <Cylinder args={[0.015, 0.01, 0.4, 6]} position={[0.3, -0.9, 0]} rotation={[0, 0, 0.4]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.4} />
      </Cylinder>

      {/* GPS antenna patch on top face */}
      <Box args={[0.25, 0.03, 0.25]} position={[-0.2, 0.565, 0.2]}>
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
      </Box>
      <Box args={[0.2, 0.025, 0.2]} position={[-0.2, 0.572, 0.2]}>
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} emissive="#d97706" emissiveIntensity={0.2} />
      </Box>

      {/* Torus ring – decorative frame around body */}
      <Torus args={[0.82, 0.018, 8, 48]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.2} />
      </Torus>

    </group>
  );
}
