import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";




export default function Footer() {
    return (
        <footer className="w-full flex flex-col items-center justify-center gap-4 py-10 pb-16 border-t border-t-white/10  " >

            <div className="w-fit flex items-center justify-center gap-4 " >
                <a href="#">
                    <FaGithub size={20} />
                </a>

                <a href="#">
                    <FaXTwitter size={20} />
                </a>

                <a href="#">
                    <FaLinkedin size={20} />
                </a>
            </div>


            <small className="font-sans text-base" >© 2026 Ivora AI. All rights reserved. </small>
        </footer>
    )
}