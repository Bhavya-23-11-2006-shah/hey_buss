import React, { Suspense, lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import type { Booking } from '../types';
import { TicketCard } from '../components/ui/TicketCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { TicketIcon } from '../components/Icons';
import { speakText, vibrateDevice } from '../utils/speech';

// Lazy load QR Code chunk
const TicketQRCode = lazy(() => import('../components/TicketQRCode'));

export const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const activeBooking = useStore((state) => state.activeBooking);
  const setActiveBooking = useStore((state) => state.setActiveBooking);
  const profile = useStore((state) => state.profile);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);

  // Tabs: Upcoming | Past
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Past tickets archive (real Kolkata history)
  const pastBookings: Booking[] = [
    {
      id: 'B-kol-781',
      tripId: 'HB-801',
      from: 'Esplanade (Gate 2)',
      to: 'Salt Lake Sector V',
      departs: '08:30',
      status: 'ASSISTING',
      profile: { ...profile, name: profile.name || 'Passenger' },
      message: 'Completed safely with ramp assistance.',
    },
    {
      id: 'B-kol-652',
      tripId: 'HB-902',
      from: 'Howrah Station',
      to: 'Airport Gate 3',
      departs: '10:10',
      status: 'ASSISTING',
      profile: { ...profile, name: profile.name || 'Passenger' },
      message: 'Completed with wheelchair bay reserved.',
    },
  ];

  const handleUndoBooking = async (id: string) => {
    vibrateDevice(100);
    try {
      await apiClient.undoBooking(id);
      setActiveBooking(null);
      const msg = 'Booking cancelled and wheelchair bay released.';
      setDestinationBoardText(msg);
      speakText(msg, profile.language);
    } catch (err: any) {
      alert(err.message || 'Cannot undo booking now.');
    }
  };

  const handleShare = (booking: Booking) => {
    vibrateDevice(50);
    const text = `Hey Buss Boarding Pass: ${booking.from} to ${booking.to} at ${booking.departs}. Booking ID: ${booking.id}.`;
    if (navigator.share) {
      navigator.share({ title: 'My Hey Buss Ticket', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Ticket details copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      {/* Page explanation */}
      <div className="bg-surface border border-neutral-300 p-3 rounded-card text-xs text-muted flex items-center justify-between">
        <span>🎫 <strong>Tickets:</strong> Your digital boarding passes, conductor timeline, QR verification, and journey sharing.</span>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-neutral-300" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'upcoming'}
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-3 text-center font-bold text-base border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'border-cobalt text-cobalt font-black'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Upcoming Rides
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'past'}
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-3 text-center font-bold text-base border-b-2 transition-colors ${
            activeTab === 'past'
              ? 'border-cobalt text-cobalt font-black'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Past Travel History
        </button>
      </div>

      {/* UPCOMING TAB */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          {activeBooking && activeBooking.status !== 'CANCELLED' ? (
            <div className="space-y-4">
              <TicketCard
                booking={activeBooking}
                showQr={true}
                qrElement={
                  <Suspense fallback={<div className="w-32 h-32 bg-neutral-100 animate-pulse" />}>
                    <TicketQRCode data={`HEYBUSS:${activeBooking.id}:${activeBooking.from}:${activeBooking.to}`} />
                  </Suspense>
                }
                onUndo={() => handleUndoBooking(activeBooking.id)}
                onShare={() => handleShare(activeBooking)}
              />

              <div className="flex gap-3">
                <Button
                  size="md"
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/app/track')}
                >
                  Track Bus Live on Map →
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<TicketIcon size={36} />}
              heading="No active tickets right now"
              body="You don't have an upcoming bus booked. Book in seconds with voice or keyboard."
              action={{
                label: 'Book a Bus Now',
                onClick: () => navigate('/app/book'),
              }}
            />
          )}
        </div>
      )}

      {/* PAST TAB */}
      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastBookings.map((b) => (
            <TicketCard
              key={b.id}
              booking={b}
              showQr={false}
              onShare={() => handleShare(b)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
