export default function TechnicalFoundation() {
  return (
    <section className="py-28 bg-[#ffffff]">

      <div className="max-w-[1400px] mx-auto px-8">

        {/* Heading */}
        <div className="text-center max-w-[700px] mx-auto">
          <h2 className="text-[40px] font-bold text-[#0f172a]">
            Technical Foundation
          </h2>

          <p className="text-gray-600 mt-4 text-lg">
            Engineered for mission-critical scale and reliability.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-12 mt-20">

          {/* Item */}
          <div>
            <div className="w-10 h-[3px] bg-blue-600 mb-6"></div>

            <h3 className="font-semibold text-lg text-[#0f172a]">
              API-First Architecture
            </h3>

            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              Fully headless capability allows you to embed our logic into your
              custom internal tools.
            </p>
          </div>

          {/* Item */}
          <div>
            <div className="w-10 h-[3px] bg-blue-600 mb-6"></div>

            <h3 className="font-semibold text-lg text-[#0f172a]">
              Global Compliance
            </h3>

            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              Pre-configured modules for GDPR, CCPA, and industry-specific
              regulations.
            </p>
          </div>

          {/* Item */}
          <div>
            <div className="w-10 h-[3px] bg-blue-600 mb-6"></div>

            <h3 className="font-semibold text-lg text-[#0f172a]">
              99.99% Uptime
            </h3>

            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              Redundant infrastructure across multiple AWS availability zones
              ensures always-on operation.
            </p>
          </div>

          {/* Item */}
          <div>
            <div className="w-10 h-[3px] bg-blue-600 mb-6"></div>

            <h3 className="font-semibold text-lg text-[#0f172a]">
              Data Sovereignty
            </h3>

            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              Choose where your data resides (US, EU, APAC) to meet local
              residency laws.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}

export function DemoCTA() {
  return (
    <section className="py-24 bg-[#f5f7fb]">

      <div className="max-w-[800px] mx-auto text-center px-6">

        <h2 className="text-[36px] font-bold text-[#0f172a]">
          See it in action
        </h2>

        <p className="text-gray-600 mt-4 text-lg">
          Schedule a personalized demo to see how BaikalSphere fits into your
          specific infrastructure.
        </p>

        <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold">
          Book Demo
        </button>

      </div>

    </section>
  );
}