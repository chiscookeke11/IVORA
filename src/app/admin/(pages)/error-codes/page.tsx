import { getAllErrorCodes } from "@/actions/admin";

export default async function Page() {
    const errorCodes = await getAllErrorCodes();

    return (
        <div className="h-fit py-8 px-5 flex flex-col items-start gap-8  font-space-grotesk "  >
            <h1 className="text-[#F8FAFC] text-2xl font-semibold " >Error Codes</h1>

            <div className="w-full overflow-x-auto font-raleway border-t border-[#1E293B80] pt-5 ">
                <table className="w-full text-left border-collapse">

                    {/* Header */}
                    <thead>
                        <tr className="text-sm">
                            <th className="py-4 font-medium text-[#94A3B8]  px-5 text-xs border-b border-[#1E293B80] ">Code</th>
                            <th className="py-4 font-medium text-[#94A3B8]  px-5 text-xs border-b border-[#1E293B80]">Provider</th>
                            <th className="py-4 font-medium text-[#94A3B8]  px-5 text-xs border-b border-[#1E293B80]">Meaning</th>
                            <th className="py-4 font-medium text-[#94A3B8]  px-5 text-xs border-b border-[#1E293B80]">Category</th>
                            <th className="py-4 font-medium text-[#94A3B8]  px-5 text-xs border-b border-[#1E293B80]">Severity</th>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {errorCodes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-[#94A3B8] text-sm">
                                    No error codes found in dictionary
                                </td>
                            </tr>
                        ) : (
                            errorCodes.map((ec) => (
                                <tr key={ec.id}>
                                    <td className="py-4 px-5 text-sm text-[#F8FAFC] border-b border-[#1E293B80] font-bold">
                                        {ec.code}
                                    </td>
                                    <td className="py-4 px-5 text-sm text-[#94A3B8] border-b border-[#1E293B80]">
                                        {ec.provider}
                                    </td>
                                    <td className="py-4 px-5 text-sm text-[#F8FAFC] border-b border-[#1E293B80] max-w-[300px] truncate" title={ec.meaning}>
                                        {ec.meaning}
                                    </td>
                                    <td className="py-4 px-5 text-sm text-[#94A3B8] border-b border-[#1E293B80]">
                                        {ec.category}
                                    </td>
                                    <td className="py-4 px-5 text-sm border-b border-[#1E293B80]">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                                            ec.severity === "Critical" ? "bg-red-500/20 text-red-500" :
                                            ec.severity === "High" ? "bg-orange-500/20 text-orange-500" :
                                            ec.severity === "Medium" ? "bg-yellow-500/20 text-yellow-500" :
                                            "bg-blue-500/20 text-blue-500"
                                        }`}>
                                            {ec.severity}
                                        </span>
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