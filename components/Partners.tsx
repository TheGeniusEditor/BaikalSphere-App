import Image from "next/image";

export default function Partners() {

  const logos = [
    "nile.jpg",
    "hampton.png",
    "radisson.jpg",
    "wyndham.png",
    "ramada.jpg",
    "daysinn.png",
    "hyatt.jpg",
  ];

  return (
    <section className="py-16 bg-white text-center border-t">

      <p className="text-xs tracking-[4px] text-gray-500 mb-10">
        HOSPITALITY PARTNERS & DEPLOYMENTS
      </p>

      <div className="flex justify-center items-center gap-12 flex-wrap">

        {logos.map((logo, i) => (
          <Image
            key={i}
            src={`/logos/${logo}`}
            width={110}
            height={50}
            alt="partner"
          />
        ))}

      </div>
    </section>
  );
}