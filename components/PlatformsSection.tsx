export default function PlatformsSection() {
  return (
    <section className="py-12 bg-[#f5f7fb]">

      <div className="max-w-[1400px] mx-auto px-8">

        
        <div className="text-center max-w-[800px] mx-auto">
          <h1 className="text-[44px] font-extrabold text-[#0f172a]">
            The BaikalSphere Suite
          </h1>

          <p className="mt-6 text-gray-600 text-lg leading-relaxed">
            Three specialized engines. One unified ecosystem. Designed to
            autonomously manage the most complex workflows in your enterprise.
          </p>
        </div>

        
        <div className="grid md:grid-cols-3 gap-10 mt-20">

          
          <div className="bg-white border border-gray-200 rounded-xl p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-lg">

            <p className="text-blue-600 text-xs font-semibold tracking-widest">
              FINANCIAL AUTOMATION
            </p>

            <h3 className="text-2xl font-bold mt-3 text-[#0f172a]">
              FinCore
            </h3>

            <p className="text-gray-600 mt-4 leading-relaxed">
              Autonomous financial reconciliation engine that understands
              ledger context to automate the close process.
            </p>

            <div className="mt-6 bg-[#f5f7fb] rounded-lg p-5">
              <ul className="space-y-3 text-gray-700 text-sm">
                <li>✓ Continuous Close</li>
                <li>✓ Smart Matching (99%)</li>
                <li>✓ Variance Control</li>
                <li>✓ Immutable Audit Trail</li>
              </ul>
            </div>

          </div>

          
          <div className="bg-white border border-gray-200 rounded-xl p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-lg">

            <p className="text-blue-600 text-xs font-semibold tracking-widest">
              WORKFORCE ORCHESTRATION
            </p>

            <h3 className="text-2xl font-bold mt-3 text-[#0f172a]">
              H-Suite
            </h3>

            <p className="text-gray-600 mt-4 leading-relaxed">
              Handles the complexity of high-velocity hourly workforce
              management, scheduling, and payroll integration.
            </p>

            <div className="mt-6 bg-[#f5f7fb] rounded-lg p-5">
              <ul className="space-y-3 text-gray-700 text-sm">
                <li>✓ Predictive Staffing</li>
                <li>✓ Instant Payroll Calc</li>
                <li>✓ Mobile Self-Service</li>
                <li>✓ Auto-Compliance</li>
              </ul>
            </div>

          </div>

          
          <div className="bg-white border border-gray-200 rounded-xl p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-lg">

            <p className="text-blue-600 text-xs font-semibold tracking-widest">
              UNIFIED INTELLIGENCE
            </p>

            <h3 className="text-2xl font-bold mt-3 text-[#0f172a]">
              DataSphere
            </h3>

            <p className="text-gray-600 mt-4 leading-relaxed">
              Creates a unified semantic layer across disparate data sources,
              enabling natural language BI.
            </p>

            <div className="mt-6 bg-[#f5f7fb] rounded-lg p-5">
              <ul className="space-y-3 text-gray-700 text-sm">
                <li>✓ Natural Language BI</li>
                <li>✓ Data Virtualization</li>
                <li>✓ Row-Level Security</li>
                <li>✓ Anomaly Detection</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}