




export default function Page() {
    return (
        <div className="h-fit py-8 px-5 flex flex-col items-start gap-8  font-sans "  >
            <h1 className="text-[#F8FAFC] text-2xl font-semibold " >Overview</h1>


            {/* Summary  */}
            <div className="w-full grid grid-cols-2 xl:grid-cols-4 place-items-center justify-items-center justify-center gap-6 font-sans "  >

                {/* Active calls  */}
                <div className="w-full h-full rounded-sm flex flex-col items-start
                 gap-4 bg-[#17172066] border border-[#1E293B] py-4 px-5 text-[#94A3B8] " >

                    <h4 className=" font-medium text-sm "  >Active Calls</h4>

                    <h3 className=" text-white font-bold text-[30px] font-sans" > 142 </h3>

                </div>


                {/* Resolved Calls*/}
                <div
                    className="w-full h-full rounded-sm flex flex-col items-start
                 gap-4 bg-[#17172066] border border-[#1E293B] py-4 px-5 text-[#94A3B8] "
                >

                    <h4 className=" font-medium text-sm " >Resolved</h4>
                    <h3 className=" text-white font-bold text-[30px] font-sans" > 142 </h3>
                </div>



                {/* Escalated calls  */}
                <div className="w-full h-full rounded-sm flex flex-col items-start
                 gap-4 bg-[#17172066] border border-[#1E293B] py-4 px-5 text-[#94A3B8] " >

                    <h4 className=" font-medium text-sm "  >Escalated</h4>
                    <h3 className=" text-white font-bold text-[30px] font-sans" > 142 </h3>


                </div>


                {/* Dropped Calls  */}
                <div
                    className="w-full h-full rounded-sm flex flex-col items-start
                 gap-4 bg-[#17172066] border border-[#1E293B] py-4 px-5 text-[#94A3B8] "
                >

                    <h4 className=" font-medium text-sm "  >Dropped</h4>
                    <h3 className=" text-white font-bold text-[30px] font-sans" > 142 </h3>

                </div>




            </div>

        </div>
    )
}