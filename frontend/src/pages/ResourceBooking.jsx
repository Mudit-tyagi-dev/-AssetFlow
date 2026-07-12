import { Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';

export default function ResourceBooking() {
  const bookings = [
    { id: 1, title: 'Conference Room A', time: '10:00 AM - 11:30 AM', user: 'Alex Carter', status: 'Approved' },
    { id: 2, title: 'Projector #2', time: '1:00 PM - 3:00 PM', user: 'Sarah Jenkins', status: 'Pending' },
    { id: 3, title: 'Company Vehicle - Van', time: 'All Day', user: 'Logistics Team', status: 'Approved' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-on-surface">Resource Booking</h1>
        <button className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary transition-colors">
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 text-on-surface-variant text-sm border-b border-outline-variant pb-4">
          <button className="flex items-center gap-2 font-medium text-primary border-b-2 border-primary pb-4 -mb-[17px]">
            <CalendarIcon className="w-4 h-4" /> Upcoming
          </button>
          <button className="flex items-center gap-2 font-medium hover:text-on-surface pb-4">
            <Clock className="w-4 h-4" /> Past Bookings
          </button>
        </div>

        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="flex items-center justify-between p-4 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container-high rounded flex items-center justify-center text-on-surface-variant">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-on-surface">{b.title}</div>
                  <div className="text-sm text-on-surface-variant flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5" /> {b.time} • {b.user}
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === 'Approved' ? 'bg-secondary-container/20 text-secondary' : 'bg-tertiary-container/20 text-tertiary'}`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
