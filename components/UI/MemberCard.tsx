import { team_data_type } from "@/types/types";
import Image from "next/image";



interface MemberCardProps {
    data: team_data_type
}

export default function MemberCard({ data }: MemberCardProps) {
    return (
        <div
            className="w-full max-w-[320px]   h-100 rounded-2xl relative  overflow-hidden" >
            <Image src={"/background-images/team-card-bg.png"} alt="bg" fill className="object-cover object-center" />


            {/* Dark Overlay (for readability) */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/45" />



            <div className="w-full h-full flex flex-col items-start justify-end absolute inset-0  px-4 py-6 " >

                <Image src={"/1763960275228.jpg"} alt="member" width={500} height={500} className="w-full h-70 mb-6 rounded-md " />

                <h4 className="font-sans font-semibold text-white text-base md:text-xl tracking-wide" > {data.name} </h4>
                <p className="text-sm md:text-base font-normal text-white/60 font-source-serif " >{data.role} </p>
            </div>
        </div>
    )
}