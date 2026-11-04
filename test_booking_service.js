/**
 * test_booking_service.js
 * Step 2 – P03 xatti-harakatini "qulflash" uchun 6 ta test.
 * Refaktoring oldidan ham, keyin ham barcha 6 ta test o'tishi kerak.
 *
 * Ishga tushirish: node --test test_booking_service.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

// ── Yangilangan import (5.6): yangi klasslar ─────────────────────────────────
import { BookingService }           from './hotel_booking/booking.js';
import { Guest, Room, DateRange }   from './hotel_booking/domain.js';
import { InMemoryReservationStore } from './hotel_booking/stores.js';
import { EmailNotificationSender }  from './hotel_booking/notifications.js';

// ── Umumiy ma'lumotlar (o'zgarmadi) ──────────────────────────────────────────

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

// ── Yangilangan newService (5.6) ──────────────────────────────────────────────
// Faqat shu funksiya o'zgardi — barcha 6 ta test body o'zgarmadi!
function newService() {
  const store         = new InMemoryReservationStore();  // ← yangi nom
  const notifications = new EmailNotificationSender();   // ← yangi nom
  const service       = new BookingService([R7, R8], store, notifications);
  return [service, store, notifications];
}

// ── 6 ta test (body lar butunlay o'zgarmagan) ─────────────────────────────────

// Test 1 · Bo'sh xona bron qilinadi
test('Maya gets R7 when it is free', () => {
  const [service] = newService();

  const result = service.reserve(MAYA, R7, nov(12, 14));

  assert.strictEqual(String(result), 'Accepted R101');
});

// Test 2 · To'qnashuv rad etiladi
test('Omar is refused when a night is shared', () => {
  const [service, store] = newService();

  service.reserve(MAYA, R7, nov(12, 14));
  const result = service.reserve(OMAR, R7, nov(13, 15));

  assert.strictEqual(String(result), 'Unavailable');
  assert.strictEqual(store.count(), 1);
});

// Test 3 · Ketma-ket qo'shni sanalar mumkin
test('Nora can arrive on the day Maya leaves', () => {
  const [service] = newService();

  service.reserve(MAYA, R7, nov(12, 14));
  const result = service.reserve(NORA, R7, nov(14, 16));

  assert.strictEqual(String(result), 'Accepted R102');
});

// Test 4 · Noto'g'ri sanalar rad etiladi
test('check-out must be after check-in', () => {
  const [service, store] = newService();

  const result = service.reserve(OMAR, R8, nov(15, 15));

  assert.strictEqual(String(result), 'InvalidDates');
  assert.strictEqual(store.count(), 0);
});

// Test 5 · Bekor qilingan xona qayta bo'sh bo'ladi
test('cancelling frees the room again', () => {
  const [service] = newService();

  service.reserve(MAYA, R7, nov(12, 14));
  const ok = service.cancel('R101');

  assert.strictEqual(ok, true);
  const freeRooms = service.findFreeRooms(nov(12, 14));
  assert.ok(freeRooms.includes(R7), 'R7 should be free after cancellation');
});

// Test 6 · Faqat qabul qilingan bronlarga email yuboriladi
test('one confirmation per accepted booking', () => {
  const [service, , notifications] = newService();

  service.reserve(MAYA, R7, nov(12, 14)); // Accepted → email
  service.reserve(OMAR, R7, nov(13, 15)); // Unavailable → email yo'q
  service.reserve(NORA, R7, nov(14, 16)); // Accepted → email

  assert.strictEqual(notifications.sent, 2);
});
