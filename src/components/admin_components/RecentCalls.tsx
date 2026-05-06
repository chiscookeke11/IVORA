import { ArrowRight } from "lucide-react";
import Link from "next/link";




export default function RecentCalls() {
    return (
        <div className="w-full col-span-3 border border-[#1E293B] bg-[#0A0A0FCC] py-4 rounded-xl flex flex-col items-start gap-10  " >
            <div className="w-full flex items-center justify-between gap-6 px-5 " >
                <h3 className="font-medium text-lg " >Recent Calls</h3>


                <Link href={"/"}
                    className="text-[#3B82F6] font-medium text-sm  flex items-center gap-1 "
                >
                    View All
                    <ArrowRight size={16} />
                </Link>
            </div>


            <div className="w-full overflow-x-auto font-raleway border-t border-[#1E293B80] pt-5 ">
                <table className="w-full text-left border-collapse">

                    {/* Header */}
                    <thead>
                        <tr className="text-sm     ">
                            <th className="py-4 font-medium text-[#94A3B8]  px-5 text-xs border-b border-[#1E293B80] ">Time</th>
                            <th className="py-4 font-medium text-[#94A3B8]  px-5 text-xs border-b border-[#1E293B80]">Caller</th>
                            <th className="py-4 font-medium text-[#94A3B8]  px-5 text-xs border-b border-[#1E293B80]">Provider</th>
                            <th className="py-4 font-medium text-[#94A3B8]  px-5 text-xs border-b border-[#1E293B80]">Error</th>
                            <th className="py-4 font-medium text-[#94A3B8]  px-5 text-xs border-b border-[#1E293B80]">Outcome</th>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {/* {comments.slice(0, 4).map((c, i) => ( */}
                        <tr >
                            <td className="py-4 px-5 text-sm font-normal text-[#94A3B8] border-b border-[#1E293B80]  ">{"10:42 AM"} </td>
                            <td className="py-4 px-5 text-sm font-normal text-[#F8FAFC] border-b border-[#1E293B80] ">{"+1 (555) **-**12"} </td>

                            <td className="py-4 px-5 text-sm font-normal text-[#F8FAFC] border-b border-[#1E293B80]">{"AT&T"} </td>
                            <td className="py-4 px-5 text-sm font-normal text-[#94A3B8] border-b border-[#1E293B80]">{"-"}</td>
                            <td className="tpy-4 px-5 text-sm font-normal text-[#94A3B8] border-b border-[#1E293B80] ">{"Resolved"}</td>
                        </tr>
                        {/* ))} */}


                    </tbody>

                </table>
            </div>



        </div>
    )
}