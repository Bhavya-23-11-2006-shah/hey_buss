import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { StatTile } from '../components/ui/StatTile';
import { RouteBadge } from '../components/ui/RouteBadge';
import {
  BusIcon,
  MicIcon,
  CheckIcon,
  BlindIcon,
  DeafIcon,
  WheelchairIcon,
  ClockIcon,
  HelpIcon,
  ArrowRightIcon,
} from '../components/Icons';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Catch PWA beforeinstallprompt
  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else {
      alert('To install Hey Buss, tap "Add to Home Screen" or the Install icon in your browser address bar.');
    }
  };

  return (
    <div className="space-y-12 pb-16 max-w-5xl mx-auto">
      {/* Page explanation */}
      <div className="sr-only" role="doc-subtitle">
        Hey Buss homepage. Learn how accessible government transit works and tap Start to book your ride.
      </div>

      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 sm:pt-8" aria-labelledby="hero-heading">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-neutral-300 text-xs font-bold text-cobalt uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span>Kolkata Accessible Transit Network</span>
        </div>

        <h1
          id="hero-heading"
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-ink tracking-tight leading-tight max-w-3xl mx-auto"
        >
          A bus that is ready for you.
        </h1>

        <p className="text-lg sm:text-xl text-muted font-normal max-w-2xl mx-auto">
          An accessible bus booking demo. Search sample Kolkata routes, save an assistance profile, and follow the backend’s simulated bus updates.
        </p>

        {/* Start and Install CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/app')}
            rightIcon={<ArrowRightIcon size={20} />}
            className="w-full sm:w-auto text-lg px-8 min-h-[56px]"
          >
            Start Your Journey
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={handleInstall}
            className="w-full sm:w-auto text-base min-h-[56px]"
          >
            Install App (Offline PWA)
          </Button>
        </div>

        {/* Live Board Sample Typing Simulation */}
        <div
          className="card bg-surface p-4 max-w-xl mx-auto text-left border border-neutral-300 space-y-2 mt-4"
          aria-label="Example voice conversation"
        >
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted uppercase">
            <MicIcon size={14} className="text-cobalt" />
            <span>Passenger spoke:</span>
          </div>
          <div className="font-bold text-ink text-base">
            "Hey Buss, find a bus from Esplanade to Salt Lake Sector V at 9am"
          </div>
          <div className="pt-2 border-t border-neutral-200 text-xs font-bold text-cobalt flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-marigold" />
            <span>Assistant reply depends on the connected backend’s current demo schedule.</span>
          </div>
        </div>
      </section>

      {/* Gliding Bus Route Visualization */}
      <section
        aria-label="Bus route illustration"
        className="card p-6 bg-surface overflow-hidden"
      >
        <div className="flex items-center justify-between text-xs font-mono font-bold text-muted uppercase mb-4">
          <span>Sample route • Esplanade to Salt Lake Sector V</span>
          <span>Illustration only</span>
        </div>

        <div className="relative py-4">
          {/* Connecting track line */}
          <div className="h-2 bg-neutral-300 w-full rounded-full relative">
            <div className="absolute top-1/2 left-[5%] -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-cobalt" />
            <div className="absolute top-1/2 left-[50%] -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-cobalt" />
            <div className="absolute top-1/2 left-[95%] -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-cobalt" />
          </div>

          {/* Gliding Bus */}
          <div className="animate-bus-glide w-12 h-12 flex items-center justify-center -mt-7">
            <div className="p-2 bg-cobalt text-white rounded-btn shadow-md">
              <BusIcon size={24} />
            </div>
          </div>

          <div className="flex justify-between text-xs font-bold mt-2 text-ink">
            <span>Esplanade</span>
            <span>Route S12</span>
            <span>Salt Lake Sector V</span>
          </div>
        </div>
      </section>

      {/* How it Works - 4 Steps */}
      <section aria-labelledby="steps-heading" className="space-y-6">
        <div className="text-center space-y-1">
          <h2 id="steps-heading" className="text-2xl sm:text-3xl font-bold text-ink">
            How Hey Buss Works
          </h2>
          <p className="text-sm text-muted">Four simple steps from home to your destination.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 space-y-3">
            <div className="w-10 h-10 rounded-btn bg-blue-50 text-cobalt flex items-center justify-center font-black text-lg border border-blue-200">
              1
            </div>
            <h3 className="text-lg font-bold text-ink">Say where you want to go</h3>
            <p className="text-sm text-muted">
              Tap the large Talk button or speak hands-free. No typing or complicated route maps required.
            </p>
          </div>

          <div className="card p-5 space-y-3">
            <div className="w-10 h-10 rounded-btn bg-yellow-50 text-amber-900 flex items-center justify-center font-black text-lg border border-yellow-200">
              2
            </div>
            <h3 className="text-lg font-bold text-ink">Choose an available trip</h3>
            <p className="text-sm text-muted">
            The demo checks each trip’s listed ramp and wheelchair bay availability before booking.
            </p>
          </div>

          <div className="card p-5 space-y-3">
            <div className="w-10 h-10 rounded-btn bg-green-50 text-success flex items-center justify-center font-black text-lg border border-green-200">
              3
            </div>
            <h3 className="text-lg font-bold text-ink">Get your boarding pass</h3>
            <p className="text-sm text-muted">
              A booking QR and a 30-second cancellation window. The map shows simulated backend bus positions.
            </p>
          </div>

          <div className="card p-5 space-y-3">
            <div className="w-10 h-10 rounded-btn bg-surface text-ink flex items-center justify-center font-black text-lg border border-neutral-300">
              4
            </div>
            <h3 className="text-lg font-bold text-ink">A person is waiting</h3>
            <p className="text-sm text-muted">
              Your assistance instructions are stored with your booking for the demo conductor page.
            </p>
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <section aria-labelledby="who-heading" className="space-y-6">
        <div className="text-center space-y-1">
          <h2 id="who-heading" className="text-2xl sm:text-3xl font-bold text-ink">
            Designed for Every Accessibility Need
          </h2>
          <p className="text-sm text-muted">Tailored modes that work seamlessly together.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 space-y-2">
            <div className="p-3 bg-blue-50 text-cobalt rounded-btn w-fit border border-blue-200">
              <BlindIcon size={24} />
            </div>
            <h3 className="font-bold text-lg text-ink">Blind & Low Vision</h3>
            <p className="text-sm text-muted">
              Double-tap anywhere to speak. Screen reads aloud every update automatically.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <div className="p-3 bg-yellow-50 text-amber-900 rounded-btn w-fit border border-yellow-200">
              <DeafIcon size={24} />
            </div>
            <h3 className="font-bold text-lg text-ink">Deaf & Hard of Hearing</h3>
            <p className="text-sm text-muted">
              Full visual captions, haptic vibrations, screen flash alerts, and conductor phrase cards.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <div className="p-3 bg-green-50 text-success rounded-btn w-fit border border-green-200">
              <WheelchairIcon size={24} />
            </div>
            <h3 className="font-bold text-lg text-ink">Wheelchair Users</h3>
            <p className="text-sm text-muted">
              Guaranteed low-floor ramp buses only. Live count of open bay slots per bus.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <div className="p-3 bg-purple-50 text-purple-900 rounded-btn w-fit border border-purple-200">
              <HelpIcon size={24} />
            </div>
            <h3 className="font-bold text-lg text-ink">Speech & Mobility</h3>
            <p className="text-sm text-muted">
              Type-to-speak phrases, 1-tap quick destinations, and 2-second emergency SOS.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section aria-label="System stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Sample Fleet" value="6 Trips" subtext="In-memory demo schedule" />
        <StatTile label="Stops Listed" value="8" subtext="Kolkata sample locations" />
        <StatTile label="Undo Window" value="30 Sec" subtext="For new bookings" />
        <StatTile label="Accessibility" value="Tools" subtext="Screen reader and text support" />
      </section>

      {/* Why you can trust it */}
      <section className="card p-6 sm:p-8 bg-surface space-y-6" aria-labelledby="trust-heading">
        <h2 id="trust-heading" className="text-2xl font-bold text-ink">
          Why You Can Trust Hey Buss
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-ink">
              <CheckIcon size={18} className="text-success" />
              <span>Direct Conductor Link</span>
            </div>
            <p className="text-sm text-muted">
              Your assistance profile is included with the booking and shown on the demo conductor page.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-ink">
              <CheckIcon size={18} className="text-success" />
              <span>No Stranded Guarantee</span>
            </div>
            <p className="text-sm text-muted">
              The booking search lists earlier and later trips that meet the selected accessibility needs.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-ink">
              <CheckIcon size={18} className="text-success" />
              <span>Offline First</span>
            </div>
            <p className="text-sm text-muted">
              The interface is installable as a PWA. Booking and live updates require the backend connection.
            </p>
          </div>
        </div>
      </section>

      {/* Sample Passenger Ticket Beside Conductor Card */}
      <section className="space-y-4" aria-label="Sample ticket preview">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-ink">What Both Sides See</h2>
          <p className="text-sm text-muted">Real-time mutual awareness between passenger and crew.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Passenger Ticket Sample */}
          <div className="card p-5 border-2 border-neutral-300 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <span className="text-xs font-bold uppercase text-muted">Passenger View</span>
              <RouteBadge route="S12" />
            </div>
            <div className="text-xl font-black text-ink">Esplanade → Salt Lake Sector V</div>
            <div className="text-sm text-muted flex items-center gap-2">
              <ClockIcon size={16} className="text-cobalt" />
              <span>Departs 09:00 AM • Low Floor Ramp</span>
            </div>
            <div className="p-3 bg-blue-50 text-cobalt rounded-btn text-xs font-bold">
              Demo booking • Assistance details attached
            </div>
          </div>

          {/* Conductor Card Sample */}
          <div className="card p-5 border-2 border-neutral-300 bg-surface space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <span className="text-xs font-bold uppercase text-muted">Conductor Dashboard View</span>
              <span className="text-xs font-bold text-success uppercase">Alert Received</span>
            </div>
            <div className="text-lg font-bold text-ink">Passenger: Ramanpreet Kaur</div>
            <div className="text-xs font-mono text-muted">Boarding at: Howrah Station Bay 1</div>
            <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-btn text-xs font-bold">
              ACTION: Prepare wheelchair ramp • 1 wheelchair bay reserved onboard.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-neutral-300 text-center space-y-2">
        <p className="font-bold text-sm text-ink">
          Voice works while the app is open.
        </p>
        <p className="text-xs text-muted">
          Hey Buss • Accessible transit booking demo • Service and fleet data are examples
        </p>
      </footer>
    </div>
  );
};
