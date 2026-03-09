export function Testimonial() {
  return (
    <section className="py-12 bg-[#f5f7fb]">
      <div className="max-w-[1400px] mx-auto px-8">

        <div className="bg-white border border-gray-200 rounded-xl p-10 relative">

          
          <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-l-xl"></div>

          <p className="text-lg text-gray-800 leading-relaxed max-w-[1000px]">
            “BaikalSphere didn’t just automate our bookkeeping, it completely
            restructured how we view financial data. We moved from reactive
            reporting to predictive strategy in under three months.”
          </p>

          <div className="mt-6">
            <p className="font-semibold text-[#0f172a]">
              Vikram Singh Chauhan
            </p>

            <p className="text-gray-500 text-sm">
              CEO, Nile Hospitality LLP
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}