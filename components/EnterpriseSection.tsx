export default function EnterpriseSection() {
  return (
    <section className="py-12 bg-[#f5f7fb]">

      <div className="max-w-[1400px] mx-auto px-8">

        {/* Impact by Numbers */}
        <div className="bg-white border border-gray-200 rounded-2xl px-10 py-10 grid grid-cols-5 items-center gap-8">

          <div>
            <h3 className="text-xl font-semibold text-[#0f172a]">
              Impact by the Numbers
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              Tangible ROI within the first 90 days of deployment.
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-600">85%</h2>
            <p className="text-gray-600 text-sm mt-1">
              Reduction in Manual Entry
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-600">12×</h2>
            <p className="text-gray-600 text-sm mt-1">
              Faster Processing Speed
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-600">0%</h2>
            <p className="text-gray-600 text-sm mt-1">
              Compliance Errors
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-600">$2M+</h2>
            <p className="text-gray-600 text-sm mt-1">
              Avg. Annual Savings
            </p>
          </div>

        </div>

        {/* Enterprise Heading */}
        <div className="text-center mt-24">

          <h2 className="text-[42px] font-bold text-[#0f172a]">
            Built for the Enterprise
          </h2>

          <p className="text-gray-600 mt-4 text-lg">
            Security, scalability, and control are not optional.
          </p>

        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-10 mt-16">

          {/* Card 1 */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-lg">

            <h3 className="text-xl font-semibold text-[#0f172a]">
              Bank-Grade Security
            </h3>

            <p className="mt-4 text-gray-600 leading-relaxed">
              SOC 2 Type II certified and protected with AES-256 encryption,
              our platform is engineered to safeguard sensitive financial and
              operational data. Security controls are embedded at every layer,
              ensuring data integrity, privacy, and compliance with the
              standards expected of global financial institutions.
            </p>

          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-lg">

            <h3 className="text-xl font-bold text-[#0f172a]">
              Real-Time Sync
            </h3>

            <p className="mt-4 text-gray-600 leading-relaxed">
              Move beyond batch processing and delayed insights. Our
              event-driven architecture responds instantly to API webhooks and
              system events, enabling automation to act the moment conditions
              change—keeping operations continuously aligned with real-time
              business activity.
            </p>

          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-lg">

            <h3 className="text-xl font-semibold text-[#0f172a]">
              Low-Code Control
            </h3>

            <p className="mt-4 text-gray-600 leading-relaxed">
              Maintain strong IT governance while empowering business teams to
              move faster. Low-code configuration allows operations leaders to
              adjust logic, thresholds, and workflows without writing code,
              while IT retains full oversight, security, and change control.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}