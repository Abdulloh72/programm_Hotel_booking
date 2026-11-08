// src/notifications/internal/sms.js
// Simulated: counts the SMS messages it would send and needs no network.
export class SmsNotificationSender {
  sent = 0;

  sendConfirmation(confirmation) {
    this.sent += 1;
    console.log(
      `[SMS] To: ${confirmation.guestEmail} | Booking confirmed – Room ${confirmation.roomNumber}`
    );
  }
}
