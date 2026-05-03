import { ChevronLeft, ChevronRight } from "lucide-react";
import MemberCard from "./UI/MemberCard";
import { team_members } from "@/data/team_data";



export default function Team() {
    return (
        <section className="w-full flex flex-col items-center gap-10 pl-[4%] md:pl-[15%] my-10 mt-56 " >

            <div className="w-full flex flex-col items-start gap-1 px-6" >
                <h2 className="mr-auto font-semibold text-2xl md:text-5xl font-sans text-center max-w-3xl " >Meet the Team</h2>

                <div className="ml-auto flex items-center justify-center gap-2 w-fit md:mr-[10%] " >

                    <button className=" border border-white/20 cursor-pointer size-10 rounded-full shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/12 " ><ChevronLeft size={25} /></button>

                    <button className="border border-white/20 cursor-pointer size-10 rounded-full shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/12  "><ChevronRight size={25} /></button>
                </div>
            </div>




            <div className="w-full   overflow-x-auto " >

                <div className="w-[300vw] flex gap-8 h-fit py-8 px-4 " >
                    {team_members.map((member, i) => (
                        <MemberCard key={i} data={member} />
                    ))}
                </div>

            </div>

        </section>
    )
}