import { CircleAlert } from "lucide-react";

function EmptyState({
  title = "Nothing here yet",
  description = "Try exploring something else.",
}) {
  return (
    <div className="min-h-[220px] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[320px] text-center">
        <CircleAlert className="mx-auto h-9 w-9 text-slate-500" />
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export default EmptyState;
