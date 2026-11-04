// main.js — demo va race demo
//
// Bu fayl "sim" (wiring) joyi:
// faqat shu yerda qaysi Store va qaysi Sender tanlanadi.
// BookingService bu tanlovni bilmaydi.

import { BookingService }           from './hotel_booking/booking.js';
import { Guest, Room, DateRange }   from './hotel_booking/domain.js';
import { InMemoryReservationStore } from './hotel_booking/stores.js';
import { EmailNotificationSender }  from './hotel_booking/notifications.js';

// Mehmonxonadagi xonalar
const ROOMS = [
  new Room('R7', 'Standard'),
  new Room('R8', 'Deluxe'),
];

// Mehmonlar
const MAYA  = new Guest('Maya',  'maya@example.com');
const OMAR  = new Guest('Omar',  'omar@example.com');
const NORA  = new Guest('Nora',  'nora@example.com');

// Sana oralig'i yordamchi
function nov(checkIn, checkOut) {
  return new DateRange(new Date(2026, 10, checkIn), new Date(2026, 10, checkOut));
}

// Xona nomlarini satr sifatida ko'rsatish
function names(rooms) {
  return rooms.map(r => r.id).join(', ');
}

// ── Oddiy demo ────────────────────────────────────────────────────────────────
function runDemo() {
  // Faqat shu joyda haqiqiy store va sender tanlanadi
  const store         = new InMemoryReservationStore();
  const notifications = new EmailNotificationSender();
  const service       = new BookingService(ROOMS, store, notifications);

  console.log(`Free rooms 12-14 Nov:          ${names(service.findFreeRooms(nov(12, 14)))}`);
  console.log(`Maya books R7  12-14 Nov:      ${service.reserve(MAYA, ROOMS[0], nov(12, 14))}`);
  console.log(`Omar books R7  13-15 Nov:      ${service.reserve(OMAR, ROOMS[0], nov(13, 15))}`);
  console.log(`Nora books R7  14-16 Nov:      ${service.reserve(NORA, ROOMS[0], nov(14, 16))}`);
  console.log(`Omar books R8  15-15 Nov:      ${service.reserve(OMAR, ROOMS[1], nov(15, 15))}`);
  console.log(`Free rooms 12-14 Nov:          ${names(service.findFreeRooms(nov(12, 14)))}`);
  console.log(`Maya cancels R101:             ${service.cancel('R101')}`);
  console.log(`Free rooms 12-14 Nov:          ${names(service.findFreeRooms(nov(12, 14)))}`);
  console.log(`Confirmation emails sent:      ${notifications.sent}`);
}

// ── Race demo ─────────────────────────────────────────────────────────────────
async function runRace() {
  const store   = new InMemoryReservationStore();
  const service = new BookingService(ROOMS, store, new EmailNotificationSender());
  const results = {};
  const stay    = nov(12, 14);

  console.log('Maya va Omar bir vaqtda R7 ni 12-14 Noyabr uchun bron qilmoqda...');

  function book(guest) {
    results[guest.name] = service.reserve(guest, ROOMS[0], stay);
  }

  await Promise.all([
    new Promise(resolve => setTimeout(() => { book(MAYA); resolve(); }, 0)),
    new Promise(resolve => setTimeout(() => { book(OMAR); resolve(); }, 0)),
  ]);

  console.log(`Maya: ${results['Maya']}`);
  console.log(`Omar: ${results['Omar']}`);

  const confirmed = store.countConfirmed(ROOMS[0], stay);
  console.log(`R7 uchun tasdiqlangan bronlar: ${confirmed}`);
  console.log(confirmed > 1 ? 'Double booking!' : 'Faqat bitta mehmon R7 ga ega.');
}

// ── Entry point ───────────────────────────────────────────────────────────────
if (process.argv.includes('--race')) {
  runRace();
} else {
  runDemo();
}
