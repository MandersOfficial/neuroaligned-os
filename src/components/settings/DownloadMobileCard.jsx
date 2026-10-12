import { Smartphone, ExternalLink } from 'lucide-react';

const QR_IMAGE = 'https://media.base44.com/images/public/69d83404dff23f1198ddc883/106f05d54_DownloadNeuroalignedformobile1.png';
const DOWNLOAD_URL = 'https://link.sendlink.co/qr/foRH4ffiP8cR';

/**
 * "Download on mobile" — scan the QR code on a phone to install the
 * NeuroAligned iOS app, or open the download link directly.
 */
export default function DownloadMobileCard() {
  return (
    <section className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Smartphone className="w-4 h-4 text-primary" />
        <h2 className="font-display font-semibold text-base text-foreground">Download on Mobile</h2>
      </div>
      <p className="text-xs text-muted-foreground -mt-2 leading-relaxed">
        Take NeuroAligned with you. Scan the code with your iPhone camera to install the app, or open the link on your device.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        <img
          src={QR_IMAGE}
          alt="QR code to download NeuroAligned on Apple devices"
          className="w-40 h-40 object-contain shrink-0"
        />
        <div className="space-y-3 text-center sm:text-left">
          <p className="text-sm font-semibold text-foreground">NeuroAligned for iPhone</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Open your camera, point it at the code, and tap the link that appears. Apple devices only.
          </p>
          <a
            href={DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Download for iPhone
          </a>
        </div>
      </div>
    </section>
  );
}