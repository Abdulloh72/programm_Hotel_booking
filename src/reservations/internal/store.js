// src/reservations/internal/store.js
// Reservations internal storage: in-memory reservation list

export class InMemoryReservationStore {
  constructor() {
    this._rows = [];
  }

  get count() {
    const fn = () => this._rows.length;
    fn.valueOf = () => this._rows.length;
    return fn;
  }

  hasOverlap(room, stay) {
    return this._rows.some(row => row.blocks(room, stay));
  }

  save(reservation) {
    this._rows.push(reservation);
  }

  find(reservationId) {
    return this._rows.find(row => row.id === reservationId) ?? null;
  }

  countConfirmed(room, stay) {
    return this._rows.filter(row => row.blocks(room, stay)).length;
  }
}
