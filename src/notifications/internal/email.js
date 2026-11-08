// src/notifications/internal/email.js
// Simulated: counts the messages it would send and needs no network.
export class EmailNotificationSender {
  sent = 0;

  sendConfirmation(confirmation) {
    this.sent += 1;
    console.log(
      `[EMAIL] To: ${confirmation.guestEmail} | Booking confirmed – Room ${confirmation.roomNumber}`
    );
  }
}
