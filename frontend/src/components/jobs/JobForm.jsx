import { useState } from "react";
import Button from "../ui/Button";

export default function JobForm({ onSubmit, loading }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("remote");
  const [reqInput, setReqInput] = useState("");
  const [requirements, setRequirements] = useState([]);

  function addRequirement() {
    const value = reqInput.trim();
    if (!value) return;
    setRequirements((prev) => [...prev, value]);
    setReqInput("");
  }

  function removeRequirement(index) {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({ title, description, location, type, requirements });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div>
        <label className="mb-1 block text-sm">Title</label>
        <input
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">Description</label>
        <textarea
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">Requirements</label>
        <div className="flex gap-2">
          <input
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
            value={reqInput}
            onChange={(e) => setReqInput(e.target.value)}
            placeholder="Add requirement"
          />
          <Button type="button" variant="secondary" onClick={addRequirement}>
            Add
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {requirements.map((item, index) => (
            <button
              type="button"
              key={`${item}-${index}`}
              className="rounded-full bg-slate-700 px-3 py-1 text-xs"
              onClick={() => removeRequirement(index)}
            >
              {item} x
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Location</label>
          <input
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Type</label>
          <select
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="remote">remote</option>
            <option value="onsite">onsite</option>
            <option value="hybrid">hybrid</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Job"}
      </Button>
    </form>
  );
}
