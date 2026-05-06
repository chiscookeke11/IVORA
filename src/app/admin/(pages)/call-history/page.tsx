


export default function Page() {
    return (
        <div className="h-fit py-8 px-5 flex flex-col items-start gap-8  font-space-grotesk "  >
            <h1 className="text-[#F8FAFC] text-2xl font-semibold " >Call History</h1>


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