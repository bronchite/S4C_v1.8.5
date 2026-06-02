// ─── Pure utility functions ─────────────────────────────────────────────────

export function generateId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/** L×W×H / 5000 (standard carrier volumetric divisor, cm → kg) */
export function calculateVolumetricWeight(l: number, w: number, h: number): number {
  return (l * w * h) / 5000;
}

/** max(real, vol) rounded UP to nearest 0.5 kg */
export function calculateBilledWeight(realWeight: number, volumetricWeight: number): number {
  return Math.ceil(Math.max(realWeight, volumetricWeight) * 2) / 2;
}
