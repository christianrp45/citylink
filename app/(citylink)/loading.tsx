export default function CityLinkLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 pb-24">
      <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      <p className="text-sm text-slate-400 font-medium">Carregando...</p>
    </div>
  );
}
