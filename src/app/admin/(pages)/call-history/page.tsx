import { getRecentCalls } from "@/actions/admin";

export default async function Page() {
    const calls = await getRecentCalls(50);

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
                            <th className="py-4 font-medium text-[#94A3B8]  px-5 text-xs border-b border-[#1E293B80]">Duration</th>
                            <th className="py-4 font-medium text-[#94A3B8]  px-5 text-xs border-b border-[#1E293B80]">Outcome</th>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {calls.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-[#94A3B8] text-sm">
                                    No call history found
                                </td>
                            </tr>
                        ) : (
                            calls.map((call) => (
                                <tr key={call.id}>
                                    <td className="py-4 px-5 text-sm text-[#94A3B8] border-b border-[#1E293B80]">
                                        {call.time}
                                    </td>
                                    <td className="py-4 px-5 text-sm text-[#F8FAFC] border-b border-[#1E293B80]">
                                        {call.caller}
                                    </td>
                                    <td className="py-4 px-5 text-sm text-[#F8FAFC] border-b border-[#1E293B80]">
                                        {call.provider}
                                    </td>
                                    <td className="py-4 px-5 text-sm text-[#94A3B8] border-b border-[#1E293B80]">
                                        {call.duration}
                                    </td>
                                    <td className="py-4 px-5 text-sm text-[#94A3B8] border-b border-[#1E293B80]">
                                        {call.outcome}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    )
}