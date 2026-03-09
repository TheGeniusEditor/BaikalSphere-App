import Image from "next/image";

export default function Logo() {
  return (
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
  );
}