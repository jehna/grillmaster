import { GrillItemSelection } from "@/components/GrillItemSelection";
import { GrillTimeline } from "@/components/GrillTimeline";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-neutral-light text-neutral-dark">
      <header className="bg-primary text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">GrillMaster</h1>
        <p className="text-sm opacity-80">Suunnittele täydellinen grillihetki</p>
      </header>

      <GrillItemSelection />
      <GrillTimeline />
    </div>
  );
}
