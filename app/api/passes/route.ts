import { NextRequest, NextResponse } from "next/server";
import { computeTrajectory } from "@/src/lib/orbit/sgp4";
import { computePassesForStations } from "@/src/lib/orbit/passes";
import { DefaultSchedulingPolicy } from "@/src/lib/scheduling/policies";
import type { TleInput } from "@/src/lib/types/tle";
import type {
  GroundStationInput,
  GroundStationPassResult,
  TrajectoryResult,
} from "@/src/lib/types/coordinates";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PassesRequestBody {
  tle: TleInput;
  groundStations: GroundStationInput[];
  startUtc: string;
  endUtc: string;
  stepSec?: number;
  policyName?: string;
}

interface PassesResponseBody {
  trajectory: TrajectoryResult;
  passes: GroundStationPassResult[];
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as PassesRequestBody;

  const stepSec = body.stepSec ?? 10;

  const trajectory = computeTrajectory(
    body.tle,
    body.startUtc,
    body.endUtc,
    stepSec,
  );

  const passes = computePassesForStations(trajectory, body.groundStations);
  const scheduled = DefaultSchedulingPolicy.schedule(passes, {
    nowUtc: new Date().toISOString(),
    policyName: body.policyName ?? DefaultSchedulingPolicy.name,
  });

  const response: PassesResponseBody = {
    trajectory,
    passes: scheduled,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

