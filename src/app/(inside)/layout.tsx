import Footer from "./_components/footer"
import Navbar from "./_components/navbar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-slate-900 min-h-screen w-full">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}