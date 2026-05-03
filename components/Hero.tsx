"use client"


import Button from "./UI/Button";
import Navbar from "./UI/Navbar";




export default function Hero() {
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

                    <h1 className="text-3xl md:text-[58px] font-medium font-roboto ">
                        Redefining  <span className="font-source-serif italic" >customer support </span> through AI-powered voice.
                    </h1>
                    <p className="max-w-xl text-base md:text-lg opacity-90 font-roboto text-[#ffffffcc]  ">
                        From billing to troubleshooting, our IVR system enables users ro resolve issues in real-time without agents, delays or complexity.
                    </p>



                    <div className="w-fit mt-3 py-3 flex items-center justify-center gap-5 font-sans mx-auto  "  >
                        <Button variant="white">Get started</Button>

                        <Button variant="gray" onClick={() => alert("Clicked!")}>
                            Learn more
                        </Button>
                    </div>


                </div>
            </div>
        </section>
    )
}