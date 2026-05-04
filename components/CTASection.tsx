"use client"


import Button from "./UI/Button";
import { motion } from "framer-motion"


export default function CTA_Section() {
    return (
        <section className="w-full min-h-[30vh] md:min-h-[60vh]  relative my-10 " >

            {/* background video  */}
            <video
                className="absolute top-[50%] left-0 translate-y-[-50%] w-full h-full object-cover "
                src="/videos/j9ikamCpeUjzKj02RjLij5mfhRw.mp4"
                autoPlay
                loop
                muted
                playsInline

            ></video>


            {/* Dark Overlay (for readability) */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/35" />



            <div className="absolute w-full  flex flex-col items-center gap-6 justify-center h-full text-white text-center px-6 z-0  ">
                <h3 className="text-3xl md:text-[48px] font-medium font-sans" >Smarter support starts <span className="font-source-serif italic " >here.</span></h3>



                <motion.div
                    initial={{
                        opacity: 0,
                        translateY: 20
                    }}
                    animate={{
                        opacity: 1,
                        translateY: 0
                    }}
                    transition={{
                        duration: 0.5,
                        ease: "easeInOut"
                    }}
                    className="w-fit  py-3 flex items-center justify-center gap-5 font-sans mx-auto  "  >
                    <Button variant="white">Get started</Button>

                    <Button variant="gray" >
                        Learn more
                    </Button>
                </motion.div>

            </div>



        </section>
    )
}