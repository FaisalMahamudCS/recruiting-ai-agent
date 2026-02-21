import Link from "next/link";
import JobList from "../components/jobs/JobList";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { useJobs } from "../hooks/useJobs";

export default function JobsPage() {
  const { data, isLoading, isError, error } = useJobs();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Link href="/jobs/new">
          <Button>Create Job</Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-slate-300">
          <Spinner /> Loading jobs...
        </div>
      )}

      {isError && (
        <div className="rounded border border-rose-700 bg-rose-950 p-3 text-rose-200">
          Failed to load jobs: {error?.message}
        </div>
      )}

      {!isLoading && !isError && <JobList jobs={data?.data || []} />}
    </section>
  );
}
