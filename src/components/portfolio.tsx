"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/env";

const projects = [
  ["01", "Common Ground", "Digital system for a radically local food network.", "Brand / Product"],
  ["02", "After Hours", "An editorial archive for culture after dark.", "Strategy / Web"],
  ["03", "Signal / Noise", "A live data instrument for independent radio.", "Identity / Experience"],
];

const initials = `${profile.firstName[0]}${profile.lastName[0]}`;
const shortYear = profile.year.slice(-2);
const projectSubject = encodeURIComponent("Project enquiry");

export function Portfolio() {
  const root = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);
  const [cursorEnabled, setCursorEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const updateMedia = () => setCursorEnabled(media.matches);
    updateMedia();
    media.addEventListener("change", updateMedia);
    return () => media.removeEventListener("change", updateMedia);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => gsap.from(element, { y: 42, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 88%" } }));
      gsap.from(".project-card", { x: 80, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".projects-grid", start: "top 76%" } });
      gsap.to(".progress-fill", { scaleY: 1, transformOrigin: "top", ease: "none", scrollTrigger: { trigger: "main", start: "top top", end: "bottom bottom", scrub: 0.2 } });
    }, root);
    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!cursorEnabled || !cursorRef.current || !cursorLabelRef.current) return;
    const moveX = gsap.quickTo(cursorRef.current, "x", { duration: 0.35, ease: "power3.out" });
    const moveY = gsap.quickTo(cursorRef.current, "y", { duration: 0.35, ease: "power3.out" });
    const cursorRoot = root.current;
    const handleMove = (event: MouseEvent) => {
      moveX(event.clientX);
      moveY(event.clientY);
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      cursorLabelRef.current!.textContent = target?.dataset.cursor ?? "";
      gsap.to(cursorRef.current, { scale: target ? 1.35 : 1, duration: 0.2, overwrite: true });
    };
    cursorRoot?.addEventListener("mousemove", handleMove);
    return () => cursorRoot?.removeEventListener("mousemove", handleMove);
  }, [cursorEnabled]);

  return (
    <div ref={root}>
      <a className="skip-link" href="#content">Skip to content</a>
      {cursorEnabled && <div ref={cursorRef} className="cursor" aria-hidden="true"><span ref={cursorLabelRef} /></div>}
      <aside className="rail" aria-label="Section navigation">
        <a href="#hero" aria-label="Go to intro">01</a><a href="#experience" aria-label="Go to experience">02</a><a href="#skills" aria-label="Go to skills">03</a><a href="#projects" aria-label="Go to projects">04</a><a href="#contact" aria-label="Go to contact">05</a>
        <i className="progress-fill" />
      </aside>
      <header className="site-header"><a href="#hero" className="brand">{initials} / {shortYear}</a><span>{profile.role}</span><a href={`mailto:${profile.email}`} data-cursor="MAIL">Let&apos;s talk ↗</a></header>
      <main id="content">
        <section id="hero" className="hero section">
          <p className="eyebrow" data-reveal>{profile.availability}</p>
          <h1 aria-label={`${profile.firstName} ${profile.lastName}, ${profile.role}`}><span data-reveal>{profile.firstName}</span><span data-reveal>{profile.lastName}<span className="lime">.</span></span></h1>
          <div className="hero-bottom" data-reveal><p>{profile.intro}</p><a href="#projects" data-cursor="VIEW">Selected work <b>↓</b></a></div>
        </section>
        <section id="experience" className="section sheet experience">
          <p className="eyebrow" data-reveal>01 / Experience</p>
          <h2 data-reveal>Making the useful<br />feel <em>unusual.</em></h2>
          <div className="timeline">
            <article data-reveal><span>2021 — now</span><div><h3>Independent practice</h3><p>Creative direction, design systems and build for ambitious teams across art, technology and hospitality.</p></div></article>
            <article data-reveal><span>2018 — 2021</span><div><h3>Design director · Offset</h3><p>Led digital identity and product engagements from first proposition to final pixel.</p></div></article>
            <article data-reveal><span>2015 — 2018</span><div><h3>Designer · Fieldwork</h3><p>Cut my teeth building brands with a conviction that clarity can still surprise.</p></div></article>
          </div>
        </section>
        <section id="skills" className="section skills">
          <p className="eyebrow" data-reveal>02 / Toolkit</p>
          <div className="skills-heading"><h2 data-reveal>Fluent in<br /><span>friction.</span></h2><p data-reveal>The work moves between precise systems and productive accidents.</p></div>
          <ul data-reveal><li>Creative direction</li><li>Identity systems</li><li>Art direction</li><li>Interaction design</li><li>Front-end craft</li><li>Motion & 3D</li></ul>
        </section>
        <section id="projects" className="section sheet projects">
          <p className="eyebrow" data-reveal>03 / Selected projects</p>
          <div className="projects-grid">{projects.map(([number, title, description, category]) => <a className="project-card" href={`mailto:${profile.email}?subject=${projectSubject}`} data-cursor="VIEW" key={number}><span>{number}</span><div className="project-art"><i /></div><small>{category}</small><h3>{title}</h3><p>{description}</p><b>Explore ↗</b></a>)}</div>
        </section>
        <section id="contact" className="section contact">
          <p className="eyebrow" data-reveal>04 / Contact</p>
          <h2 data-reveal>Have a good<br />problem<span>?</span></h2>
          <a className="contact-link" href={`mailto:${profile.email}`} data-cursor="MAIL" data-reveal>{profile.email} <b>↗</b></a>
          <footer><span>© {profile.firstName} {profile.lastName} / {profile.year}</span><span>Built with intent in the open web</span><a href="#hero">Back to top ↑</a></footer>
        </section>
      </main>
    </div>
  );
}
