import { howItWorks_data } from "@/data/how_it_works_data";



export default function HowItWorks() {
    return (
        <section className=" w-full flex flex-col items-center justify-center gap-20 my-20 px-[5%] "  >

            <h2 className="font-semibold text-2xl md:text-5xl font-sans text-center max-w-3xl  " >How it works</h2>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 place-items-center justify-items-center justify-center gap-0  " >

                {
                    howItWorks_data.map((step, i) => (
                        <div key={i} className={`w-full h-full py-10 px-6  border border-white/20
                            flex flex-col items-start gap-3 md:gap-3
${i + 1 === 1 ? "rounded-t-2xl md:rounded-tr-none md:rounded-tl-2xl " : i + 1 === 2 ? " md:rounded-tr-2xl" : i + 1 === 3 ? "md:rounded-bl-2xl" : "rounded-b-2xl md:rounded-bl-none md:rounded-br-2xl "}
                        `}  >

                            <span className="text-white font-semibold text-4xl font-source-serif mb-4  "  >{i + 1}</span>

                            <h3 className="font-source-serif text-[17px] md:text-xl  text-white " >{step.title}</h3>

                            <p className="text-sm md:text-base font-sans text-white/50 " > {step.content} </p>

                        </div>
                    ))
                }

            </div>

        </section>
    )
}