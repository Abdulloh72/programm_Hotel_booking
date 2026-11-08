/**
 * test_booking_service.js
 * P04 – 8 ta to'liq test:
 * 6 ta P03/P04 testlari + 2 ta Step 7 testlari (R6 va SMS).
 *
 * Ishga tushirish: node --test test_booking_service.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BookingService }           from './hotel_booking/booking.js';
import { Guest, Room, DateRange }   from './hotel_booking/domain.js';
import { InMemoryReservationStore } from './hotel_booking/stores.js';
import { SmsNotificationSender }    from './hotel_booking/notifications.js';

// ── Testlar uchun FakeNotificationSender (Step 7.1) ───────────────────────────
class FakeNotificationSender {
  constructor(fail = false) {
    this.fail = fail;
    this.sent = []; // yuborilgan reservation ID lari
  }

  sendConfirmation(reservation) {
    if (this.fail) {
      throw new Error('The mail server is down.');
    }
    this.sent.push(reservation.id);
  }
}

// ── Umumiy ma'lumotlar ────────────────────────────────────────────────────────

const R7   = new Room('R7', 'Standard');
const R8   = new Room('R8', 'Deluxe');

const MAYA = new Guest('Maya', 'maya@example.com');
const OMAR = new Guest('Omar', 'omar@example.com');
const NORA = new Guest('Nora', 'nora@example.com');

function nov(checkIn, checkOut) {
  return new DateRange(
    new Date(2026, 10, checkIn),
    new Date(2026, 10, checkOut)
  );
}

// Yangi service qurish yordamchisi (har qanday senderni qabul qiladi)
function newService(failingSender = false) {
  const store   = new InMemoryReservationStore();
  const sender  = new FakeNotificationSender(failingSender);
  const service = new BookingService([R7, R8], store, sender);
  return [service, store, sender];
}

// ── 8 ta test ─────────────────────────────────────────────────────────────────

// 1. Bo'sh xona bron qilinadi
test('Maya gets R7 when it is free', () => {
  const [service] = newService();
  const result = service.reserve(MAYA, R7, nov(12, 14));
  assert.strictEqual(String(result), 'Accepted R101');
});

// 2. To'qnashuv rad etiladi
test('Omar is refused when a night is shared', () => {
  const [service, store] = newService();
  service.reserve(MAYA, R7, nov(12, 14));
  const result = service.reserve(OMAR, R7, nov(13, 15));
  assert.strictEqual(String(result), 'Unavailable');
  assert.strictEqual(store.count(), 1);
});

// 3. Ketma-ket qo'shni sanalar mumkin
test('Nora can arrive on the day Maya leaves', () => {
  const [service] = newService();
  service.reserve(MAYA, R7, nov(12, 14));
  const result = service.reserve(NORA, R7, nov(14, 16));
  assert.strictEqual(String(result), 'Accepted R102');
});

// 4. Noto'g'ri sanalar rad etiladi
test('check-out must be after check-in', () => {
  const [service, store] = newService();
  const result = service.reserve(OMAR, R8, nov(15, 15));
  assert.strictEqual(String(result), 'InvalidDates');
  assert.strictEqual(store.count(), 0);
});

// 5. Bekor qilingan xona qayta bo'sh bo'ladi
test('cancelling frees the room again', () => {
  const [service] = newService();
  service.reserve(MAYA, R7, nov(12, 14));
  const ok = service.cancel('R101');
  assert.strictEqual(ok, true);
  const freeRooms = service.findFreeRooms(nov(12, 14));
  assert.ok(freeRooms.includes(R7), 'R7 should be free after cancellation');
});

// 6. Faqat qabul qilingan bronlar tasdiqlanadi (ID lari tekshiriladi)
test('one confirmation per accepted booking', () => {
  const [service, , sender] = newService();
  service.reserve(MAYA, R7, nov(12, 14)); // Accepted
  service.reserve(OMAR, R7, nov(13, 15)); // Unavailable
  service.reserve(NORA, R7, nov(14, 16)); // Accepted
  assert.deepStrictEqual(sender.sent, ['R101', 'R102']);
});

// 7. R6 · Xabar jo'natish xatosi bronni bekor qilmaydi
test('a failed confirmation keeps the booking', () => {
  const [service, store] = newService(true); // server ishlamayapti (fail = true)
  const result = service.reserve(MAYA, R7, nov(12, 14));

  assert.strictEqual(String(result), 'Accepted R101');
  assert.strictEqual(result.notificationFailed, true);
  assert.strictEqual(store.count(), 1);
});

// 8. SMS jo'natish BookingService ga tegilmasdan ishlaydi (Open/Closed)
test('sms confirmations need no change to booking service', () => {
  const sms     = new SmsNotificationSender();
  const service = new BookingService([R7, R8], new InMemoryReservationStore(), sms);
  service.reserve(MAYA, R7, nov(12, 14));
  assert.strictEqual(sms.sent, 1);
});
