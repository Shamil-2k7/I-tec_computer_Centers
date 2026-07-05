import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { HomepageCourseSections } from "@/components/home/CourseSections";
import { About } from "@/components/home/About";
import { Team } from "@/components/home/Team";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQ } from "@/components/home/FAQ";
import { Contact } from "@/components/home/Contact";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HomepageCourseSections />
        <About />
        <Team />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
