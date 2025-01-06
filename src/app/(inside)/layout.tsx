import Footer from "./_components/footer"
import Navbar from "./_components/navbar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 text-white h-full w-full">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}