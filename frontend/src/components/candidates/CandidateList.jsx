import CandidateCard from "./CandidateCard";

export default function CandidateList({ candidates }) {
  if (!candidates?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 p-6 text-slate-300">
        No candidates yet. Run sourcing to populate this list.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {candidates.map((candidate) => (
        <CandidateCard key={candidate._id} candidate={candidate} />
      ))}
    </div>
  );
}
