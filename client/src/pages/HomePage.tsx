import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TransferBooking from "@/components/TransferBooking";
import CityTours from "@/components/CityTours";
import VehicleTypes from "@/components/VehicleTypes";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationCenter from "@/components/NotificationCenter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with integrated navigation and theme toggle */}
      <div className="relative">
        <Header />
        {/* Theme toggle positioned in header area */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <NotificationCenter />
          <ThemeToggle />
        </div>
      </div>

      {/* Main content */}
      <main>
        {/* Hero section */}
        <Hero />
        
        {/* Transfer booking form */}
        <TransferBooking />
        
        {/* Vehicle types showcase */}
        <VehicleTypes />
        
        {/* City tours section */}
        <CityTours />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}