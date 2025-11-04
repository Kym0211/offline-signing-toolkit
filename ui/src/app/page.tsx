import { Hero } from "@/components/Hero";
import { Instructions } from "@/components/Instructions";

export default function Home() {
  // No flex classes here! Just a simple div.
  return (
    <div>
      <Hero />
      {/* <Instructions /> */}
    </div>
  );
}