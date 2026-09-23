import type { ReactNode } from "react";

export function Page(props: { title: string; children: ReactNode }) {
  return (
    <section className="demo-page">
      <h1>{props.title}</h1>
      <div className="demo-stage">{props.children}</div>
    </section>
  );
}
