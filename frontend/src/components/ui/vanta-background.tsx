"use client";

import dynamic from 'next/dynamic';

export const VantaBackground = dynamic(
  () => import('./vanta-background-client').then((mod) => mod.VantaBackgroundClient),
  { ssr: false }
);