import JobCard from "./JobCard";

export default function JobList({ jobs, candidatesByJob = {} }) {
  if (!jobs?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 p-6 text-slate-300">
        No jobs yet. Create your first role to start sourcing.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} candidateCount={candidatesByJob[job._id] || 0} />
      ))}
    </div>
  );
}
