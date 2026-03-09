import Image from "next/image";
import Link from "next/link";

const industries = [
  {
    category: "FINANCIAL SERVICES",
    title: "Banking & Financial Services",
    description:
      "Modernize legacy banking cores. Automate high-volume transaction processing, fraud detection, and regulatory reporting with zero error tolerance.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
    workflows: [
      "Automated Loan Origination",
      "Fraud Detection & AML",
      "Regulatory Reporting (Basel III)",
    ],
  },
  {
    category: "SERVICE & TRAVEL",
    title: "Hospitality & Travel",
    description:
      "Elevate the guest experience. Synchronize booking engines with front-desk operations and automate housekeeping schedules.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    workflows: [
      "Dynamic Room Pricing",
      "Housekeeping Auto-Scheduling",
      "Guest Check-in Automation",
    ],
  },
  {
    category: "HEAVY INDUSTRY",
    title: "Industrial Manufacturing",
    description:
      "Reduce downtime and optimize inventory. AI analyzes sensor data to predict failures and automate supply chain processes.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
    workflows: [
      "Predictive Maintenance",
      "Autonomous Inventory Reordering",
      "Real-Time Fleet Routing",
    ],
  },
  {
    category: "RETAIL",
    title: "Global Retail & E-Commerce",
    description:
      "Sync inventory across marketplaces while automating fulfillment decisions based on demand and shipping costs.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    workflows: [
      "Dynamic Fulfillment Routing",
      "Omnichannel Inventory Sync",
      "Automated Returns Processing",
    ],
  },
];

export default function IndustriesSection() {
  return (
    <section className="py-12 bg-[#f5f7fb]">
      <div className="max-w-[1500px] mx-auto px-8">

        {/* Heading */}
        <div className="text-center max-w-[750px] mx-auto">
          <h1 className="text-[40px] font-extrabold text-[#0f172a]">
            Specialized Solutions
          </h1>

          <p className="text-gray-600 mt-4 text-lg">
            From the shop floor to the boardroom, we apply our automation
            framework to the unique constraints of your sector.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-4 gap-10 mt-16">

          {industries.map((industry, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden 
              hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <Image
                src={industry.image}
                width={400}
                height={220}
                alt={industry.title}
                className="w-full h-[180px] object-cover"
              />

              <div className="p-6">

                <p className="text-blue-600 text-xs font-semibold tracking-widest">
                  {industry.category}
                </p>

                <h3 className="text-gray-600 text-lg font-semibold mt-2">
                  {industry.title}
                </h3>

                <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                  {industry.description}
                </p>

                <div className="bg-[#f5f7fb] rounded-lg p-4 mt-5">
                  <p className="text-xs font-semibold mb-2 text-gray-700">
                    KEY WORKFLOWS
                  </p>

                  <ul className="text-sm text-gray-600 space-y-1">
                    {industry.workflows.map((workflow, i) => (
                      <li key={i}>• {workflow}</li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="#"
                  className="text-blue-600 text-sm mt-4 inline-block"
                >
                  Explore Solutions →
                </Link>

              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}