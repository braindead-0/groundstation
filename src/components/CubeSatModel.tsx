import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface CubeSatModelProps {
  pitch: number;
  roll: number;
  yaw: number;
}

// Aluminium silver material (shared config)
const ALU_COLOR   = '#b8c4cc';
const ALU_MET     = 0.95;
const ALU_ROUGH   = 0.25;
const CORNER_SIZE = 0.12;
const RAIL_W      = 0.045;
const S            = 0.5; // half-size of the cube

export function CubeSatModel({ pitch, roll, yaw }: CubeSatModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetQ  = useRef(new THREE.Quaternion());

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const e = new THREE.Euler(
      THREE.MathUtils.degToRad(pitch),
      THREE.MathUtils.degToRad(yaw),
      THREE.MathUtils.degToRad(roll),
      'YXZ'
    );
    targetQ.current.setFromEuler(e);
    groupRef.current.quaternion.slerp(targetQ.current, delta * 3.0);
  });

  /* ── helper: one aluminium box ── */
  const Alu = ({ args, position, rotation }: any) => (
    <Box args={args} position={position} rotation={rotation}>
      <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
    </Box>
  );

  /* ── 8 corner brackets ── */
  const corners = [
    [ S,  S,  S], [-S,  S,  S], [ S, -S,  S], [-S, -S,  S],
    [ S,  S, -S], [-S,  S, -S], [ S, -S, -S], [-S, -S, -S],
  ];

  /* ── 12 edge rails (each edge of the cube) ── */
  // X-direction edges (4)
  const xEdges = [
    [0,  S,  S], [0, -S,  S], [0,  S, -S], [0, -S, -S],
  ];
  // Y-direction edges (4)
  const yEdges = [
    [ S, 0,  S], [-S, 0,  S], [ S, 0, -S], [-S, 0, -S],
  ];
  // Z-direction edges (4)
  const zEdges = [
    [ S,  S, 0], [-S,  S, 0], [ S, -S, 0], [-S, -S, 0],
  ];


  const DIAG_LEN = Math.sqrt(2) * (S * 2 - CORNER_SIZE * 2) * 0.9;

  return (
    <group ref={groupRef}>

      {/* ── 8 Corner brackets ── */}
      {corners.map(([x, y, z], i) => (
        <Alu key={`c${i}`}
          args={[CORNER_SIZE, CORNER_SIZE, CORNER_SIZE]}
          position={[x, y, z]}
        />
      ))}

      {/* ── Edge rails – X direction ── */}
      {xEdges.map(([x, y, z], i) => (
        <Alu key={`ex${i}`}
          args={[S * 2 - CORNER_SIZE * 2, RAIL_W, RAIL_W]}
          position={[x, y, z]}
        />
      ))}

      {/* ── Edge rails – Y direction ── */}
      {yEdges.map(([x, y, z], i) => (
        <Alu key={`ey${i}`}
          args={[RAIL_W, S * 2 - CORNER_SIZE * 2, RAIL_W]}
          position={[x, y, z]}
        />
      ))}

      {/* ── Edge rails – Z direction ── */}
      {zEdges.map(([x, y, z], i) => (
        <Alu key={`ez${i}`}
          args={[RAIL_W, RAIL_W, S * 2 - CORNER_SIZE * 2]}
          position={[x, y, z]}
        />
      ))}

      {/* ── Face cross braces (X pattern on each face) ── */}
      {/* +X face cross */}
      <Box args={[RAIL_W, DIAG_LEN, RAIL_W]} position={[S, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Box>
      <Box args={[RAIL_W, DIAG_LEN, RAIL_W]} position={[S, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Box>

      {/* -X face cross */}
      <Box args={[RAIL_W, DIAG_LEN, RAIL_W]} position={[-S, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Box>
      <Box args={[RAIL_W, DIAG_LEN, RAIL_W]} position={[-S, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Box>

      {/* +Z face cross */}
      <Box args={[DIAG_LEN, RAIL_W, RAIL_W]} position={[0, 0, S]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Box>
      <Box args={[DIAG_LEN, RAIL_W, RAIL_W]} position={[0, 0, S]} rotation={[0, 0, -Math.PI / 4]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Box>

      {/* -Z face cross */}
      <Box args={[DIAG_LEN, RAIL_W, RAIL_W]} position={[0, 0, -S]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Box>
      <Box args={[DIAG_LEN, RAIL_W, RAIL_W]} position={[0, 0, -S]} rotation={[0, 0, -Math.PI / 4]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Box>

      {/* +Y face cross (top) */}
      <Box args={[DIAG_LEN, RAIL_W, RAIL_W]} position={[0, S, 0]} rotation={[0, Math.PI / 4, 0]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Box>
      <Box args={[DIAG_LEN, RAIL_W, RAIL_W]} position={[0, S, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Box>

      {/* -Y face cross (bottom) */}
      <Box args={[DIAG_LEN, RAIL_W, RAIL_W]} position={[0, -S, 0]} rotation={[0, Math.PI / 4, 0]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Box>
      <Box args={[DIAG_LEN, RAIL_W, RAIL_W]} position={[0, -S, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Box>

      {/* ── Internal PCB boards (red, visible through frame) ── */}
      {/* Main board (horizontal, middle) */}
      <Box args={[0.78, 0.02, 0.78]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#7f1d1d" metalness={0.3} roughness={0.6} emissive="#dc2626" emissiveIntensity={0.15} />
      </Box>
      {/* Top board */}
      <Box args={[0.75, 0.02, 0.75]} position={[0, 0.28, 0]}>
        <meshStandardMaterial color="#7f1d1d" metalness={0.3} roughness={0.6} emissive="#dc2626" emissiveIntensity={0.2} />
      </Box>
      {/* Bottom board */}
      <Box args={[0.75, 0.02, 0.75]} position={[0, -0.28, 0]}>
        <meshStandardMaterial color="#991b1b" metalness={0.3} roughness={0.6} emissive="#dc2626" emissiveIntensity={0.15} />
      </Box>

      {/* Small IC chips on main PCB */}
      {[[-0.15, 0.02, -0.1], [0.15, 0.02, 0.1], [0.2, 0.02, -0.2], [-0.2, 0.02, 0.18]].map(([x, y, z], i) => (
        <Box key={`ic${i}`} args={[0.08, 0.04, 0.06]} position={[x, y, z]}>
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
        </Box>
      ))}

      {/* ── Solar panels extending from +Z and -Z edges ── */}
      {/* +Z panel */}
      <group position={[0, 0, S + 0.05]}>
        {/* Frame */}
        <Box args={[0.04, 1.05, 0.04]} position={[-0.42, 0, 0]}>
          <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
        </Box>
        <Box args={[0.04, 1.05, 0.04]} position={[ 0.42, 0, 0]}>
          <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
        </Box>
        <Box args={[0.88, 0.04, 0.04]} position={[0,  0.5, 0]}>
          <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
        </Box>
        <Box args={[0.88, 0.04, 0.04]} position={[0, -0.5, 0]}>
          <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
        </Box>
        {/* Cells */}
        <Box args={[0.82, 0.96, 0.012]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1e3a8a" metalness={1} roughness={0.05} emissive="#1d4ed8" emissiveIntensity={0.4} />
        </Box>
        {/* Cell dividers */}
        {[-0.27, 0, 0.27].map((x, i) => (
          <Box key={`pv${i}`} args={[0.01, 0.96, 0.014]} position={[x, 0, 0.001]}>
            <meshStandardMaterial color="#93c5fd" emissive="#bfdbfe" emissiveIntensity={0.4} />
          </Box>
        ))}
        {[-0.32, 0, 0.32].map((y, i) => (
          <Box key={`ph${i}`} args={[0.82, 0.01, 0.014]} position={[0, y, 0.001]}>
            <meshStandardMaterial color="#93c5fd" emissive="#bfdbfe" emissiveIntensity={0.4} />
          </Box>
        ))}
      </group>

      {/* -Z panel */}
      <group position={[0, 0, -(S + 0.05)]}>
        <Box args={[0.04, 1.05, 0.04]} position={[-0.42, 0, 0]}>
          <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
        </Box>
        <Box args={[0.04, 1.05, 0.04]} position={[ 0.42, 0, 0]}>
          <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
        </Box>
        <Box args={[0.88, 0.04, 0.04]} position={[0,  0.5, 0]}>
          <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
        </Box>
        <Box args={[0.88, 0.04, 0.04]} position={[0, -0.5, 0]}>
          <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
        </Box>
        <Box args={[0.82, 0.96, 0.012]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1e3a8a" metalness={1} roughness={0.05} emissive="#1d4ed8" emissiveIntensity={0.4} />
        </Box>
        {[-0.27, 0, 0.27].map((x, i) => (
          <Box key={`pv2${i}`} args={[0.01, 0.96, 0.014]} position={[x, 0, 0.001]}>
            <meshStandardMaterial color="#93c5fd" emissive="#bfdbfe" emissiveIntensity={0.4} />
          </Box>
        ))}
        {[-0.32, 0, 0.32].map((y, i) => (
          <Box key={`ph2${i}`} args={[0.82, 0.01, 0.014]} position={[0, y, 0.001]}>
            <meshStandardMaterial color="#93c5fd" emissive="#bfdbfe" emissiveIntensity={0.4} />
          </Box>
        ))}
      </group>

      {/* ── Antenna (top) ── */}
      <Cylinder args={[0.018, 0.012, 0.75, 8]} position={[0, S + 0.38, 0]}>
        <meshStandardMaterial color={ALU_COLOR} metalness={ALU_MET} roughness={ALU_ROUGH} />
      </Cylinder>
      {/* Antenna tip dot */}
      <Box args={[0.04, 0.04, 0.04]} position={[0, S + 0.76, 0]}>
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.2} />
      </Box>

    </group>
  );
}
