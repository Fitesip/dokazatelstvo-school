import { Cta } from "@/components/Cta";
import { Hero } from "@/components/Hero";
import { Principles } from "@/components/Principles";
import { Process } from "@/components/Process";
import { Results } from "@/components/Results";
import { SiteFrame } from "@/components/SitePage";
import { Subjects } from "@/components/Subjects";
import { Teacher } from "@/components/Teacher";
import { TrialLesson } from "@/components/TrialLesson";

export default function Home() {
  return (
    <SiteFrame>
      <Hero />
      <Principles />
      <Subjects />
      <Results />
      <Process />
      <Teacher />
      <TrialLesson />
      <Cta />
    </SiteFrame>
  );
}
