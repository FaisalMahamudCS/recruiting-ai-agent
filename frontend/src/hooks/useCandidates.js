import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";

export function useJobCandidates(jobId) {
  return useQuery({
    queryKey: ["candidates", jobId],
    enabled: Boolean(jobId),
    queryFn: async () => {
      const res = await client.get(`/api/jobs/${jobId}/candidates`);
      return res.data;
    }
  });
}

export function useCandidate(candidateId, jobId) {
  const candidatesQuery = useJobCandidates(jobId);
  const candidate =
    candidatesQuery.data?.data?.find((item) => item._id === candidateId) || null;
  return { ...candidatesQuery, candidate };
}

export function useScoreCandidate(candidateId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await client.post(`/api/candidates/${candidateId}/scores`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    }
  });
}

export function useSendOutreach(candidateId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId) => {
      const res = await client.post(`/api/candidates/${candidateId}/outreach`, { jobId });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    }
  });
}

export function useSimulateResponse(candidateId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message) => {
      const res = await client.post(`/api/candidates/${candidateId}/responses`, { message });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    }
  });
}
