interface KeyTakeawaysProps {
  title?: string;
  takeaways: string[];
  footer?: React.ReactNode;
}

export default function KeyTakeaways({
  title = "Key Takeaways",
  takeaways,
  footer,
}: KeyTakeawaysProps) {
  return (
    <div className="bg-[#1A1D27] rounded-2xl border border-white/[0.06] border-t-2 border-t-[#2DD4A8] shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#2DD4A8] mb-4">
        {title}
      </p>
      <ol className="space-y-3">
        {takeaways.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-[13px] font-semibold text-[#2DD4A8] leading-snug tabular-nums shrink-0">
              {i + 1}.
            </span>
            <p className="text-[13px] text-[#8B93A7] leading-snug">{item}</p>
          </li>
        ))}
      </ol>
      {footer && (
        <div className="mt-4 flex justify-end">
          {footer}
        </div>
      )}
    </div>
  );
}
