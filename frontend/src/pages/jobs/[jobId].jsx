import { useRouter } from "next/router";
import JobDetailPage from "../JobDetailPage";

export default function JobDetailRoute() {
  const router = useRouter();
  const { jobId } = router.query;
  return <JobDetailPage jobId={jobId} />;
}
