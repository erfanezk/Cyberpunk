import { memo } from 'react';
import Cyber from '../cyber/cyber';
import DataStreams from '@/components/world/data-streams';
import FloatingShapes from '@/components/world/floating-shapes';
import FlyingVehicles from '@/components/world/flying-vehicles';
import GridFloor from '@/components/world/grid-floor';
import HolographicBillboards from '@/components/world/holographic-billboards';
import NeonTowers from '@/components/world/neon-towers';
import NPCs from '@/components/world/npcs';
import Particles from '@/components/world/particles';
import Rain from '@/components/world/rain';
import type { CyberWorldProps } from './cyber-world.types';

function CyberWorld({ scroll }: CyberWorldProps) {
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

export default memo(CyberWorld);
