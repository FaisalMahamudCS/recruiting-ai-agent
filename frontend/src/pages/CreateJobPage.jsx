import { useRouter } from "next/router";
import JobForm from "../components/jobs/JobForm";
import { useCreateJob } from "../hooks/useJobs";

export default function CreateJobPage() {
  const router = useRouter();
  const createJob = useCreateJob();

  async function handleCreate(payload) {
    try {
      const job = await createJob.mutateAsync(payload);
      router.push(`/jobs/${job._id}`);
    } catch (_error) {
      // Error state is shown below.
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Create Job</h1>
      <JobForm onSubmit={handleCreate} loading={createJob.isPending} />
      {createJob.isError && (
        <div className="rounded border border-rose-700 bg-rose-950 p-3 text-rose-200">
          {createJob.error?.response?.data?.error || createJob.error?.message || "Failed to create job"}
        </div>
      )}
    </section>
  );
}
