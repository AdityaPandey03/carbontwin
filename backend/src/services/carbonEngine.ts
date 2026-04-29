/**
 * Carbon Engine
 *   Carbon (kg CO2)  = usage × baseEnergy × 1.2 × 0.71
 *   Cost (₹)         = carbon × ratePerKg
 *
 * baseEnergy is per-activity-type kWh per usage unit, calibrated for
 * order-of-magnitude correctness.
 */

import type { ActivityType } from '../models/Activity';

export const CARBON_RATE_INR_PER_KG = 850; // social cost of carbon ≈ ₹850 / kg

export const baseEnergy: Record<ActivityType, number> = {
  ai_query: 0.0029,      // kWh per query (LLM inference)
  email: 0.000017,       // kWh per email
  streaming: 0.077,      // kWh per hour
  video_call: 0.157,     // kWh per hour
  cloud_storage: 0.001,  // kWh per GB-day
  web_browsing: 0.0006,  // kWh per page view
  compute: 0.5,          // kWh per hour (heavy compute)
  other: 0.01,
};

export interface CarbonResult {
  carbon: number; // kg CO2
  cost: number;   // ₹
  energy: number; // kWh
}

export const computeCarbon = (type: ActivityType, usage: number): CarbonResult => {
  const energy = usage * (baseEnergy[type] ?? baseEnergy.other);
  const carbon = energy * 1.2 * 0.71;
  const cost = carbon * CARBON_RATE_INR_PER_KG;
  return {
    carbon: round(carbon, 5),
    cost: round(cost, 2),
    energy: round(energy, 5),
  };
};

const round = (n: number, d: number) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};
