import { BookOpen, Brain, Lightbulb, MessageSquare } from "lucide-react";

const steps = [
  { icon: BookOpen, label: "Reading the book..." },
  { icon: Brain, label: "Extracting key insights..." },
  { icon: MessageSquare, label: "Simplifying the stories..." },
  { icon: Lightbulb, label: "Crafting actionable takeaways..." },
];

export default function LoadingState() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
        <BookOpen className="w-8 h-8 text-primary" />
      </div>

      <h3 className="font-heading text-2xl font-semibold mb-2">Analyzing the book</h3>
      <p className="text-muted-foreground mb-8">This usually takes a few seconds</p>

      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border">
            <step.icon className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
