import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#1a1f2e]/80 border-b border-white/10">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="">
            <Image
              src="/header-logo.png"
              alt="TACO-IDE Logo"
              width={100}
              height={100}
              priority
              className="transform hover:scale-110 transition-transform duration-300"
            />
          </div>
          {/* <span className="text-2xl font-bold bg-gradient-to-r from-[#FFB800] to-[#FFA000] text-transparent bg-clip-text">
            TACO
          </span> */}
        </div>
        <Link href="/auth/login" className="btn btn-primary">
          <Image
            src="/login.png"
            alt="login"
            width={50}
            height={50}
            priority
            className="rounded-xl transform hover:scale-110 transition-transform duration-300"
          />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
