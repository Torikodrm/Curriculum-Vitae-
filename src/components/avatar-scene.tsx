"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { avatarGender } from "@/lib/env";

const modelPath = `/models/avatar-${avatarGender}.glb`;

class AvatarErrorBoundary extends Component<{ children: React.ReactNode; gender: typeof avatarGender }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <ProceduralAvatar gender={this.props.gender} /> : this.props.children;
  }
}

function ModelAvatar() {
  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Object3D | null>(null);
  const gltf = useGLTF(modelPath);
  const { scene, scale, y } = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(cloned);
    const size = bounds.getSize(new THREE.Vector3());
    const fittedScale = size.y > 0 ? 3.8 / size.y : 1.65;
    return { scene: cloned, scale: fittedScale, y: -2.15 - bounds.min.y * fittedScale };
  }, [gltf.scene]);

  useEffect(() => {
    headRef.current = null;
    scene.traverse((node) => {
      if (!headRef.current && /head/i.test(node.name)) headRef.current = node;
    });
  }, [scene]);

  const pointerTarget = usePointerTarget();

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointerTarget.current.x * 0.32, 0.06);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointerTarget.current.y * 0.08, 0.06);
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, pointerTarget.current.x * 0.18, 0.06);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -pointerTarget.current.y * 0.1, 0.06);
    }
  });

  return <primitive ref={group} object={scene} position={[0, y, 0]} scale={scale} />;
}

function rand01(seedRef: { s: number }) {
  seedRef.s |= 0;
  seedRef.s = (seedRef.s + 0x6d2b79f5) | 0;
  let t = Math.imul(seedRef.s ^ (seedRef.s >>> 15), 1 | seedRef.s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

type Spike = { position: [number, number, number]; rotation: [number, number, number]; scale: number; color: string };

/** Pelo verde corto y abundante estilo Zoro: picos desordenados, no casco. */
function useZoroSpikes(): Spike[] {
  return useMemo(() => {
    const seed = { s: 1337 };
    const colors = ["#3FA34D", "#57B25E", "#2E7D3A", "#6FCF7F", "#379245"];
    const spikes: Spike[] = [];
    const COUNT = 48;
    for (let i = 0; i < COUNT; i++) {
      // Fibonacci + jitter para que no se vea uniforme
      const y = 0.25 + (i / COUNT) * 0.85 + (rand01(seed) - 0.5) * 0.12; // sesgo arriba
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * 2.39996 + rand01(seed) * 0.6;
      const nx = r * Math.cos(theta);
      const nz = r * Math.sin(theta) * 0.92 - 0.12;
      const ny = y;
      const R = 0.55;
      const px = nx * R;
      const py = 0.1 + ny * R;
      const pz = -0.05 + nz * R;
      if (py < 0.28 && Math.abs(px) < 0.3 && pz > 0.35) continue; // despejar la frente
      spikes.push({
        position: [px, py, pz],
        rotation: [nz * 0.9 + (rand01(seed) - 0.5) * 0.5, 0, -nx * 0.9 + (rand01(seed) - 0.5) * 0.5],
        scale: 0.75 + rand01(seed) * 0.7,
        color: colors[Math.floor(rand01(seed) * colors.length)],
      });
    }
    return spikes;
  }, []);
}

function ZoroHead() {
  const spikes = useZoroSpikes();
  const skin = "#F1C8A2";
  const skinShade = "#D9A985";

  return (
    <group>
      {/* Cabeza muñeco */}
      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.55, 40, 28]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>
      {/* Mandíbula marcada */}
      <mesh castShadow position={[0, -0.3, 0.06]} scale={[0.95, 0.62, 0.88]}>
        <sphereGeometry args={[0.32, 28, 20]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      {/* Base de pelo para que no se vea calvo entre picos */}
      <mesh castShadow position={[0, 0.14, -0.08]}>
        <sphereGeometry args={[0.58, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial color="#2F7A3D" roughness={0.8} />
      </mesh>
      {/* Picos verdes abundantes */}
      {spikes.map((sp, i) => (
        <mesh key={i} castShadow position={sp.position} rotation={sp.rotation} scale={sp.scale}>
          <coneGeometry args={[0.11, 0.38, 7]} />
          <meshStandardMaterial color={sp.color} roughness={0.75} />
        </mesh>
      ))}
      {/* Patillas cortas */}
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow position={[s * 0.5, -0.12, 0.12]} rotation={[0, 0, s * -0.15]} scale={[0.7, 1, 0.7]}>
          <coneGeometry args={[0.09, 0.3, 7]} />
          <meshStandardMaterial color="#2E7D3A" roughness={0.8} />
        </mesh>
      ))}

      {/* Orejas */}
      <mesh castShadow position={[-0.52, -0.08, 0.02]} scale={[0.5, 1, 0.65]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.52, -0.08, 0.02]} scale={[0.5, 1, 0.65]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      {/* 3 pendientes dorados en oreja izquierda (lado de la cicatriz) */}
      {[-0.18, -0.27, -0.36].map((y, i) => (
        <mesh key={i} position={[0.55, y, 0.06]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.05, 0.013, 10, 24]} />
          <meshStandardMaterial color="#FFD166" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* Ojo derecho abierto (lado sin cicatriz) */}
      <group position={[-0.19, 0, 0.47]}>
        <mesh>
          <sphereGeometry args={[0.095, 24, 18]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.01, 0.065]}>
          <sphereGeometry args={[0.045, 18, 14]} />
          <meshStandardMaterial color="#1E1B18" roughness={0.2} />
        </mesh>
        <mesh position={[0.014, 0.014, 0.1]}>
          <sphereGeometry args={[0.013, 10, 8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
        </mesh>
      </group>
      {/* Ojo izquierdo cerrado + cicatriz diagonal */}
      <mesh position={[0.19, -0.02, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.022, 0.13, 4, 10]} />
        <meshStandardMaterial color="#1A1512" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.2, 0.06, 0.47]} rotation={[0, 0.15, 0.42]}>
        <capsuleGeometry args={[0.024, 0.42, 4, 10]} />
        <meshStandardMaterial color="#D89A86" roughness={0.65} />
      </mesh>

      {/* Cejas fieras */}
      <mesh castShadow position={[-0.2, 0.2, 0.46]} rotation={[0, 0, 0.28]} scale={[1.3, 0.5, 0.6]}>
        <capsuleGeometry args={[0.045, 0.13, 4, 10]} />
        <meshStandardMaterial color="#1E2420" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.2, 0.2, 0.46]} rotation={[0, 0, -0.12]} scale={[1.3, 0.5, 0.6]}>
        <capsuleGeometry args={[0.045, 0.13, 4, 10]} />
        <meshStandardMaterial color="#1E2420" roughness={0.7} />
      </mesh>

      {/* Nariz y boca con sonrisa confiada */}
      <mesh castShadow position={[0, -0.1, 0.53]} rotation={[0.2, 0, 0]}>
        <capsuleGeometry args={[0.04, 0.07, 4, 10]} />
        <meshStandardMaterial color={skinShade} roughness={0.6} />
      </mesh>
      <mesh position={[0.06, -0.31, 0.46]} rotation={[0, 0, -0.18]}>
        <capsuleGeometry args={[0.028, 0.14, 4, 10]} />
        <meshStandardMaterial color="#5A2E26" roughness={0.55} />
      </mesh>
    </group>
  );
}

function ZoroBody() {
  return (
    <group>
      {/* Cuello */}
      <mesh castShadow position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.17, 0.19, 0.4, 18]} />
        <meshStandardMaterial color="#D9A985" roughness={0.6} />
      </mesh>
      {/* Kimono blanco abierto */}
      <mesh castShadow receiveShadow position={[0, -0.1, 0]} scale={[1.2, 1, 0.85]}>
        <capsuleGeometry args={[0.5, 0.8, 8, 20]} />
        <meshStandardMaterial color="#EDEDE4" roughness={0.85} />
      </mesh>
      {/* Pecho en V */}
      <mesh position={[0, 0.18, 0.38]} rotation={[0.15, 0, 0]} scale={[1, 1.4, 0.5]}>
        <sphereGeometry args={[0.2, 18, 14]} />
        <meshStandardMaterial color="#F1C8A2" roughness={0.6} />
      </mesh>
      {/* Haramaki verde */}
      <mesh castShadow position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.56, 0.58, 0.32, 24]} />
        <meshStandardMaterial color="#2E7D44" roughness={0.8} />
      </mesh>
      {/* Brazos muñeco */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.62, 0.1, 0]} rotation={[0, 0, s * -0.35]}>
          <mesh castShadow position={[0, 0.05, 0]}>
            <capsuleGeometry args={[0.13, 0.25, 6, 12]} />
            <meshStandardMaterial color="#EDEDE4" roughness={0.85} />
          </mesh>
          <mesh castShadow position={[0, -0.32, 0]}>
            <capsuleGeometry args={[0.1, 0.3, 6, 12]} />
            <meshStandardMaterial color="#F1C8A2" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Bandana negra en el brazo izquierdo */}
      <mesh position={[0.72, -0.05, 0]} rotation={[0, 0, -0.35]}>
        <torusGeometry args={[0.14, 0.045, 10, 24]} />
        <meshStandardMaterial color="#14161A" roughness={0.85} />
      </mesh>
      {/* 3 katanas en la cadera derecha */}
      <group position={[-0.62, -0.35, -0.1]} rotation={[0.2, 0, 0.5]}>
        {[
          { y: 0, color: "#1B1D22" },
          { y: 0.12, color: "#7A1F1F" },
          { y: -0.12, color: "#E8E8E2" },
        ].map((k, i) => (
          <group key={i} position={[0, k.y, -i * 0.09]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.55, 14]} />
              <meshStandardMaterial color={k.color} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.03, 18]} />
              <meshStandardMaterial color="#C9A227" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.3, 12]} />
              <meshStandardMaterial color="#8A8F98" metalness={0.6} roughness={0.35} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function ProceduralAvatar({ gender = avatarGender }: { gender?: typeof avatarGender }) {
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const isFemale = gender === "female";

  const pointerTarget = usePointerTarget();

  useFrame(() => {
    if (body.current) body.current.rotation.y = THREE.MathUtils.lerp(body.current.rotation.y, pointerTarget.current.x * 0.28, 0.05);
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, pointerTarget.current.x * 0.45, 0.07);
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, -pointerTarget.current.y * 0.2, 0.07);
    }
  });

  return (
    <group ref={body} position={[0, -1.25, 0]}>
      {isFemale ? (
        <>
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <coneGeometry args={[0.82, 1.95, 8]} />
            <meshStandardMaterial color="#FF5C8A" roughness={0.55} />
          </mesh>
          <group ref={head} position={[0, 1.18, 0]}>
            <mesh castShadow>
              <icosahedronGeometry args={[0.58, 2]} />
              <meshStandardMaterial color="#E9E7DD" roughness={0.38} />
            </mesh>
            <mesh castShadow position={[0, 0.26, -0.04]}>
              <sphereGeometry args={[0.66, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
              <meshStandardMaterial color="#171B34" roughness={0.7} />
            </mesh>
            <mesh position={[0.22, 0.05, 0.53]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#10120F" />
            </mesh>
            <mesh position={[-0.22, 0.05, 0.53]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#10120F" />
            </mesh>
          </group>
        </>
      ) : (
        <>
          <ZoroBody />
          <group ref={head} position={[0, 1.18, 0]}>
            <ZoroHead />
          </group>
        </>
      )}
    </group>
  );
}

function Scene() {
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(modelPath, { method: "HEAD", signal: controller.signal })
      .then((response) => setModelAvailable(response.ok))
      .catch(() => setModelAvailable(false));
    return () => controller.abort();
  }, []);

  return (
    <>
      <color attach="background" args={["#10120F"]} />
      <hemisphereLight args={["#FFF4E0", "#1A1C22", 0.7]} />
      <ambientLight intensity={0.9} />
      <directionalLight castShadow intensity={2.6} position={[3, 5, 4]} shadow-mapSize={[1024, 1024]} color="#FFF1DD" />
      <directionalLight intensity={1.1} position={[-3, 2.5, -3]} color="#9DB8FF" />
      <pointLight color="#B8FF38" intensity={8} position={[-4, 1, 2]} />
      <Suspense fallback={<ProceduralAvatar gender={avatarGender} />}>
        {modelAvailable ? <AvatarErrorBoundary gender={avatarGender}><ModelAvatar /></AvatarErrorBoundary> : <ProceduralAvatar gender={avatarGender} />}
      </Suspense>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.25, 0]}>
        <planeGeometry args={[200, 200]} />
        <shadowMaterial opacity={0.25} />
      </mesh>
    </>
  );
}

function usePointerTarget() {
  const target = useRef(new THREE.Vector2());

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      target.current.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    };
    const resetPointer = () => target.current.set(0, 0);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", resetPointer);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", resetPointer);
    };
  }, []);

  return target;
}

export function AvatarScene() {
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 0.2, 6], fov: 36 }} gl={{ antialias: true, alpha: true }}>
      <Scene />
    </Canvas>
  );
}
