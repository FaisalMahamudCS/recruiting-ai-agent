import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import ScoreDisplay from "../components/candidates/ScoreDisplay";
import TaskStatusBadge from "../components/tasks/TaskStatusBadge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import { useCandidate, useScoreCandidate, useSendOutreach, useSimulateResponse } from "../hooks/useCandidates";
import useTask from "../hooks/useTask";

export default function CandidateDetailPage({ candidateId }) {
  const router = useRouter();
  const jobId = router.query.jobId;
  const { candidate, isLoading, isError } = useCandidate(candidateId, jobId);
  const scoreMutation = useScoreCandidate(candidateId);
  const outreachMutation = useSendOutreach(candidateId);
  const responseMutation = useSimulateResponse(candidateId);

  const [responseMessage, setResponseMessage] = useState("I am interested, can we schedule a call?");
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState("");
  const { task, isPolling } = useTask(activeTaskId);

  useEffect(() => {
    if (!router.isReady) return;
    const taskIdFromQuery = typeof router.query.taskId === "string" ? router.query.taskId : "";
    if (taskIdFromQuery && taskIdFromQuery !== activeTaskId) {
      setActiveTaskId(taskIdFromQuery);
    }
  }, [router.isReady, router.query.taskId, activeTaskId]);

  const actionError = useMemo(
    () =>
      scoreMutation.error?.response?.data?.error ||
      outreachMutation.error?.response?.data?.error ||
      responseMutation.error?.response?.data?.error,
    [scoreMutation.error, outreachMutation.error, responseMutation.error]
  );

  async function onScore() {
    const result = await scoreMutation.mutateAsync();
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, taskId: result.taskId }
      },
      undefined,
      { shallow: true }
    );
    setActiveTaskId(result.taskId);
  }

  async function onOutreach() {
    const result = await outreachMutation.mutateAsync(jobId || candidate?.jobId);
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, taskId: result.taskId }
      },
      undefined,
      { shallow: true }
    );
    setActiveTaskId(result.taskId);
  }

  async function onSimulateResponse() {
    const result = await responseMutation.mutateAsync(responseMessage);
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, taskId: result.taskId }
      },
      undefined,
      { shallow: true }
    );
    setActiveTaskId(result.taskId);
    setShowResponseModal(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner /> Loading candidate...
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="rounded border border-rose-700 bg-rose-950 p-3 text-rose-200">
        Candidate not found. Go back to the job and reload candidates.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h1 className="text-2xl font-bold">{candidate.name || "Unknown Candidate"}</h1>
        <p className="mt-1 text-slate-300">
          {candidate.currentTitle || "Unknown Title"} at {candidate.currentCompany || "Unknown Company"}
        </p>
        <p className="mt-2 text-sm text-slate-400">Status: {candidate.status}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={onScore} disabled={scoreMutation.isPending}>
            {scoreMutation.isPending ? "Queuing..." : "Score Candidate"}
          </Button>
          <Button variant="secondary" onClick={onOutreach} disabled={outreachMutation.isPending}>
            {outreachMutation.isPending ? "Queuing..." : "Send Outreach"}
          </Button>
          <Button variant="secondary" onClick={() => setShowResponseModal(true)}>
            Simulate Response
          </Button>
          <Link href={jobId ? `/jobs/${jobId}` : "/"}>
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-2 text-lg font-semibold">AI Score</h2>
        <ScoreDisplay aiScore={candidate.aiScore} />
      </div>

      {(activeTaskId || task) && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-300">Task ID: {activeTaskId}</p>
          <div className="mt-2 flex items-center gap-2">
            <TaskStatusBadge status={task?.status || "queued"} />
            {isPolling && <span className="text-sm text-slate-400">Polling every 3s...</span>}
          </div>
          {task?.result?.intent ? (
            <p className="mt-2 text-sm text-emerald-300">
              Intent: {task.result.intent} {task.result.schedulingLink ? `• ${task.result.schedulingLink}` : ""}
            </p>
          ) : null}
          {task?.error ? <p className="mt-2 text-sm text-rose-300">{task.error}</p> : null}
        </div>
      )}

      {actionError ? (
        <div className="rounded border border-rose-700 bg-rose-950 p-3 text-rose-200">{actionError}</div>
      ) : null}

      <Modal isOpen={showResponseModal} title="Simulate Candidate Response" onClose={() => setShowResponseModal(false)}>
        <div className="space-y-3">
          <textarea
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
            rows={4}
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
          />
          <Button onClick={onSimulateResponse} disabled={responseMutation.isPending}>
            {responseMutation.isPending ? "Queuing..." : "Submit"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
