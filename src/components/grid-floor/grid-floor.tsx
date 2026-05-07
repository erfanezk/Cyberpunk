import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { COLORS } from '@/constants';

const gridVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gridFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    // Small grid — street tiles (40×40)
    vec2 smallUv = vUv * 40.0;
    vec2 dSmall = abs(fract(smallUv - 0.5) - 0.5) / fwidth(smallUv);
    float smallLine = 1.0 - min(min(dSmall.x, dSmall.y), 1.0);

    // Large grid — city blocks (8×8)
    vec2 largeUv = vUv * 8.0;
    vec2 dLarge = abs(fract(largeUv - 0.5) - 0.5) / fwidth(largeUv);
    float largeLine = 1.0 - min(min(dLarge.x, dLarge.y), 1.0);

    // Combined: large lines dominate, small are subtle
    float line = max(smallLine * 0.45, largeLine * 0.95);

    // Outward scan pulse — energy wave radiating from center
    float dist = length(vUv - 0.5);
    float scanPulse = 0.5 + 0.5 * sin(uTime * 1.1 - dist * 16.0);
    float basePulse  = 0.65 + 0.35 * sin(uTime * 0.35);
    float pulse = mix(basePulse, scanPulse, 0.65);

    // Radial fade
    float fade = 1.0 - smoothstep(0.05, 0.5, dist);

    float alpha = line * pulse * fade * 0.75;

    // Large lines are brighter, small lines dimmer
    vec3 color = mix(uColor * 0.7, uColor * 1.6, largeLine);

    gl_FragColor = vec4(color, alpha);
  }
`;

export function GridFloor() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(COLORS.cyan) },
    }),
    [],
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -40]}>
      <planeGeometry args={[350, 350, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={gridVertexShader}
        fragmentShader={gridFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
