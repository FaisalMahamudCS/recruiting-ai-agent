import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await client.get("/api/jobs");
      return res.data;
    }
  });
}

export function useJob(jobId) {
  return useQuery({
    queryKey: ["job", jobId],
    enabled: Boolean(jobId),
    queryFn: async () => {
      const res = await client.get(`/api/jobs/${jobId}`);
      return res.data.data;
    }
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await client.post("/api/jobs", payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    }
  });
}

export function useCreateSourcingTask(jobId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await client.post(`/api/jobs/${jobId}/sourcing-tasks`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    }
  });
}
