import Link from "next/link";
import Button from "./Button";
import { Menu, X } from "lucide-react";
import { navlinks_data } from "@/data/navlinks_data";
import { useEffect, useRef, useState } from "react";



export default function Navbar() {
    const [openMenu, setOpenMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)



    // This function closes the mobile menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setOpenMenu(false)
            }
        };

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, []);



    return (
        <header className="w-full  py-4 md:py-5 absolute top-0  z-10 px-[4%] md:px-[7%] flex items-center justify-between " >

            <Link href={"/"} className="text-[17px] font-medium text-white font-space-grotesk " >
                Ivora AI
            </Link>


            <ul className="w-fit hidden md:flex items-center gap-6 font-sans " >
                {navlinks_data.map((navlink, i) => (
                    <li
                        key={i}
                        className="text-sm font-medium text-[#ffffffcc] hover:text-white transition-all duration-200 ease-in-out " ><Link href={navlink.path} > {navlink.label} </Link></li>
                ))}
            </ul>




            <Button className="hidden md:block " variant="gray">Get started</Button>


            <button
                onClick={() => setOpenMenu(true)}
                className="md:hidden flex items-center justify-center bg-white size-10 rounded-full  " >
                <Menu size={20} color="#000000" />
            </button>





            {/* Mobile menu */}
            <div
                ref={menuRef}
                className={`w-full h-fit bg-[#000000] fixed top-0 left-0 z-50 py-10 px-4 flex flex-col items-start gap-7 transition-all duration-300 ease-in-out  ${openMenu ? "translate-y-0 " : "translate-y-[-200%]  "} `} >


                <button
                    onClick={() => setOpenMenu(false)}
                    className="ml-auto  flex items-center justify-center bg-white size-8 rounded-full " >
                    <X size={20} color="#000000" />
                </button>

                <Link href={"/"} className="text-[17px] font-medium text-white font-space-grotesk " >
                    Ivora AI
                </Link>

                <ul className="w-fit flex flex-col items-start gap-4 font-sans " >
                    {navlinks_data.map((navlink, i) => (
                        <li
                            key={i}
                            className="text-base font-medium text-[#ffffffcc] hover:text-white transition-all duration-200 ease-in-out " ><Link href={navlink.path} > {navlink.label} </Link></li>
                    ))}
                </ul>


                <Button variant="gray">Get started</Button>

            </div>

        </header>
    )
}