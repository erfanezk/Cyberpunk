export type ShapeType = 'icosahedron' | 'torusKnot' | 'octahedron' | 'dodecahedron';

export interface ShapeConfig {
  position: [number, number, number];
  scale: number;
  rotationSpeed: [number, number, number];
  geometry: ShapeType;
  color: string;
  id: string;
}
