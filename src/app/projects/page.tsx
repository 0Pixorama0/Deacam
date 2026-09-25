import type { Metadata } from "next";
import { BreakdownCta, Facts, PageHead } from "@/components/Blocks";
import { ProjectGrid } from "@/components/ProjectGrid";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Referenceable electrical, automation and panel work across Victoria, New South Wales and Tasmania, including the West Gate Tunnel precast facility and TasWater Bryn Estyn WTP.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <PageHead
        eyebrow="Project record"
        title="Referenceable work,"
        light="three states."
        body="Tier 1 infrastructure, heavy industry, government utilities and alpine sites. Every project has a bespoke requirement. That is where our engineering earns its keep."
      />
      <section className="section" style={{ paddingTop: 0 }} data-nav="light">
        <div className="wrap">
          <ProjectGrid />
        </div>
      </section>
      <section className="section--tight" style={{ paddingTop: 0 }} data-nav="light">
        <div className="wrap">
          <Facts
            items={[
              { v: "2008", k: "Delivering since" },
              { v: "3", k: "States licensed" },
              { v: "4+", k: "Years on site at West Gate" },
              { v: "24/7", k: "Breakdown response" },
            ]}
          />
        </div>
      </section>
      <BreakdownCta image="tw-10" />
    </>
  );
}
