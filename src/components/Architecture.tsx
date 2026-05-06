"use client"


import { AudioLines, ChevronsLeftRightEllipsis, Cpu, Database, Server, Smartphone } from "lucide-react";
import { motion } from "framer-motion"



export default function Architecture() {
    return (
        <section
            id="architecture"
            className="w-full flex flex-col items-center justify-center gap-10  md:my-48 px-[5%] bg-white/1 py-20 "  >
            <h2 className="font-semibold text-2xl md:text-5xl font-sans text-center max-w-3xl leading-[130%] " >System Architecture</h2>


            <div className=" bg-[#000000] py-8 px-3 md:px-6 border border-white/5 rounded-2xl w-full max-w-6xl grid grid-cols-2 md:grid-cols-5 place-items-center justify-center justify-items-center gap-16 md:gap-6 " >

                <motion.div
                    initial={{
                        color: "#FFFFFF1A"
                    }}

                    whileInView={{
                        color: "#ffffff"
                    }}

                    transition={{
                        duration: 0.3,
                        type: "spring",
                        delay: 0.3,
                        ease: "easeInOut",
                        bounce: 0.6
                    }}

                    viewport={{
                        once: true,
                        amount: 1
                    }}

                    className="w-full h-full  flex flex-col items-center gap-3 font-sans text-xs md:text-sm font-medium   " >

                    <Smartphone size={45} />
                    Frontend Client
                </motion.div>


                <motion.div
                    initial={{
                        color: "#FFFFFF1A"
                    }}

                    whileInView={{
                        color: "#ffffff"
                    }}

                    transition={{
                        duration: 0.3,
                        type: "spring",
                        delay: 0.6,
                        ease: "easeInOut",
                        bounce: 0.6
                    }}

                    viewport={{
                        once: true,
                        amount: 1
                    }}

                    className="w-full h-full  flex flex-col items-center gap-3 font-sans text-xs md:text-sm font-medium  " >

                    <AudioLines size={45} />
                    Voice/DTMF
                </motion.div>



                <motion.div
                    initial={{
                        color: "#FFFFFF1A"
                    }}

                    whileInView={{
                        color: "#ffffff"
                    }}

                    transition={{
                        duration: 0.3,
                        type: "spring",
                        delay: 0.9,
                        ease: "easeInOut",
                        bounce: 0.6
                    }}

                    viewport={{
                        once: true,
                        amount: 1
                    }}

                    className="w-full h-full  flex flex-col items-center gap-3 font-sans text-xs md:text-sm font-medium   " >

                    <Cpu size={45} />
                    AI IVR Engine
                </motion.div>


                <motion.div
                    initial={{
                        color: "#FFFFFF1A"
                    }}

                    whileInView={{
                        color: "#ffffff"
                    }}

                    transition={{
                        duration: 0.3,
                        type: "spring",
                        delay: 1.2,
                        ease: "easeInOut",
                        bounce: 0.6
                    }}

                    viewport={{
                        once: true,
                        amount: 1
                    }}

                    className="w-full h-full  flex flex-col items-center gap-3 font-sans text-xs md:text-sm font-medium  " >

                    <ChevronsLeftRightEllipsis size={45} />
                    API Call
                </motion.div>



                <motion.div
                    initial={{
                        color: "#FFFFFF1A"
                    }}

                    whileInView={{
                        color: "#ffffff"
                    }}

                    transition={{
                        duration: 0.3,
                        type: "spring",
                        delay: 1.5,
                        ease: "easeInOut",
                        bounce: 0.6
                    }}

                    viewport={{
                        once: true,
                        amount: 1
                    }}

                    className="w-full h-full  flex flex-col items-center gap-3 font-sans text-sm font-medium   " >

                    <span className="w-full max-w-37.5 py-1.5 px-4 text-sm bg-white/1 border border-white/5 rounded-lg flex items-center justify-center gap-2 " >
                        <Database size={20} />
                        CRM DB
                    </span>


                    <span className="w-full max-w-37.5 py-1.5 px-4 text-sm bg-white/1 border border-white/5 rounded-lg flex items-center justify-center gap-2  " >
                        <Server size={20} />
                        Billing Node
                    </span>


                </motion.div>

            </div>

        </section>
    )
}