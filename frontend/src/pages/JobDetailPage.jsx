import { useEffect, useState } from "react";
import Link from "next/link";
import CandidateList from "../components/candidates/CandidateList";
import TaskStatusBadge from "../components/tasks/TaskStatusBadge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import { useJob, useCreateSourcingTask } from "../hooks/useJobs";
import { useJobCandidates } from "../hooks/useCandidates";
import useTask from "../hooks/useTask";

export default function JobDetailPage({ jobId }) {
  const { data: job, isLoading: isJobLoading } = useJob(jobId);
  const candidatesQuery = useJobCandidates(jobId);
  const createSourcingTask = useCreateSourcingTask(jobId);

  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [activeTaskId, setActiveTaskId] = useState("");
  const { task, isPolling } = useTask(activeTaskId);

  useEffect(() => {
    if (task?.status === "completed") {
      candidatesQuery.refetch();
    }
  }, [task?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSourceCandidates() {
    const response = await createSourcingTask.mutateAsync({ query, limit: Number(limit || 10) });
    setActiveTaskId(response.taskId);
    setIsSourceModalOpen(false);
  }

  return (
    <section className="space-y-6">
      {isJobLoading ? (
        <div className="flex items-center gap-2">
          <Spinner /> Loading job details...
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h1 className="text-2xl font-bold">{job?.title}</h1>
          <p className="mt-2 text-slate-300">{job?.description}</p>
          <p className="mt-2 text-sm text-slate-400">
            {job?.location || "Unknown location"} • {job?.type || "n/a"} • {job?.status || "n/a"}
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setIsSourceModalOpen(true)}>Source Candidates</Button>
            <Link href="/">
              <Button variant="secondary">Back to Jobs</Button>
            </Link>
          </div>
        </div>
      )}

      {(activeTaskId || task) && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-300">Task ID: {activeTaskId}</p>
          <div className="mt-2 flex items-center gap-2">
            <TaskStatusBadge status={task?.status || "queued"} />
            {isPolling && <span className="text-sm text-slate-400">Polling every 3s...</span>}
          </div>
          {task?.error ? <p className="mt-2 text-sm text-rose-300">{task.error}</p> : null}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-xl font-semibold">Candidates</h2>
        {candidatesQuery.isLoading ? (
          <div className="flex items-center gap-2">
            <Spinner /> Loading candidates...
          </div>
        ) : (
          <CandidateList candidates={candidatesQuery.data?.data || []} />
        )}
      </div>

      <Modal isOpen={isSourceModalOpen} title="Source Candidates" onClose={() => setIsSourceModalOpen(false)}>
        <div className="space-y-3">
          <label className="block text-sm">
            Query (optional)
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Lead MERN developer LinkedIn profile"
            />
          </label>
          <label className="block text-sm">
            Limit
            <input
              type="number"
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
              value={limit}
              min={1}
              max={50}
              onChange={(e) => setLimit(e.target.value)}
            />
          </label>
          <Button onClick={onSourceCandidates} disabled={createSourcingTask.isPending}>
            {createSourcingTask.isPending ? "Queuing..." : "Confirm"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
