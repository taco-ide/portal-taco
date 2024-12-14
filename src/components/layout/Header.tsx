import Image from "next/image";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#1a1f2e]/80 border-b border-white/10">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl overflow-hidden shadow-lg shadow-[#FFB800]/20 hover:shadow-[#FFB800]/30 transition-shadow duration-300">
            <Image
              src="/taco-logo.png"
              alt="TACO-IDE Logo"
              width={50}
              height={50}
              priority
              className="rounded-xl transform hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#FFB800] to-[#FFA000] text-transparent bg-clip-text">
            TACO-IDE
          </span>
        </div>
        <nav className="hidden sm:flex gap-8">
          {[
            { name: "Recursos", href: "#recursos" },
            { name: "Colaboradores", href: "#colaboradores" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="relative text-gray-300 hover:text-white transition-colors group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4CAF50] group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
