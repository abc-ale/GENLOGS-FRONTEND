import re, glob, sys

files = glob.glob("src/features/**/*.tsx", recursive=True)

# ordered: longer/more specific first
subs = [
    ("bg-linear-to-br from-sky-50 via-blue-50 to-cyan-100", "bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#2E6BA8]"),
    ("bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100", "bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#2E6BA8]"),
    ("bg-linear-to-r from-blue-600 to-cyan-500", "bg-gradient-to-r from-primary to-accent"),
    ("bg-gradient-to-r from-blue-600 to-cyan-500", "bg-gradient-to-r from-primary to-accent"),
    ("hover:from-blue-700 hover:to-cyan-600", "hover:from-primary/90 hover:to-accent/90"),
    ("from-blue-600", "from-primary"),
    ("to-cyan-500", "to-accent"),
    ("hover:from-blue-700", "hover:from-primary/90"),
    ("hover:to-cyan-600", "hover:to-accent/90"),

    ("bg-amber-500/10", "bg-warning/10"),
    ("border-amber-500/40", "border-warning/40"),
    ("text-amber-700", "text-warning"),

    ("bg-emerald-100", "bg-success/10"),
    ("bg-green-100", "bg-success/10"),
    ("bg-green-600", "bg-success"),
    ("hover:bg-green-50", "hover:bg-success/10"),
    ("hover:bg-green-700", "hover:bg-success/90"),
    ("text-emerald-700", "text-success"),
    ("text-green-600", "text-success"),

    ("bg-red-50", "bg-destructive/10"),
    ("bg-red-100", "bg-destructive/10"),
    ("hover:bg-red-50", "hover:bg-destructive/10"),
    ("border-red-200", "border-destructive/30"),
    ("border-red-500", "border-destructive"),
    ("text-red-900", "text-destructive"),
    ("text-red-700", "text-destructive"),
    ("text-red-600", "text-destructive"),
    ("text-red-500", "text-destructive"),

    ("bg-blue-50", "bg-accent/10"),
    ("bg-blue-600", "bg-accent"),
    ("hover:bg-blue-50", "hover:bg-accent/10"),
    ("hover:bg-blue-700", "hover:bg-accent/90"),
    ("border-blue-200", "border-accent/30"),
    ("border-blue-500", "border-accent"),
    ("focus:border-blue-500", "focus:border-accent"),
    ("focus:ring-blue-500", "focus:ring-accent"),
    ("focus:ring-sky-600", "focus:ring-accent"),
    ("text-blue-700", "text-accent"),
    ("text-blue-600", "text-accent"),
    ("text-blue-500", "text-accent"),
    ("hover:text-blue-700", "hover:text-accent"),
    ("bg-sky-100", "bg-accent/10"),
    ("bg-sky-700", "bg-accent"),
    ("text-sky-800", "text-accent"),
    ("text-sky-700", "text-accent"),

    ("hover:bg-gray-50", "hover:bg-muted"),
    ("hover:bg-gray-100", "hover:bg-muted"),
    ("hover:bg-gray-200", "hover:bg-muted"),
    ("hover:bg-gray-300", "hover:bg-muted"),
    ("hover:bg-slate-50", "hover:bg-muted"),
    ("bg-gray-50", "bg-muted"),
    ("bg-gray-100", "bg-muted"),
    ("bg-gray-200", "bg-muted"),
    ("bg-gray-300", "bg-muted"),
    ("bg-slate-50", "bg-muted"),

    ("hover:border-gray-400", "hover:border-border"),
    ("border-gray-200", "border-border"),
    ("border-gray-300", "border-border"),
    ("border-slate-200", "border-border"),
    ("border-slate-300", "border-border"),
    ("divide-slate-100", "divide-border"),

    ("hover:text-gray-900", "hover:text-foreground"),
    ("hover:text-gray-600", "hover:text-foreground"),
    ("text-gray-900", "text-foreground"),
    ("text-gray-800", "text-foreground"),
    ("text-gray-700", "text-foreground"),
    ("text-gray-600", "text-muted-foreground"),
    ("text-gray-500", "text-muted-foreground"),
    ("text-gray-400", "text-muted-foreground"),
    ("text-slate-800", "text-foreground"),
    ("text-slate-700", "text-foreground"),
    ("text-slate-600", "text-muted-foreground"),
    ("text-slate-500", "text-muted-foreground"),
]

total_changes = 0
for f in files:
    with open(f, encoding="utf-8") as fh:
        content = fh.read()
    original = content
    for old, new in subs:
        content = content.replace(old, new)
    if content != original:
        with open(f, "w", encoding="utf-8") as fh:
            fh.write(content)
        total_changes += 1
        print("changed:", f)

print("TOTAL FILES CHANGED:", total_changes)
