import { GroundStationPassResult } from "../types/coordinates";

export interface ScheduledPass extends GroundStationPassResult {}

export interface SchedulingContext {
  nowUtc: string;
  policyName: string;
}

export interface SchedulingPolicy {
  name: string;
  schedule(
    passes: GroundStationPassResult[],
    context: SchedulingContext,
  ): ScheduledPass[];
}

export const DefaultSchedulingPolicy: SchedulingPolicy = {
  name: "default",
  schedule(passes) {
    return passes;
  },
};

