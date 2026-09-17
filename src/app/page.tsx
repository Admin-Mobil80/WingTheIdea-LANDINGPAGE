import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Process } from "@/components/Process";
import { Ventures } from "@/components/Ventures";
import { Principles } from "@/components/Principles";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Process />
        <Ventures />
        <Principles />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
