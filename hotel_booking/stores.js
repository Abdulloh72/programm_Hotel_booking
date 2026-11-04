// stores.js
//
// "Interfeys" (shartnoma):
//
// IReservationStore — BookingService dan kerakli narsa:
//   count()                         → number
//   hasOverlap(room, stay)          → boolean
//   save(reservation)               → void
//   find(reservationId)             → Reservation | null
//   countConfirmed(room, stay)      → number
//
// Bugun: xotiradagi ro'yxat (InMemoryReservationStore)
// P07 da: PostgreSQL (PostgresReservationStore) — BookingService o'zgarmaydi!

/**
 * @interface IReservationStore
 */

// InMemoryReservationStore — IReservationStore ni bajaradi
export class InMemoryReservationStore {
  constructor() {
    this._rows = []; // barcha bronlar
  }

  // Jami bronlar soni
  count() {
    return this._rows.length;
  }

  // Shu xona va sanada to'qnashuv bormi?
  hasOverlap(room, stay) {
    return this._rows.some(row => row.blocks(room, stay));
  }

  // Yangi bron saqlash
  save(reservation) {
    this._rows.push(reservation);
  }

  // ID bo'yicha bron topish (topilmasa null)
  find(reservationId) {
    return this._rows.find(row => row.id === reservationId) ?? null;
  }

  // Shu xona va sanada tasdiqlangan bronlar soni (race demo uchun)
  countConfirmed(room, stay) {
    return this._rows.filter(row => row.blocks(room, stay)).length;
  }
}
