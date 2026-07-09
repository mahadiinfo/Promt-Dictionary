import { Layers, FileText } from "lucide-react";

const items = [
  { icon: Layers, label: "Categories", key: "categories" },
  { icon: FileText, label: "Prompts", key: "prompts" },
];

export default function StatsCards({ totalPrompts, categories }) {
  return (
    // grid ব্যবহার করে রেসপনসিভ করা হয়েছে এবং max-w দিয়ে কার্ডের সাইজ সুন্দর করা হয়েছে
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full p-4">
      {items.map(({ icon: Icon, label, key }) => (
        <div
          key={key}
          className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-4">
            {/* আইকন বক্সটিকে একটু বড় এবং আরও মডার্ন করা হয়েছে */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
              <Icon className="h-6 w-6" />
            </div>
            
            {/* টেক্সটের অর্ডারিং ঠিক করা হয়েছে (আগে লেবেল, তারপর বড় সংখ্যা) */}
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
                {label}
              </span>
              <span className="text-3xl font-bold tracking-tight text-[var(--color-text-main)] mt-0.5">
                {key === "categories" ? categories.length : totalPrompts}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}