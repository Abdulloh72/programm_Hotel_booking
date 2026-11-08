// src/reservations/domain.js
// Domain entities for Reservations

export class DateRange {
  constructor(checkIn, checkOut) {
    this.checkIn  = checkIn;
    this.checkOut = checkOut;
  }

  isValid() {
    return this.checkOut > this.checkIn;
  }

  overlaps(other) {
    return this.checkIn < other.checkOut && other.checkIn < this.checkOut;
  }
}

export class Guest {
  constructor(name, email) {
    this.name  = name;
    this.email = email;
  }
}

export const ReservationStatus = Object.freeze({
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
});

export class Reservation {
  constructor(id, guest, room, stay) {
    this.id     = id;
    this.guest  = guest;
    this.room   = room;
    this.stay   = stay;
    this.status = ReservationStatus.CONFIRMED;
  }

  blocks(room, stay) {
    const thisRoomNum = this.room.number ?? this.room.id;
    const targetRoomNum = room.number ?? room.id;
    return (
      this.status === ReservationStatus.CONFIRMED &&
      thisRoomNum === targetRoomNum &&
      this.stay.overlaps(stay)
    );
  }

  cancel() {
    if (this.status === ReservationStatus.CANCELLED) return false;
    this.status = ReservationStatus.CANCELLED;
    return true;
  }
}

export class BookingResult {
  constructor(outcome, reservationId = null, notificationFailed = false) {
    this.outcome            = outcome;
    this.reservationId      = reservationId;
    this.notificationFailed = notificationFailed;
  }

  toString() {
    return this.reservationId
      ? `${this.outcome} ${this.reservationId}`
      : this.outcome;
  }
}
