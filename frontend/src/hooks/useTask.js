import { useEffect, useState } from "react";
import client from "../api/client";

export default function useTask(taskId) {
  const [task, setTask] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!taskId) return;
    let active = true;
    setError("");
    setIsPolling(true);

    const fetchTask = async () => {
      try {
        const res = await client.get(`/api/tasks/${taskId}`);
        if (!active) return;

        const nextTask = res.data.data;
        setTask(nextTask);
        if (["completed", "failed"].includes(nextTask.status)) {
          setIsPolling(false);
          clearInterval(interval);
        }
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.error || err.message || "Failed to poll task");
        setIsPolling(false);
      }
    };

    fetchTask();
    const interval = setInterval(fetchTask, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [taskId]);

  return { task, isPolling, error };
}
