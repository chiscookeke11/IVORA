"use client"


import Button from "./UI/Button";
import Navbar from "./UI/Navbar";
import { motion } from "framer-motion";




export default function Hero() {

    const text = "Redefining customer support through AI-powered voice.";
    const words = text.split(" ");


    return (
        <section className="w-full min-h-[70vh] relative py-20 pt-36 "  >
            <Navbar />

            {/* background video  */}
            <video
                className="absolute inset-0 w-full h-full object-cover object-[50%_65%]"
                src="/videos/iWlVr4qV5BuFxjhc6g7QcPK5o.mp4"
                autoPlay
                loop
                muted
                playsInline

            ></video>

            {/* Dark Overlay (for readability) */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/35" />


            {/* Hero Content */}
            <div className="relative  flex items-center justify-center h-full text-white text-center px-6 z-0 ">
                <div className="w-full max-w-200 text-center flex flex-col items-center gap-6 "  >
                    <span className="border border-white/40 px-3 py-1 rounded-full bg-white/10 backdrop-blur-2xl text-[#ffffffcc]  text-sm md:text-base font-roboto font-medium  opacity-80  " >Announcing Ivora AI</span>

                    <h1 className="text-3xl md:text-[58px] font-medium font-sans leading-tight flex flex-wrap text-center items-center justify-center ">
                        {words.map((word, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{
                                    duration: 0.4,
                                    delay: i * 0.08,
                                    ease: "easeOut",
                                }}
                                className={`inline-block mr-2 ${word === "customer" || word === "support" ? "italic font-source-serif " : " normal-case"} `}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h1>

                    <motion.p
                        initial={{
                            opacity: 0,
                            filter: "blur(20px)"
                        }}
                        animate={{
                            opacity: 1,
                            filter: "blur(0)"
                        }}
                        transition={{
                            duration: 0.6,
                            ease: "easeInOut"
                        }}
                        className="max-w-xl text-base md:text-lg opacity-90 font-sans text-[#ffffffcc]  ">
                        From billing to troubleshooting, our IVR system enables users ro resolve issues in real-time without agents, delays or complexity.
                    </motion.p>



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
                        className="w-fit mt-3 py-3 flex items-center justify-center gap-5 font-sans mx-auto  "  >
                        <Button variant="white">Get started</Button>

                        <Button variant="gray" onClick={() => alert("Clicked!")}>
                            Learn more
                        </Button>
                    </motion.div>


                </div>
            </div>
        </section>
    )
}