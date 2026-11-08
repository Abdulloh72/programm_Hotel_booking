/**
 * test/booking.test.js
 * P06 – The 8 behaviour tests from P04 adapted to module imports.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BookingService, Guest, DateRange } from '../src/reservations/index.js';
import { Room } from '../src/rooms/index.js';
import { InMemoryReservationStore } from '../src/reservations/internal/store.js';
import { SmsNotificationSender } from '../src/notifications/internal/sms.js';

// ── Test fake sender ──────────────────────────────────────────────────────────
class FakeNotificationSender {
  constructor(fail = false) {
    this.fail = fail;
    this.sent = [];
  }

  sendConfirmation(confirmation) {
    if (this.fail) {
      throw new Error('The mail server is down.');
    }
    this.sent.push(confirmation.reservationId);
  }
}

// ── Test fixtures ─────────────────────────────────────────────────────────────
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

function newService(failingSender = false) {
  const store   = new InMemoryReservationStore();
  const sender  = new FakeNotificationSender(failingSender);
  const service = new BookingService([R7, R8], store, sender);
  return [service, store, sender];
}

// ── 8 Tests ───────────────────────────────────────────────────────────────────

test('Maya gets R7 when it is free', () => {
  const [service] = newService();
  const result = service.reserve(MAYA, R7, nov(12, 14));
  assert.strictEqual(String(result), 'Accepted R101');
});

test('Omar is refused when a night is shared', () => {
  const [service, store] = newService();
  service.reserve(MAYA, R7, nov(12, 14));
  const result = service.reserve(OMAR, R7, nov(13, 15));
  assert.strictEqual(String(result), 'Unavailable');
  assert.strictEqual(store.count(), 1);
});

test('Nora can arrive on the day Maya leaves', () => {
  const [service] = newService();
  service.reserve(MAYA, R7, nov(12, 14));
  const result = service.reserve(NORA, R7, nov(14, 16));
  assert.strictEqual(String(result), 'Accepted R102');
});

test('check-out must be after check-in', () => {
  const [service, store] = newService();
  const result = service.reserve(OMAR, R8, nov(15, 15));
  assert.strictEqual(String(result), 'InvalidDates');
  assert.strictEqual(store.count(), 0);
});

test('cancelling frees the room again', () => {
  const [service] = newService();
  service.reserve(MAYA, R7, nov(12, 14));
  const ok = service.cancel('R101');
  assert.strictEqual(ok, true);
  const freeRooms = service.findFreeRooms(nov(12, 14));
  assert.ok(freeRooms.some(r => r.equals(R7)), 'R7 should be free after cancellation');
});

test('one confirmation per accepted booking', () => {
  const [service, , sender] = newService();
  service.reserve(MAYA, R7, nov(12, 14));
  service.reserve(OMAR, R7, nov(13, 15));
  service.reserve(NORA, R7, nov(14, 16));
  assert.deepStrictEqual(sender.sent, ['R101', 'R102']);
});

test('a failed confirmation keeps the booking', () => {
  const [service, store] = newService(true);
  const result = service.reserve(MAYA, R7, nov(12, 14));
  assert.strictEqual(String(result), 'Accepted R101');
  assert.strictEqual(result.notificationFailed, true);
  assert.strictEqual(store.count(), 1);
});

test('sms confirmations need no change to booking service', () => {
  const sms     = new SmsNotificationSender();
  const service = new BookingService([R7, R8], new InMemoryReservationStore(), sms);
  service.reserve(MAYA, R7, nov(12, 14));
  assert.strictEqual(sms.sent, 1);
});
