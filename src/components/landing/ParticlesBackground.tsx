'use client';

import { useCallback, useEffect, useState } from 'react';
import { loadSlim } from '@tsparticles/slim';
import { Particles } from '@tsparticles/react';
import { Engine } from '@tsparticles/engine';

export default function ParticlesBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="h-full w-full"
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          particles: {
            color: {
              value: ["#10b981", "#0891b2", "#0ea5e9"]
            },
            links: {
              color: "#10b981",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              enable: true,
              random: true,
              speed: 0.5,
              straight: false,
            },
            number: {
              value: 60,
            },
            opacity: {
              value: 0.3,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
} 