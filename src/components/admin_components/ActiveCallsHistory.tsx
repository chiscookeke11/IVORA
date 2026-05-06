import { Dot } from "lucide-react";




export default function ActiveCallsHistory() {
    return (
        <div className="w-full border border-[#1E293B] bg-[#0A0A0FCC] p-4 rounded-xl flex flex-col items-start gap-6  ">
            <div className="w-full flex items-center justify-between gap-6 " >
                <h3 className="font-medium text-lg text-[#F8FAFC]  " >Active Calls</h3>
            </div>



            <div className="w-full flex flex-col items-center justify-start gap-3" >

                <div className="w-full bg-[#0A0A0F80] border border-[#1E293B] rounded-2xl
    flex items-center justify-between px-3 py-5
       " >

                    <h3 className="text-[#F8FAFC] font-medium text-sm  " >+1 (555) **-**89</h3>

                    <span className="flex items-center justify-center gap-2 text-[#3B82F6] font-bold text-sm  " >
                        <Dot size={20} />
                        04:12</span>
                </div>



                <div className="w-full bg-[#0A0A0F80] border border-[#1E293B] rounded-2xl
    flex items-center justify-between px-3 py-5
       " >

                    <h3 className="text-[#F8FAFC] font-medium text-sm  " >+1 (415) **-**22</h3>

                    <span className="flex items-center justify-center gap-2 text-[#3B82F6] font-bold text-sm  " >
                        <Dot size={20} />
                        04:12</span>
                </div>



                <div className="w-full bg-[#0A0A0F80] border border-[#1E293B] rounded-2xl
    flex items-center justify-between px-3 py-5
       " >

                    <h3 className="text-[#F8FAFC] font-medium text-sm  " >+44 7700 **-**91</h3>

                    <span className="flex items-center justify-center gap-2 text-[#3B82F6] font-bold text-sm  " >
                        <Dot size={20} />
                        04:12</span>
                </div>

                <div className="w-full bg-[#0A0A0F80] border border-[#1E293B] rounded-2xl
    flex items-center justify-between px-3 py-5
       " >

                    <h3 className="text-[#F8FAFC] font-medium text-sm  " >+1 (310) **-**44</h3>

                    <span className="flex items-center justify-center gap-2 text-[#3B82F6] font-bold text-sm  " >
                        <Dot size={20} />
                        04:12</span>
                </div>

            </div>


        </div>
    )
}