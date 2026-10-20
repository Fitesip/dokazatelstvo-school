import { Cta } from "@/components/Cta";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Principles } from "@/components/Principles";
import { Process } from "@/components/Process";
import { Results } from "@/components/Results";
import { Subjects } from "@/components/Subjects";
import { Teacher } from "@/components/Teacher";
import { TrialLesson } from "@/components/TrialLesson";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Principles />
        <Subjects />
        <Results />
        <Process />
        <Teacher />
        <TrialLesson />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
