import Badge from "../ui/Badge";

function scoreColor(score = 0) {
  if (score <= 40) return "red";
  if (score <= 70) return "yellow";
  return "green";
}

export default function ScoreDisplay({ aiScore }) {
  if (!aiScore?.score && aiScore?.score !== 0) {
    return <Badge color="slate">Not scored</Badge>;
  }

  return (
    <div className="space-y-2">
      <Badge color={scoreColor(aiScore.score)}>Score: {aiScore.score}</Badge>
      <p className="text-sm text-slate-300">{aiScore.reasoning || "No reasoning provided."}</p>
    </div>
  );
}
