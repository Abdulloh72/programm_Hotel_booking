// domain.js — barcha asosiy ma'lumot klasslari

// ── DateRange ─────────────────────────────────────────────────────────────────
export class DateRange {
  constructor(checkIn, checkOut) {
    this.checkIn  = checkIn;
    this.checkOut = checkOut;
  }

  // checkOut > checkIn bo'lishi shart
  isValid() {
    return this.checkOut > this.checkIn;
  }

  // Ikki oraliq ustma-ust tushadimi?
  // [1-iyun, 7-iyun) va [7-iyun, 10-iyun) → yo'q (qo'shni sanalar OK)
  overlaps(other) {
    return this.checkIn < other.checkOut && other.checkIn < this.checkOut;
  }
}

// ── Guest ─────────────────────────────────────────────────────────────────────
export class Guest {
  constructor(name, email) {
    this.name  = name;
    this.email = email;
  }
}

// ── Room ──────────────────────────────────────────────────────────────────────
export class Room {
  constructor(id, type) {
    this.id   = id;   // "R7", "R8"
    this.type = type; // "Standard", "Deluxe"
  }
}

// ── ReservationStatus ─────────────────────────────────────────────────────────
export const ReservationStatus = Object.freeze({
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
});

// ── Reservation ───────────────────────────────────────────────────────────────
export class Reservation {
  constructor(id, guest, room, stay) {
    this.id     = id;     // "R101", "R102" ...
    this.guest  = guest;
    this.room   = room;
    this.stay   = stay;   // DateRange
    this.status = ReservationStatus.CONFIRMED;
  }

  // Bron shu xona va sana uchun to'sqinlik qiladimi?
  // Faqat CONFIRMED va sanalar ustma-ust tushsa — ha
  blocks(room, stay) {
    return (
      this.status === ReservationStatus.CONFIRMED &&
      this.room.id === room.id &&
      this.stay.overlaps(stay)
    );
  }

  // Bronni bekor qilish → true (muvaffaqiyatli), false (allaqachon bekor)
  cancel() {
    if (this.status === ReservationStatus.CANCELLED) return false;
    this.status = ReservationStatus.CANCELLED;
    return true;
  }
}

// ── BookingResult ─────────────────────────────────────────────────────────────
// reserve() ning natijasi: "Accepted R101" | "Unavailable" | "InvalidDates"
export class BookingResult {
  constructor(outcome, reservationId = null, notificationFailed = false) {
    this.outcome            = outcome;            // "Accepted", "Unavailable", "InvalidDates"
    this.reservationId      = reservationId;      // "R101" yoki null
    this.notificationFailed = notificationFailed; // boolean (R6 qoidasi)
  }

  toString() {
    // "Accepted R101" yoki shunchaki "Unavailable"
    return this.reservationId
      ? `${this.outcome} ${this.reservationId}`
      : this.outcome;
  }
}
