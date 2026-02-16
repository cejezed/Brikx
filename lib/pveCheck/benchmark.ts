import type { PveBenchmarkDelta, PveProjectType } from "@/types/pveCheck";

type ProjectBenchmark = {
  avgBudget: number;
  avgWordCount: number;
  avgRooms: number;
};

const PROJECT_BENCHMARKS: Record<PveProjectType, ProjectBenchmark> = {
  nieuwbouw: { avgBudget: 650000, avgWordCount: 3400, avgRooms: 9 },
  verbouwing: { avgBudget: 175000, avgWordCount: 2200, avgRooms: 5 },
  bijgebouw: { avgBudget: 75000, avgWordCount: 1200, avgRooms: 2 },
  hybride: { avgBudget: 325000, avgWordCount: 2600, avgRooms: 6 },
  anders: { avgBudget: 200000, avgWordCount: 1800, avgRooms: 4 },
};

type BenchmarkInput = {
  projectType: PveProjectType;
  budget: number | null;
  wordCount: number;
  roomCount: number;
};

export function computeBenchmark(input: BenchmarkInput): PveBenchmarkDelta[] {
  const benchmark = PROJECT_BENCHMARKS[input.projectType] ?? PROJECT_BENCHMARKS.anders;

  return [
    {
      metric: "budget",
      projectType: input.projectType,
      value: input.budget,
      benchmark: benchmark.avgBudget,
      delta: input.budget == null ? null : input.budget - benchmark.avgBudget,
    },
    {
      metric: "wordCount",
      projectType: input.projectType,
      value: input.wordCount,
      benchmark: benchmark.avgWordCount,
      delta: input.wordCount - benchmark.avgWordCount,
    },
    {
      metric: "roomCount",
      projectType: input.projectType,
      value: input.roomCount,
      benchmark: benchmark.avgRooms,
      delta: input.roomCount - benchmark.avgRooms,
    },
  ];
}

