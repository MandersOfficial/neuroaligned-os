import { useNavigate } from 'react-router-dom';
import {
  Mic, ShieldAlert, BookOpen, Plug, Settings as SettingsIcon,
  Star, LifeBuoy, HelpCircle, Shield,
} from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import ReadAloudButton from '@/components/accessibility/ReadAloudButton';
import { requestDictate } from '@/lib/voiceCommandStore';

// Everything in the sidebar that does not already have a bottom-bar tab
const SECONDARY_LINKS = [
  { icon: ShieldAlert, label: 'Burnout Risk', href: '/burnout' },
  { icon: BookOpen, label: 'Knowledge Base', href: '/knowledge' },
  { icon: Plug, label: 'Integrations', href: '/integration-settings' },
  { icon: SettingsIcon, label: 'Settings', href: '/sensory' },
  { icon: Star, label: 'Feedback', href: '/feedback' },
  { icon: LifeBuoy, label: 'Support', href: '/support' },
  { icon: HelpCircle, label: 'Help Center', href: '/help-center' },
  { icon: Shield, label: 'Privacy Policy', href: '/privacy' },
];

const ROW = 'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors';

export default function MoreMenuSheet({ open, onOpenChange }) {
  const navigate = useNavigate();
  const close = () => onOpenChange(false);

  const go = (href) => {
    close();
    navigate(href);
  };

  // Close first so the mic can attach to the next field the member focuses
  const startDictation = () => {
    close();
    requestDictate();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="md:hidden max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-display">More</DrawerTitle>
          <DrawerDescription>Voice tools and everything else in your workspace.</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-8 space-y-1 overflow-y-auto">
          <div onClick={close}>
            <ReadAloudButton variant="sidebar" />
          </div>
          <button type="button" onClick={startDictation} className={ROW}>
            <Mic className="w-4 h-4 shrink-0" /> Dictate
          </button>

          <div className="h-px bg-border my-3" />

          {SECONDARY_LINKS.map(({ icon: Icon, label, href }) => (
            <button key={href} type="button" onClick={() => go(href)} className={ROW}>
              <Icon className="w-4 h-4 shrink-0" /> {label}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}