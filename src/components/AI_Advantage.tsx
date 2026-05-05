



export default function AI_Advantage() {
    return (
        <section className="w-full flex flex-col items-center justify-center gap-16 my-8 px-[5%]  py-20 "  >
            <h2 className="font-semibold text-2xl md:text-5xl font-sans text-center max-w-3xl leading-[130%] " >The AI Advantage</h2>


            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 place-items-center justify-items-center justify-center  " >

                <div className="w-full h-full  bg-white/1 rounded-2xl border border-white/10 py-7 px-4 flex flex-col items-start gap-3 font-sans " >
                    <h4 className="text-lg md:text-xl font-semibold " >Copilot Automation</h4>

                    <p className="text-sm md:text-base text-white/50 font-normal " >Our AI doesn’t just talk; it learns.
                        The system continuously refines its conversational models
                        based on real interactions.</p>
                </div>


                <div className="w-full h-full bg-white/1 rounded-2xl border border-white/10 font-sans  overflow-x-auto">
                    <table className="w-full border-collapse text-xs md:text-base">
                        <thead>
                            <tr className="border-b border-white/10 text-left  ">
                                <th className="py-4 px-3 bg-white/5 ">Metric</th>
                                <th className="py-4 px-3 bg-white/5">Traditional IVR</th>
                                <th className="py-4 px-3 bg-white/5">AI-Powered IVR</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-white/10">
                                <td className="py-4 px-3">Navigation</td>
                                <td className="py-4 px-3">DTMF (Press 1)</td>
                                <td className="py-4 px-3">Natural Language</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-4 px-3">Containment Rate</td>
                                <td className="py-4 px-3">~20%</td>
                                <td className="py-4 px-3">~65%</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-3">Personalization</td>
                                <td className="py-2 px-3">None</td>
                                <td className="py-2 px-3">High (CRM Sync)</td>
                            </tr>

                            <tr>
                                <td className="py-4 px-3">Scalability</td>
                                <td className="py-4 px-3">Port Limited</td>
                                <td className="py-4 px-3">Infinite Cloud</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>


        </section>
    )
}