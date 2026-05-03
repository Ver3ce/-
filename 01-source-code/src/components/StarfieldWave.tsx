import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import starfieldVert from '../shaders/starfield.vert.glsl?raw';
import starfieldFrag from '../shaders/starfield.frag.glsl?raw';

interface StarfieldPointsProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

function StarfieldPoints({ scrollProgressRef }: StarfieldPointsProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  const [geometry, material] = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices: number[] = [];

    for (let i = 0; i < 4500; i++) {
      const x = (Math.random() - 0.5) * 400;
      const y = Math.random() * 20;
      const z = (Math.random() - 0.5) * 40 + (i < 2250 ? -20 : 20);
      vertices.push(x, y, z);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: starfieldVert,
      fragmentShader: starfieldFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return [geo, mat];
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value += delta * 0.5;
    }

    // Camera parallax based on mouse
    const targetX = mouseRef.current.x * 5;
    const targetY = mouseRef.current.y * 3;
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;

    // Camera Z based on scroll
    const targetZ = 100 - scrollProgressRef.current * 30;
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    camera.lookAt(0, 0, 0);
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material}>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        uniforms={{ time: { value: 0 } }}
        vertexShader={starfieldVert}
        fragmentShader={starfieldFrag}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface StarfieldWaveProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

export default function StarfieldWave({ scrollProgressRef }: StarfieldWaveProps) {
  return (
    <div className="fixed inset-0 z-0" style={{ background: '#02040a' }}>
      <Canvas
        camera={{ position: [0, 0, 100], fov: 60, near: 1, far: 300 }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
      >
        <fog attach="fog" args={[new THREE.Color(0x02040a), 50, 200]} />
        <StarfieldPoints scrollProgressRef={scrollProgressRef} />
      </Canvas>
      {/* Top gradient overlays for text readability */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#02040a] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-r from-[#02040a]/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#02040a]/80 to-transparent pointer-events-none" />
    </div>
  );
}
