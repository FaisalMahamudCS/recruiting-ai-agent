import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-sky-400">
          Recruiting Automation
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/">Jobs</Link>
          <Link href="/jobs/new">Create Job</Link>
        </div>
      </nav>
    </header>
  );
}
