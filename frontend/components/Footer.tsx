import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#f5f7fb] pt-20 pb-10">

      <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-4 gap-16">
        <div>

        <div className="flex items-center gap-2">

       
        <Image
            src="/logo-icon.png"
            alt="BaikalSphere"
            width={60}
            height={60}
        />

       
        <div className="flex flex-col justify-center leading-tight">

            <span className="text-[28px] font-semibold text-[#0b1b33]">
            BaikalSphere
            </span>

            <span className="text-[12px] italic text-gray-500">
            Beyond Operational Depth. Into Simplicity.
            </span>

        </div>

        </div>

          <p className="text-gray-600 mt-4 text-sm leading-relaxed">
            Pioneering the future of work through actionable,
            intelligent automation.
          </p>

        </div>

        <div>
          <h4 className="font-semibold text-[#0f172a] mb-4">Solutions</h4>

          <ul className="space-y-3 text-gray-600 text-sm">
            <li>Banking Reconciliation</li>
            <li>Hospitality HR</li>
            <li>Data Fabric</li>
            <li>Manufacturing Ops</li>
          </ul>
        </div>

        
        <div>
          <h4 className="font-semibold text-[#0f172a] mb-4">Company</h4>

          <ul className="space-y-3 text-gray-600 text-sm">
            <li>About Us</li>
            <li>Leadership</li>
            <li>Careers</li>
            <li>Contact</li>
          </ul>
        </div>

      
        <div>
          <h4 className="font-semibold text-[#0f172a] mb-4">Legal</h4>

          <ul className="space-y-3 text-gray-600 text-sm">
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Security</li>
          </ul>
        </div>

      </div>

  
      <div className="max-w-[1400px] mx-auto px-8 mt-16 border-t pt-6 text-center text-sm text-gray-500">
        © 2024 BaikalSphere. All rights reserved.
      </div>

    </footer>
  );
}