"use client"


import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Button from "./UI/Button"
import { features_data } from "@/data/features_data"
import { features_data_type } from "@/types/types"


interface CardProps {
    data: features_data_type
}

const Card = ({data}: CardProps) => {
    return (
        <div className=" w-full h-fit flex flex-col items-start gap-4 "  >
            <h5>{data.title}</h5>
            <h2> {data.title} </h2>

            <p> {data.content} </p>

            <Button variant="gray" onClick={() => alert("Clicked!")}>
                Learn more
            </Button>

        </div>
    )
}




export default function Features() {
    const targetRef = useRef<HTMLDivElement>(null)
    const {scrollYProgress} = useScroll({
        target: targetRef,
        offset: ["start end", "end start"],
    })


    const y = useTransform(scrollYProgress, [0, 1], ["10%", "-30%"])


    return (
        <section className="my-48 w-full px-[3%] md:px-[4%] flex justify-center  " >

            <div className="w-full max-w-7xl hidden md:flex flex-row gap-20 lg:gap-48 items-center justify-between " >

                {/* the left side (scroll container)  */}
                <div ref={targetRef} className="w-full max-w-3xl relative h-[470vh] "  >
                    <div className="w-full h-fit sticky top-[10%] max-w-3xl overflow-hidden pt-28  " >

                        <motion.div className="flex flex-col gap-20 h-full" style={{y}} >
                          {
                            features_data.map((feature, i) => (
                                  <Card data={feature} key={i} />
                            ))
                          }
                        </motion.div>

                    </div>

                </div>



                {/* the right side  */}

            </div>

        </section>
    )
}