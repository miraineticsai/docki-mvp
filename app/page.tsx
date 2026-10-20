import { AppointmentSection } from "@/components/appointment-section";
import { ContactSection } from "@/components/contact-section";
import { DoctorProfile } from "@/components/doctor-profile";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { Navbar } from "@/components/navbar";
import { ServicesSection } from "@/components/services-section";
import { WhyChooseUs } from "@/components/why-choose-us";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white w-full max-w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Semantic Content Area */}
      <main id="main-content" className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Doctor Profile Section */}
        <DoctorProfile />

        {/* 3. Clinical Services Section */}
        <ServicesSection />

        {/* 4. Why Choose Us Section */}
        <WhyChooseUs />

        {/* 5. Appointment Booking Request Section */}
        <AppointmentSection />

        {/* 6. Contact & Office Timings Section */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
