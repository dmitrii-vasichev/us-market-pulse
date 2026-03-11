interface NarrativeHeaderProps {
  sectionLabel: string;
  narrative: string;
  updatedLine: string;
}

export default function NarrativeHeader({
  sectionLabel,
  narrative,
  updatedLine,
}: NarrativeHeaderProps) {
  return (
    <div className="bg-[#1A1D27] rounded-2xl border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-5 border-l-2 border-l-[#2DD4A8]">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#555D73] mb-3">
        {sectionLabel}
      </p>
      <p className="text-[15px] leading-relaxed text-[#C8D0DC]">
        {narrative}
      </p>
      <p className="text-[10px] text-[#555D73] mt-3">
        {updatedLine}
      </p>
    </div>
  );
}
