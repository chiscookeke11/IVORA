import { Dot } from "lucide-react";




interface ActiveCall {
    id: string;
    caller: string;
    duration: string;
}

export default function ActiveCallsHistory({ calls }: { calls: ActiveCall[] }) {
    return (
        <div className="w-full border border-[#1E293B] bg-[#0A0A0FCC] p-4 rounded-xl flex flex-col items-start gap-6  ">
            <div className="w-full flex items-center justify-between gap-6 " >
                <h3 className="font-medium text-lg text-[#F8FAFC]  " >Active Calls</h3>
            </div>



            <div className="w-full flex flex-col items-center justify-start gap-3" >
                {calls.length === 0 ? (
                    <div className="text-[#94A3B8] text-sm py-4">No active calls</div>
                ) : (
                    calls.map((call) => (
                        <div key={call.id} className="w-full bg-[#0A0A0F80] border border-[#1E293B] rounded-2xl
                            flex items-center justify-between px-3 py-5" 
                        >
                            <h3 className="text-[#F8FAFC] font-medium text-sm  " >{call.caller}</h3>

                            <span className="flex items-center justify-center gap-2 text-[#3B82F6] font-bold text-sm  " >
                                <Dot size={20} />
                                {call.duration}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}