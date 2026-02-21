import Link from "next/link";
import Badge from "../ui/Badge";

export default function JobCard({ job, candidateCount = 0 }) {
  return (
    <Link
      href={`/jobs/${job._id}`}
      className="block rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-sky-500"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <Badge color="blue">{job.type || "n/a"}</Badge>
      </div>
      <p className="mb-3 text-sm text-slate-300">{job.location || "Unknown location"}</p>
      <div className="flex items-center justify-between text-sm">
        <Badge color={job.status === "active" ? "green" : "yellow"}>{job.status}</Badge>
        <span className="text-slate-400">{candidateCount} candidates</span>
      </div>
    </Link>
  );
}
