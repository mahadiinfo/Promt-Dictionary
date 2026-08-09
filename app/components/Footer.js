import site from "@/app/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-10 text-center text-xs text-[var(--color-muted)]">
      <p>
        © {new Date().getFullYear()} {site.title}. Built as a documentation-style
        template.
      </p>
    </footer>
  );
}
