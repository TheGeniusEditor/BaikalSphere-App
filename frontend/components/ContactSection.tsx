"use client";

import { useState } from "react";

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Request a Demo",
    message: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <section className="py-12 bg-[#f5f7fb]">
      <div className="max-w-[1400px] mx-auto px-8">

        
        <div className="text-center max-w-[700px] mx-auto">
          <h1 className="text-[40px] font-extrabold text-[#0f172a]">
            Get in Touch
          </h1>

          <p className="text-gray-600 mt-4 text-lg">
            Ready to automate? Our team is ready to analyze your workflows
            and propose a custom solution.
          </p>
        </div>

        
        <div className="grid md:grid-cols-2 gap-10 mt-16">

          
          <div className="bg-white border border-gray-200 rounded-xl p-8">

            <div className="mb-8">
              <h3 className="text-blue-600 font-semibold">
                Headquarters
              </h3>

              <p className="text-gray-700 mt-2">
                Bangalore KA
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-blue-600 font-semibold">
                Contact
              </h3>

              <p className="text-gray-700 mt-2">
                <strong>Sales:</strong> sales@baikalsphere.com
              </p>

              <p className="text-gray-700">
                <strong>Support:</strong> support@baikalsphere.com
              </p>
            </div>

            <div>
              <h3 className="text-blue-600 font-semibold">
                Global Presence
              </h3>

              <p className="text-gray-700 mt-2">
                We serve clients in North America, EMEA, and APAC regions.
              </p>
            </div>

          </div>

          
          <div className="bg-white border border-gray-200 rounded-xl p-8">

            <h3 className="text-xl font-semibold mb-6 text-gray-600">
              Send us a message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label className="text-sm text-gray-600">
                  Full Name
                </label>

                <input
                  name="name"
                  placeholder="Jane Smith"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Work Email
                </label>

                <input
                  name="email"
                  placeholder="jane@company.com"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Subject
                </label>

                <select
                  name="subject"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 mt-1"
                >
                  <option>Request a Demo</option>
                  <option>Sales Inquiry</option>
                  <option>Technical Support</option>
                  <option>Partnership</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Message
                </label>

                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us about your automation needs..."
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 mt-1"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              >
                Send Message
              </button>

            </form>

          </div>

        </div>

      </div>
    </section>
  );
}