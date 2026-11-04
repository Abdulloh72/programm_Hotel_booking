// notifications.js
//
// "Interfeys" (shartnoma) — JavaScript da interfeys yo'q,
// lekin JSDoc orqali qoidani aniq yozamiz:
//
// INotificationSender — BookingService dan kerakli narsa:
//   sendConfirmation(reservation): void
//
// Bu shartnomani bajaruvchi har qanday klass BookingService bilan ishlaydi.
// (Email, SMS, Fake — barchasi)

/**
 * @interface INotificationSender
 * @method sendConfirmation(reservation) - Mehmon xabardor qilinadi
 */

// EmailNotificationSender — INotificationSender ni bajaradi
export class EmailNotificationSender {
  constructor() {
    this.sent = 0; // nechta email yuborildi
  }

  // Shartnomadagi yagona metod
  sendConfirmation(reservation) {
    this.sent++;
    console.log(
      `[EMAIL] To: ${reservation.guest.email} | ` +
      `Booking confirmed – Room ${reservation.room.id}`
    );
  }
}
