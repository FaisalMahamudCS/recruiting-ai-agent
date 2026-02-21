import Link from "next/link";
import Badge from "../ui/Badge";
import ScoreDisplay from "./ScoreDisplay";

export default function CandidateCard({ candidate }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold">{candidate.name || "Unknown Candidate"}</h4>
          <p className="text-sm text-slate-300">
            {candidate.currentTitle || "Unknown Title"} at {candidate.currentCompany || "Unknown Company"}
          </p>
        </div>
        <Badge color="slate">{candidate.status}</Badge>
      </div>

      <ScoreDisplay aiScore={candidate.aiScore} />

      <div className="mt-3">
        <Link href={`/candidates/${candidate._id}?jobId=${candidate.jobId}`}>Open profile</Link>
      </div>
    </div>
  );
}
