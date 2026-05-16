import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, FileQuestion, Zap } from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 fade-in">
      {/* Icon */}
      <div className="relative mb-8">
        <div className="h-20 w-20 rounded-3xl bg-[#F2F2EE] border border-[#E8E8E4] flex items-center justify-center">
          <FileQuestion size={32} className="text-[#CCCCBF]" strokeWidth={1.5} />
        </div>
        {/* Small brand badge */}
        <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-xl bg-[#111110] flex items-center justify-center">
          <Zap size={12} className="text-[#E8FF8B]" strokeWidth={2.5} />
        </div>
      </div>

      {/* Text */}
      <p className="text-[11px] font-medium uppercase tracking-widest text-[#AAAA9F] mb-3">
        404 — Page not found
      </p>
      <h1 className="text-[26px] font-semibold tracking-tight text-[#111110] mb-2">
        Nothing here
      </h1>
      <p className="text-[13.5px] text-[#888880] max-w-xs leading-relaxed mb-1">
        The page{" "}
        <code className="rounded-md bg-[#F2F2EE] px-1.5 py-0.5 text-[12px] font-mono text-[#555550]">
          {pathname}
        </code>{" "}
        doesn't exist or was moved.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8">
        <button
          onClick={() => navigate(-1)}
          className="btn-md btn-outline flex items-center gap-2 press"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Go back
        </button>
        <button
          onClick={() => navigate("/dashboard", { replace: true })}
          className="btn-md btn-primary press"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}