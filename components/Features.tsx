'use client'


import Image from "next/image"
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import { features_data } from "@/data/features_data";
import { features_data_type } from "@/types/types";

interface CardProps {
    data: features_data_type
}

const Card = ({ data }: CardProps) => {
    return (
        <div className=" w-full h-full max-w-xs md:max-w-lg  flex flex-col items-center justify-between gap-3 group cursor-pointer border-2 border-white/10 rounded-xl py-8 px-4 bg-white/2 shrink-0 ">
            <div className="w-[280px] md:w-full aspect-square flex items-center justify-center
      overflow-hidden rounded-[10px] bg-gray-600 transform transition-all
      relative duration-300 ease-in-out drop-shadow-2xl">
                <Image
                    src={data.img}
                    alt={`${data.title}-bg`}
                    width={1000}
                    height={1000}
                    className="object-cover object-center w-full absolute top-0 left-0 h-full  ease-in-out"
                />


                {/* {data.topic_img && (
                    <Image
                        src={data.topic_img}
                        alt={`${data.title}-image`}
                        width={1000}
                        height={1000}
                        className="object-contain object-center w-[80%] aspect-square absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]  ease-in-out"
                    />
                )} */}

                {/* Dark Overlay (for readability) */}
                <div className="absolute top-0 left-0 w-full h-full bg-black/45" />

            </div>

            <div className="w-full h-fit px-2 md:px-6 py-4 md:py-10">
                <h2 className="text-xl md:text-2xl font-semibold font-sans mb-1 md:mb-3 text-white">
                    {data.title}
                </h2>
                <p className="font-medium text-sm md:text-base text-white/60 font-sans  ">{data.content}</p>
            </div>
        </div>
    )
}

export default function Features() {
    const targetRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"],
    })

    const y = useTransform(scrollYProgress, [0, 1], ["10%", "-30%"])

    return (
        <section
        id="features"
        className="w-full py-24 lg:py-48 px-[3%] md:px-[4%] flex justify-center font-inter text-white font-sans ">
            <div className="w-full max-w-7xl hidden md:flex flex-row gap-20 lg:gap-48 items-center justify-between ">

                <div className="sticky top-[10%] self-start flex flex-col gap-4 " >
                    <h1 className="text-3xl md:text-4xl font-sans font-semibold text-white shrink-0 ">
                        Features
                    </h1>
                    <p className="text-base font-normal text-white/60 font-sans " >At its core, the system interprets, learns, and responds, transforming voice into action. By merging AI with telecom infrastructure, we enable seamless, real-time interactions that eliminate friction and redefine how users access support.</p>
                </div>

                {/* Scroll Container */}

                <div ref={targetRef} className="w-full max-w-3xl relative h-[400vh]  ">
                    <div className="w-full h-fit sticky top-[10%] max-w-3xl overflow-hidden  pt-28 ">
                        <motion.div className="flex flex-col gap-20 h-full" style={{ y }}>
                            {features_data.map((area, index) => (
                                <Card data={area} key={index} />
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>





            {/* veiw on mobile devices  */}


            <div className="w-full flex flex-col items-center justify-center gap-10 md:hidden" >
                <h1 className="text-3xl md:text-4xl font-sans font-semibold text-white shrink-0 ">
                    Focus Areas
                </h1>



                <div className="w-full h-fit grid grid-flow-col auto-cols-max gap-6 overflow-x-auto py-5">
                    {features_data.map((area, index) => (
                        <Card data={area} key={index} />
                    ))}
                </div>

            </div>

        </section>
    )
}
