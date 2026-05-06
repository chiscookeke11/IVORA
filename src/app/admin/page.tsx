import { getDashboardStats, getActiveCalls, getRecentCalls, getTopErrors } from "@/actions/admin";
import ActiveCallsHistory from "@/components/admin_components/ActiveCallsHistory";
import RecentCalls from "@/components/admin_components/RecentCalls";
import TopErrors from "@/components/admin_components/TopErrors";

export default async function Page() {
    const [stats, activeCalls, topErrors, recentCalls] = await Promise.all([
        getDashboardStats(),
        getActiveCalls(),
        getTopErrors(),
        getRecentCalls(5)
    ]);

    return (
        <div className="h-fit py-8 px-5 flex flex-col items-start gap-8  font-space-grotesk "  >
            <h1 className="text-[#F8FAFC] text-2xl font-semibold " >Overview</h1>

            {/* Summary  */}
            <div className="w-full grid grid-cols-2 xl:grid-cols-4 place-items-center justify-items-center justify-center gap-6 font-sans "  >
                {/* Active calls  */}
                <div className="w-full h-full rounded-sm flex flex-col items-start
                 gap-4 bg-[#17172066] border border-[#1E293B] py-4 px-5 text-[#94A3B8] " >
                    <h4 className=" font-medium text-sm "  >Active Calls</h4>
                    <h3 className=" text-white font-bold text-[30px] " > {stats.active} </h3>
                </div>

                {/* Resolved Calls*/}
                <div
                    className="w-full h-full rounded-sm flex flex-col items-start
                 gap-4 bg-[#17172066] border border-[#1E293B] py-4 px-5 text-[#94A3B8] "
                >
                    <h4 className=" font-medium text-sm " >Resolved</h4>
                    <h3 className=" text-white font-bold text-[30px] " > {stats.resolved} </h3>
                </div>

                {/* Escalated calls  */}
                <div className="w-full h-full rounded-sm flex flex-col items-start
                 gap-4 bg-[#17172066] border border-[#1E293B] py-4 px-5 text-[#94A3B8] " >
                    <h4 className=" font-medium text-sm "  >Escalated</h4>
                    <h3 className=" text-white font-bold text-[30px] " > {stats.escalated} </h3>
                </div>

                {/* Ended (Dropped) Calls  */}
                <div
                    className="w-full h-full rounded-sm flex flex-col items-start
                 gap-4 bg-[#17172066] border border-[#1E293B] py-4 px-5 text-[#94A3B8] "
                >
                    <h4 className=" font-medium text-sm "  >Ended</h4>
                    <h3 className=" text-white font-bold text-[30px] " > {stats.ended} </h3>
                </div>
            </div>



            <div className="w-full grid grid-cols-3 place-items-start justify-center gap-6 " >
                <ActiveCallsHistory calls={activeCalls} />

                <TopErrors labels={topErrors.labels} data={topErrors.data} />
            </div>


            <div className="w-full grid grid-cols-3 place-items-start justify-center gap-6 " >
                <RecentCalls calls={recentCalls} />
            </div>



        </div>
    )
}