// global layout component, used to wrap all pages 
import Navbar from "./desktop_navbar/Navbar"
import Footer from "./Footer"
import MobileNav from "./MobileNav"


function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">

      <Navbar />

      <main className="flex-1 pb-20">
        {children}
      </main>
      <Footer />
      <MobileNav />

    </div>
  )
}

export default MainLayout
