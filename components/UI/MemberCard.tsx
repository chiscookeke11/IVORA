import { team_data_type } from "@/types/types";
import Image from "next/image";

interface MemberCardProps {
  data: team_data_type;
}

export default function MemberCard({ data }: MemberCardProps) {
  return (
    <div className="relative h-100 w-full max-w-[320px] shrink-0 overflow-hidden rounded-2xl">
      <Image
        src="/background-images/team-card-bg.png"
        alt="bg"
        fill
        className="object-cover object-center"
      />

      <div className="absolute top-0 left-0 h-full w-full bg-black/45" />

      <div className="absolute inset-0 flex h-full w-full flex-col items-start justify-end px-4 py-6">
        <Image
          src={data.image}
          alt={data.name}
          width={500}
          height={500}
          className="mb-6 h-70 w-full rounded-md object-cover object-center"
        />

        <h4 className="font-sans text-base font-semibold tracking-wide text-white md:text-xl">
          {data.name}
        </h4>
        <p className="font-source-serif text-sm font-normal text-white/60 md:text-base">
          {data.role}
        </p>
      </div>
    </div>
  );
}