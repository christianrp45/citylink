export default function BibleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-20">
        {children}
      </div>
    </div>
  );
}
