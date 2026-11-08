// notifications.js
//
// "Interfeys" (shartnoma):
//   INotificationSender — BookingService ga kerakli narsa:
//     sendConfirmation(reservation): void
//
// Barcha jo'natuvchilar shu shartnomani bajaradi.

/**
 * @interface INotificationSender
 * @method sendConfirmation(reservation)
 */

// 1. Email jo'natuvchi
export class EmailNotificationSender {
  constructor() {
    this.sent = 0;
  }

  sendConfirmation(reservation) {
    this.sent++;
    console.log(
      `[EMAIL] To: ${reservation.guest.email} | ` +
      `Booking confirmed – Room ${reservation.room.id}`
    );
  }
}

// 2. SMS jo'natuvchi (Step 7 da BookingService ga tegmasdan qo'shildi - Open/Closed!)
export class SmsNotificationSender {
  constructor() {
    this.sent = 0;
  }

  sendConfirmation(reservation) {
    this.sent++;
    console.log(
      `[SMS] To: ${reservation.guest.name} | ` +
      `Booking confirmed – Room ${reservation.room.id}`
    );
  }
}
