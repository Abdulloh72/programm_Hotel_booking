// booking.js — asosiy mantiq
//
// BookingService faqat IKKI SHARTNOMAGA bog'liq:
//   IReservationStore     → store.hasOverlap(), store.save(), store.find(), store.count()
//   INotificationSender   → notifications.sendConfirmation()
//
// Qaysi klass bu shartnomani bajarishini BookingService bilmaydi — bu main.js ishi.

import { BookingResult, Reservation } from './domain.js';

export class BookingService {
  // Dependency injection: rooms, store va notifications tashqaridan beriladi
  constructor(rooms, store, notifications) {
    this._rooms         = rooms;         // Room[]
    this._store         = store;         // IReservationStore
    this._notifications = notifications; // INotificationSender
  }

  // R1 · Bo'sh xonalarni qidirish
  findFreeRooms(stay) {
    return this._rooms.filter(room => !this._store.hasOverlap(room, stay));
  }

  // R2 + R3 + R4 · Bron qilish
  reserve(guest, room, stay) {
    // Sana noto'g'ri
    if (!stay.isValid()) {
      return new BookingResult('InvalidDates');
    }

    // To'qnashuv bor
    if (this._store.hasOverlap(room, stay)) {
      return new BookingResult('Unavailable');
    }

    // ID: R101, R102 ... (joriy bronlar soni + 101)
    const id          = `R${101 + this._store.count()}`;
    const reservation = new Reservation(id, guest, room, stay);

    this._store.save(reservation);

    try {
      this._notifications.sendConfirmation(reservation);
    } catch {
      // R6: booking saqlab bo'lingan, xabar yuborishdagi xato uni bekor qilmaydi
      return new BookingResult('Accepted', id, true);
    }

    return new BookingResult('Accepted', id, false); // → "Accepted R101"
  }

  // R5 · Bron bekor qilish
  cancel(reservationId) {
    const reservation = this._store.find(reservationId);
    return reservation !== null && reservation.cancel();
  }
}
