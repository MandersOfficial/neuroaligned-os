import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Sparkles } from 'lucide-react';

const PRONOUNS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Prefer not to say'];

export default function StepWelcome({ data, onChange, onNext }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Welcome — this will take about 3 minutes
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground leading-tight">
          Let's set up your OS.
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          No long forms. No overwhelming setup. Just a few quick questions so NeuroAligned 
          can start working <em>with</em> your brain from day one.
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-7 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="display_name" className="text-sm font-medium text-foreground">
            What should we call you? <span className="text-muted-foreground font-normal">(first name or nickname)</span>
          </Label>
          <Input
            id="display_name"
            placeholder="e.g. Alex, Maya, J..."
            value={data.display_name || ''}
            onChange={e => onChange('display_name', e.target.value)}
            className="h-12 text-base border-border/60 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Pronouns <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {PRONOUNS.map(p => (
              <button
                key={p}
                onClick={() => onChange('pronouns', data.pronouns === p ? '' : p)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  data.pronouns === p
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border/60 text-foreground hover:border-primary/40'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        size="lg"
        onClick={onNext}
        disabled={!data.display_name?.trim()}
        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-6 text-base font-semibold group disabled:opacity-50"
      >
        Let's go
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}