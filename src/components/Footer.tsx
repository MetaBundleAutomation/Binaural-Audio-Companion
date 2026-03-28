export default function Footer() {
  return (
    <footer className="text-center py-10 border-t border-[var(--border-color)] text-[var(--text-secondary)] mt-20">
      <p>&copy; {new Date().getFullYear()} MindFlow. All rights reserved.</p>
      <p className="text-[13px] mt-2 opacity-70">
        For educational and wellness purposes only. Not intended to diagnose or treat medical conditions.
      </p>
    </footer>
  );
}
