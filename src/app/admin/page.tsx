import ActiveCallsHistory from "@/components/admin_components/ActiveCallsHistory";
import RecentCalls from "@/components/admin_components/RecentCalls";
import TopErrors from "@/components/admin_components/TopErrors";





export default function Page() {
return (
        <div className="h-fit py-8 px-5 flex flex-col items-start gap-8  font-space-grotesk "  >
            <h1 className="text-[#F8FAFC] text-2xl font-semibold " >Overview</h1>


            {/* Summary  */}
            <div className="w-full grid grid-cols-2 xl:grid-cols-4 place-items-center justify-items-center justify-center gap-6 font-sans "  >

                {/* Active calls  */}
                <div className="w-full h-full rounded-sm flex flex-col items-start
                 gap-4 bg-[#17172066] border border-[#1E293B] py-4 px-5 text-[#94A3B8] " >

                    <h4 className=" font-medium text-sm "  >Active Calls</h4>

                    <h3 className=" text-white font-bold text-[30px] " > 4 </h3>

                </div>


                {/* Resolved Calls*/}
                <div
                    className="w-full h-full rounded-sm flex flex-col items-start
                 gap-4 bg-[#17172066] border border-[#1E293B] py-4 px-5 text-[#94A3B8] "
                >

                    <h4 className=" font-medium text-sm " >Resolved</h4>
                    <h3 className=" text-white font-bold text-[30px] " > 142 </h3>
                </div>



                {/* Escalated calls  */}
                <div className="w-full h-full rounded-sm flex flex-col items-start
                 gap-4 bg-[#17172066] border border-[#1E293B] py-4 px-5 text-[#94A3B8] " >

                    <h4 className=" font-medium text-sm "  >Escalated</h4>
                    <h3 className=" text-white font-bold text-[30px] " > 10 </h3>


                </div>


                {/* Dropped Calls  */}
                <div
                    className="w-full h-full rounded-sm flex flex-col items-start
                 gap-4 bg-[#17172066] border border-[#1E293B] py-4 px-5 text-[#94A3B8] "
                >

                    <h4 className=" font-medium text-sm "  >Dropped</h4>
                    <h3 className=" text-white font-bold text-[30px] " > 25 </h3>

                </div>
            </div>



            <div className="w-full grid grid-cols-3 place-items-start justify-center gap-6 " >
                <ActiveCallsHistory />

                <TopErrors />
            </div>



            <div className="w-full grid grid-cols-3 place-items-start justify-center gap-6 " >
                <RecentCalls />
            </div>



        </div>
    )
}