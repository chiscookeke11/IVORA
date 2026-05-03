import { purpose_data } from "@/data/purpose_data";




export default function Purpose() {
    return (
        <section className=" w-full flex flex-col items-center justify-center gap-20 my-20 px-[3%] "  >

            <h2 className="font-semibold text-2xl md:text-5xl font-sans text-center max-w-3xl leading-[130%] " >Built to simplify every customer touchpoint</h2>


            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 place-items-center justify-items-center justify-center gap-0  " >

                {
                    purpose_data.map((purpose, i) => (
                        <div key={i} className={`w-full h-full py-10 px-6  border border-white/20
                            flex flex-col items-start gap-3 md:gap-5
                        ${i + 1 === 1 ? "rounded-t-2xl md:rounded-t-none md:rounded-l-2xl " : i + 1 === 3 ? " rounded-b-2xl md:rounded-bl-none md:rounded-r-2xl " : ""}
                        `}  >
                            <h3 className="font-sans text-base md:text-lg " >{purpose.title}</h3>

                            <p className="text-sm md:text-base font-sans " > {purpose.content} </p>


                            <button className="py-2 px-3 mt-7 rounded-full border border-white/20 font-sans cursor-pointer " >
                                Get started
                            </button>
                        </div>
                    ))
                }

            </div>


        </section>
    )
}