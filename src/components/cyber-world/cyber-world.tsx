import { DataStreams } from '@/components/data-streams';
import { FloatingShapes } from '@/components/floating-shapes';
import { FlyingVehicles } from '@/components/flying-vehicles';
import { GridFloor } from '@/components/grid-floor';
import { HolographicBillboards } from '@/components/holographic-billboards';
import { NeonTowers } from '@/components/neon-towers';
import { NPCs } from '@/components/npcs';
import { Particles } from '@/components/particles';
import { Rain } from '@/components/rain';
import type { CyberWorldProps } from './cyber-world.types';
import { Cyber } from '../cyber/cyber';

export function CyberWorld({ scroll }: CyberWorldProps) {
  return (
    <>
      <Cyber scroll={scroll} />
      <GridFloor />
      <NeonTowers />
      <Particles />
      <FloatingShapes />
      <DataStreams />
      <HolographicBillboards />
      <Rain />
      <FlyingVehicles />
      <NPCs />
    </>
  );
}
