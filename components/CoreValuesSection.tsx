import Link from "next/link";

export default function CoreValuesSection() {
  return (
    <section className="py-12 bg-[#f5f7fb]">
      <div className="max-w-[1400px] mx-auto px-8">

        {/* Heading */}
        <div className="text-center max-w-[700px] mx-auto">
          <h2 className="text-[38px] font-bold text-[#0f172a]">
            Our Core Values
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            The principles that guide every line of code we write.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-10 mt-16">

          {/* Card 1 */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-md transition">
            <p className="text-blue-600 font-semibold mb-3">→ Radical Transparency</p>

            <p className="text-gray-600 text-sm leading-relaxed">
              Clarity over complexity. We believe trust is built when systems are
              understandable, decisions are explainable, and outcomes are measurable.
              From AI-driven recommendations to pricing, SLAs, and performance metrics,
              we design everything to be visible, auditable, and explainable.
            </p>

            <ul className="mt-4 text-gray-600 text-sm space-y-1">
              <li>• Clear data lineage and decision traceability</li>
              <li>• No hidden costs, no opaque algorithms</li>
              <li>• Dashboards that show why, not just what</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-md transition">
            <p className="text-blue-600 font-semibold mb-3">→ Security First</p>

            <p className="text-gray-600 text-sm leading-relaxed">
              Security is not a layer. It is the architecture. We operate with the
              mindset of regulated industries — banking, insurance, healthcare, and
              critical infrastructure.
            </p>

            <ul className="mt-4 text-gray-600 text-sm space-y-1">
              <li>• Zero-trust architecture and least-privilege access</li>
              <li>• Enterprise-grade encryption</li>
              <li>• Built-in compliance readiness (ISO, SOC, GDPR)</li>
              <li>• Continuous monitoring and auditability</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-md transition">
            <p className="text-blue-600 font-semibold mb-3">→ Pragmatic Innovation</p>

            <p className="text-gray-600 text-sm leading-relaxed">
              Innovation that delivers outcomes, not demos. We build technology to
              work at scale under load and under pressure.
            </p>

            <ul className="mt-4 text-gray-600 text-sm space-y-1">
              <li>• AI where it adds measurable value</li>
              <li>• Automation where it reduces risk and effort</li>
              <li>• Proven architectures over novelty</li>
              <li>• Reliability and cost efficiency first</li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-md transition">
            <p className="text-blue-600 font-semibold mb-3">→ Customer Partnership</p>

            <p className="text-gray-600 text-sm leading-relaxed">
              We don’t ship and disappear. We operate together as long-term
              partners — understanding your business processes, constraints,
              and accountability structures.
            </p>

            <ul className="mt-4 text-gray-600 text-sm space-y-1">
              <li>• Shared ownership of outcomes</li>
              <li>• Deep integration with your operating model</li>
              <li>• Proactive optimization and continuous improvement</li>
            </ul>
          </div>

        </div>

        {/* Join the Mission CTA */}
        <div className="mt-16 bg-white border border-gray-200 rounded-xl px-8 py-6 flex items-center justify-between flex-col md:flex-row gap-4">
          <div>
            <h3 className="font-semibold text-lg text-[#0f172a]">
              Join the Mission
            </h3>
            <p className="text-gray-600 text-sm">
              We are always looking for brilliant minds to help us automate the world.
            </p>
          </div>

          <Link
            href="/careers"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold"
          >
            View Open Roles
          </Link>
        </div>

      </div>
    </section>
  );
}