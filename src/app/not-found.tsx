import { Btn } from "@/components/Btn";

export default function NotFound() {
  return (
    <section className="phead" data-nav="light" style={{ minHeight: "70vh" }}>
      <div className="wrap">
        <p className="label eyebrow">404</p>
        <h1 className="h1" style={{ marginTop: 24 }}>
          This circuit is open. <span className="light muted">Nothing here.</span>
        </h1>
        <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Btn href="/">Back to home</Btn>
          <Btn href="/contact" variant="ghost">
            Contact us
          </Btn>
        </div>
      </div>
    </section>
  );
}
