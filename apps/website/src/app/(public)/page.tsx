export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700">
        <span className="text-2xl font-bold text-white">AG</span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
        AgroConnect GH
      </h1>
      <p className="mt-4 text-lg text-gray-500">
        Rebuilding in Progress
      </p>
      <div className="mt-8 flex items-center gap-2 text-sm text-gray-400">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
        A fresh foundation is being prepared
      </div>
    </div>
  );
}