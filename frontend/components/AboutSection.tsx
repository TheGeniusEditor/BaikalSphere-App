import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="py-12 bg-[#f5f7fb]">
      <div className="max-w-[1400px] mx-auto px-8">

       
        <div className="text-center max-w-[800px] mx-auto">

          <h1 className="text-[42px] font-extrabold text-[#0f172a]">
            Empowering the Autonomous Enterprise
          </h1>

          <p className="text-gray-600 text-lg mt-6 leading-relaxed">
            We are building the neural network for modern business, enabling
            organizations to move faster, smarter, and more efficiently.
          </p>

        </div>

       
        <div className="border-t border-gray-200 mt-12"></div>

        
        <div className="grid md:grid-cols-2 gap-12 mt-16 items-center">

          
          <div>

            <h2 className="text-2xl font-semibold text-[#0f172a]">
              Our Story
            </h2>

            <p className="text-gray-600 mt-6 leading-relaxed">
              BaikalSphere AI Automation Private Limited is built on a simple
              belief: modern enterprises do not fail due to lack of data or
              effort — they struggle because complexity slows them down.
            </p>

            <p className="text-gray-600 mt-4 leading-relaxed">
              We design intelligent automation platforms that help organizations
              eliminate fragmented workflows, reduce manual dependencies, and
              establish a single, reliable operational backbone across finance,
              operations, analytics, and decision-making.
            </p>

            <p className="text-gray-600 mt-4 leading-relaxed">
              Our name represents depth, continuity, and flow — just like a deep
              river that moves powerfully yet smoothly. BaikalSphere brings that
              same discipline and structure to enterprise operations.
            </p>

          </div>

          
          <div className="rounded-2xl overflow-hidden shadow-lg">

            <Image
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200"
              alt="Team collaboration"
              width={800}
              height={500}
              className="w-full h-[420px] object-cover"
            />

          </div>

        </div>

      </div>
    </section>
  );
}