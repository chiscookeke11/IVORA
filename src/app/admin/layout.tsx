"use client"


import React from "react";
import { useMobile } from "../../../hooks/useMobile";
import Link from "next/link";
import { ClockFading, LayoutDashboard, TriangleAlert } from "lucide-react";
import Image from "next/image";





export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useMobile()



    if (isMobile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans text-center">
                <div className="bg-white border border-slate-200 rounded-lg p-8 text-center max-w-md w-full space-y-3">
                    <h1 className="text-2xl font-bold text-red-600">Large Screen Required</h1>
                    <p className="text-slate-600">
                        The admin dashboard is only available on large screens. Please use a desktop or expand your browser window.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-4 py-2 rounded-md bg-black text-white hover:brightness-90"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }



    return (
        <div className="h-screen bg-[#0A0A0FCC]  text-white" >

            <div className="mx-auto grid  gap-6 px-4 py-6 md:grid-cols-[320px_1fr] h-full ">

                {/* The side bar  */}
                <aside className="rounded-lg border border-[#1E293B] bg-[#0A0A0FCC] p-4 h-fit space-y-7 ">
                    <Link href={"/"}
                        className="flex items-center gap-3">
                        <p className="text-[17px] font-medium text-white font-space-grotesk ">
                            Ivora
                        </p>
                    </Link>



                    <nav className="space-y-4 font-space-grotesk ">
                        <Link href={"/admin"} className="w-full flex items-center justify-start gap-3 px-4 py-3
                        rounded-lg border border-transparent hover:bg-[#3B82F61A] hover:text-[#3B82F6]
                         hover:border hover:border-[#3B82F633] text-sm font-medium
                         transition-all duration-200 ease-in-out text-[#94A3B8] " >
                            <LayoutDashboard size={17} />
                            Overview
                        </Link>


                        <Link href={"admin/call-history"}
                            className="w-full flex items-center justify-start gap-3 px-4 py-3
                        rounded-lg border border-transparent hover:bg-[#3B82F61A] hover:text-[#3B82F6]
                         hover:border hover:border-[#3B82F633] text-sm font-medium
                         transition-all duration-200 ease-in-out text-[#94A3B8]"
                        >
                            <ClockFading size={17} />
                            Call History
                        </Link>


                        <Link href={"/admin/error-codes"}
                            className="w-full flex items-center justify-start gap-3 px-4 py-3
                        rounded-lg border border-transparent hover:bg-[#3B82F61A] hover:text-[#3B82F6]
                         hover:border hover:border-[#3B82F633] text-sm font-medium
                         transition-all duration-200 ease-in-out text-[#94A3B8]"
                        >
                            <TriangleAlert size={17} />
                            Error Codes
                        </Link>

                    </nav>

                    <button

                        className=" w-full font-sans bg-red-600 text-white py-2 px-4 rounded-md font-raleway text-center font-semibold cursor-pointer hover:brightness-90 flex items-center justify-center "
                    >
                        log out
                    </button>




                    <div className="w-full h-fit p-4 bg-[#171720] rounded-xl border border-[#1E293B] mt-36 flex  items-center gap-5 " >
                        <Image
                            src={"/team/Precious_chukwu.jpeg"}
                            alt="admin-image"
                            width={500}
                            height={500}
                            className=" w-10 h-10 object-cover object-center rounded-full "
                        />

                        <p className="text-sm font-medium font-sans " >Precious Chukwu</p>
                    </div>

                </aside>


                <main className="rounded-lg border border-[#1E293B] bg-[#0A0A0FCC] overflow-y-auto h-full  font-sans "  >
                    {children}
                </main>


            </div>
        </div>
    )
}