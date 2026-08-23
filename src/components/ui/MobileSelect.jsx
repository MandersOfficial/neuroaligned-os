import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

/**
 * Mobile-friendly select that uses a bottom Vaul drawer instead of a native
 * <select>. Keeps the same value/onChange/options API: options = [{ value, label }].
 */
export default function MobileSelect({ value, onChange, options, placeholder, className = '', label }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 text-left ${className}`}
      >
        <span className="flex-1 truncate">{selected ? selected.label : (placeholder || 'Select…')}</span>
        <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
      </button>

      <Drawer shouldScaleBackground={false} open={open} onOpenChange={setOpen}>
        <DrawerContent>
          {label && (
            <DrawerHeader className="text-left">
              <DrawerTitle>{label}</DrawerTitle>
            </DrawerHeader>
          )}
          <div className="px-3 pb-6 max-h-[60vh] overflow-y-auto space-y-1">
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full flex items-center justify-between min-h-[44px] px-4 py-3 rounded-xl text-sm text-left transition-colors ${
                  o.value === value ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-secondary'
                }`}
              >
                <span>{o.label}</span>
                {o.value === value && <Check className="w-4 h-4 shrink-0" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}