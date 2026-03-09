export default function Hero() {
  return (
    <section className="relative bg-[#c9d7e4] py-36 overflow-hidden">

      
      <div className="absolute inset-0 bg-[radial-gradient(#9fb3c8_1px,transparent_1px)] [background-size:22px_22px] opacity-40"></div>

      <div className="relative max-w-[900px] mx-auto text-center px-6">

        <h1 className="text-[56px] font-extrabold text-[#0f172a] leading-[1.1] tracking-tight">
          Transforming Enterprises with
          
          Scalable AI Automation
        </h1>

        <p className="mt-8 text-[18px] text-gray-600 leading-relaxed max-w-[720px] mx-auto">
          From financial reconciliation to workforce logistics, scalable AI
          automation transforms enterprise data into coordinated strategy—
          designing, orchestrating, and executing complex operations with
          precision at scale
        </p>

        <div className="mt-12 flex justify-center gap-6">

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold shadow-sm">
            Explore Solutions
          </button>

          <button className="border border-gray-400 px-8 py-4 rounded-lg font-semibold text-gray-700 hover:bg-gray-100">
            Schedule Demo
          </button>

        </div>

      </div>

    </section>
  );
}