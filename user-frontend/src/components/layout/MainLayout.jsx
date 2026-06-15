// global layout component, used to wrap all pages 
import Navbar from "./desktop_navbar/Navbar"
import Footer from "./Footer"


function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">

      <Navbar />

      <main className="flex-1 pb-20">
        {children}
      </main>
      <Footer />

    </div>
  )
}

export default MainLayout
