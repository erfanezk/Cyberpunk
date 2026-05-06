import { DataStreams } from '@/components/data-streams';
import { FloatingShapes } from '@/components/floating-shapes';
import { GridFloor } from '@/components/grid-floor';
import { HolographicBillboards } from '@/components/holographic-billboards';
import { NeonTowers } from '@/components/neon-towers';
import { Particles } from '@/components/particles';
import type { CyberWorldProps } from './cyber-world.types';

export function CyberWorld({ scroll }: CyberWorldProps) {
  return (
    <>
      <GridFloor />
      <NeonTowers />
      <Particles scroll={scroll} />
      <FloatingShapes />
      <DataStreams />
      <HolographicBillboards />
    </>
  );
}
