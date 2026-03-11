"use client";

import { useState } from "react";

interface ContextualSidebarProps {
  content: string;
}

export default function ContextualSidebar({ content }: ContextualSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-[10px] font-semibold uppercase tracking-widest text-[#2DD4A8] hover:opacity-80 transition-opacity"
      >
        {open ? "Hide \u2191" : "What this means \u2193"}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"}`}
      >
        <div className="border-l-2 border-[#2DD4A8] bg-[#13161F] rounded-r-lg pl-4 pr-3 py-3">
          <p className="text-[12px] text-[#8B93A7] leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}
