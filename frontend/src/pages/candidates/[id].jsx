import { useRouter } from "next/router";
import CandidateDetailPage from "../CandidateDetailPage";

export default function CandidateDetailRoute() {
  const router = useRouter();
  const { id } = router.query;
  return <CandidateDetailPage candidateId={id} />;
}
