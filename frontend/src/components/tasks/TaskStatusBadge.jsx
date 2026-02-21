import Badge from "../ui/Badge";
import Spinner from "../ui/Spinner";

export default function TaskStatusBadge({ status }) {
  if (!status) return null;

  if (status === "queued") {
    return (
      <span className="inline-flex items-center gap-2">
        <Spinner className="h-3.5 w-3.5" />
        <Badge color="slate">queued</Badge>
      </span>
    );
  }

  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-2">
        <Spinner className="h-3.5 w-3.5" />
        <Badge color="blue">processing</Badge>
      </span>
    );
  }

  if (status === "completed") {
    return <Badge color="green">completed</Badge>;
  }

  return <Badge color="red">failed</Badge>;
}
