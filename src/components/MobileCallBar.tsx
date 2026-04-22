import { Phone } from "lucide-react";
import { SITE } from "@/lib/site";

export function MobileCallBar() {
  return (
    <a
      href={`tel:${SITE.phone}`}
      className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex items-center justify-center gap-3 rounded-full bg-[var(--gradient-copper)] px-5 py-4 text-base font-semibold text-black shadow-[var(--shadow-copper)]"
      aria-label={`Appeler ${SITE.phoneDisplay}`}
    >
      <Phone className="h-5 w-5" />
      Appeler maintenant — {SITE.phoneDisplay}
    </a>
  );
}
