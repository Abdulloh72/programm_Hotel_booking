# Hotel contexts

## Words

| Word | Meaning here | Name in our code |
|---|---|---|
| Stay | Check-in to check-out, half-open: 12–14 Nov = the nights of the 12th and 13th | DateRange (checkIn, checkOut) |
| Reservation | Guest + room + stay + status, with an id such as R101 | Reservation (id, guest, room, stay, status) |
| Confirmed | The room is promised to this guest for these nights | ReservationStatus.CONFIRMED |
| Guest | The person staying at the hotel with name and email contact | Guest (name, email) |
| Room | A specific hotel room with an identifier and type (e.g. R7 Standard) | Room (id, type) |
| Room type | The category of room (Standard, Deluxe, Suite) with differing amenities | Room.type |
| Nightly price | The cost charged to the guest for staying one night in a room | not in code yet |
| Out of service | A room temporarily unavailable for guest stays due to maintenance or repairs | not in code yet |
| Cancelled | A reservation that was withdrawn; the room nights become available again | ReservationStatus.CANCELLED |
| Book | Reserve a free room for a guest over a valid date range | BookingService.reserve(guest, room, stay) |
| Cancel | Release an existing reservation by its ID and restore room availability | BookingService.cancel(reservationId) |
| Free rooms | Rooms that have no overlapping confirmed reservation for the requested stay | BookingService.findFreeRooms(stay) |
| Deposit | An advance partial payment (e.g. 30%) taken when a guest books a room | not in code yet |
| Paid | A payment transaction that has been successfully collected from the guest | not in code yet |
| Declined | A payment attempt that failed or was rejected by the payment gateway | not in code yet |
| Confirmation message | An email or SMS sent to the guest confirming their reservation details | INotificationSender.sendConfirmation(reservation) |
| Sent | A notification message successfully delivered to the recipient or provider | EmailNotificationSender.sent / SmsNotificationSender.sent |
| Failed | A notification delivery attempt that encountered an error | BookingResult.notificationFailed |

---

## Rooms

Job: Knows which rooms the hotel sells.

| Word | Meaning here |
|---|---|
| Room | A specific hotel room with an identifier, type and physical amenities |
| Room type | The category of room (Standard, Deluxe, Suite) with differing amenities |
| Nightly price | The cost charged to the guest for staying one night in a room |
| Out of service | A room temporarily unavailable for guest stays due to maintenance or repairs |

Rules this context owns:
- A room that is out of service is not offered to guests.
- The nightly price depends on the room type (Deluxe costs more than Standard).

Needs from other contexts: nothing.
Tells other contexts: the list of rooms (Rooms).

---

## Reservations

Job: Decides whether a guest gets a room for some nights, and keeps every reservation.

| Word | Meaning here |
|---|---|
| Stay | Check-in to check-out, half-open: 12–14 Nov = the nights of the 12th and 13th |
| Reservation | Guest + room number + stay + status, with an id such as R101 |
| Confirmed | The room is promised to this guest for these nights |
| Cancelled | The promise is withdrawn; the nights are free again |
| Guest | The person staying at the hotel with name and email contact |
| Book | Reserve a free room for a guest over a valid date range |
| Cancel | Release an existing reservation by its ID and restore room availability |
| Free rooms | Rooms that have no overlapping confirmed reservation for the requested stay |

Rules this context owns:
- A room never has two Confirmed reservations that share a night.
- Check-out must be after check-in.
- Cancelling a reservation frees its nights for new bookings.

Needs from other contexts: the list of rooms (Rooms).
Tells other contexts: ReservationConfirmed (Notifications).

---

## Payments

Job: Takes deposits and records whether they were paid.

| Word | Meaning here |
|---|---|
| Deposit | An advance partial payment (e.g. 30%) taken when a guest books a room |
| Paid | A payment transaction that has been successfully collected from the guest |
| Declined | A payment attempt that failed or was rejected by the payment gateway |

Rules this context owns:
- The deposit is 30% of the stay’s price.
- Only a Paid deposit can be refunded.

Needs from other contexts: reservation id and amount (Reservations, from P17).
Tells other contexts: deposit status Paid or Declined (Reservations, from P17).

---

## Notifications

Job: Tells guests what happened, by email or SMS.

| Word | Meaning here |
|---|---|
| Confirmation message | An email or SMS sent to the guest confirming their reservation details |
| Sent | A notification message successfully delivered to the recipient or provider |
| Failed | A notification delivery attempt that encountered an error |

Rules this context owns:
- A failed message is recorded as Failed and never changes the reservation.

Needs from other contexts: ReservationConfirmed (Reservations).
Tells other contexts: nothing.

---

## Same word, different meaning

| Word | Rooms | Reservations | Payments | Notifications |
|---|---|---|---|---|
| Status | In service / out of service | Confirmed / Cancelled | Paid / Declined | Sent / Failed |
| Room | R8: Deluxe, nightly price, out of service | Just the number R8 on a reservation | Not used | Text in the message: “Room R8” |
| Cancel | Take a room off sale | Withdraw a reservation | Refund a deposit | Not used |

If one shared Status field held Confirmed, Paid and Sent at once, a failed SMS could overwrite Confirmed with Failed, and Maya would lose R7 because of a message, breaking rule R6. Separate contexts keep each status where its rules live.

---

## Rule owners

Every rule needs exactly one owner: the context that keeps all the data the rule reads.

| Card | Rule | Owner | Why this owner |
|---|---|---|---|
| 1 | A room never has two Confirmed reservations that share a night. | Reservations | It keeps every reservation of the room, so it can check them all together. |
| 2 | Check-out must be after check-in. | Reservations | Stays are defined by check-in and check-out; Reservations validates booking dates. |
| 3 | Cancelling a reservation frees its nights for new bookings. | Reservations | It manages the calendar of confirmed nights and frees them upon cancellation. |
| 4 | A room that is out of service is not offered to guests. | Rooms | It owns physical room status and maintenance schedules. |
| 5 | The nightly price depends on the room type (Deluxe costs more than Standard). | Rooms | It owns room definitions, types and their nightly base pricing. |
| 6 | The deposit is 30% of the stay’s price. | Payments | Money rules belong to Payments; it asks Rooms for the nightly price. |
| 7 | Only a Paid deposit can be refunded. | Payments | It tracks deposit payment statuses and manages financial transactions. |
| 8 | A failed message is recorded as Failed and never changes the reservation. | Notifications | It owns message delivery tracking, ensuring communication errors never alter booking status. |

---

## Between contexts

### Reservations → Rooms: which rooms exist? (question)
Sent when: Reservations searches free rooms or validates a booking.
What Reservations sends: nothing.
The answer and its fields: the list of all sellable rooms.
- number: R7, R8
- type: Standard, Deluxe
Never crosses: Rooms' maintenance records, out-of-service repair notes, or historical logs.

### Reservations → Payments: take a deposit (question, from P17)
Sent when: a guest requests to book a room (in P17 saga).
What Reservations sends:
- reservationId: R101
- amount: 30% of the stay's price
The answer and its fields:
- status: Paid or Declined
Never crosses: Payments' payment gateway credentials, card details, or bank transaction ledger.

### Reservations → Notifications: ReservationConfirmed (event)
Sent when: a reservation is saved as Confirmed.
Fields:
- reservationId: R101
- guestEmail: maya@example.com
- roomNumber: R7
- checkIn: 2026-11-12
- checkOut: 2026-11-14
Reservations does not wait for an answer. A failed message never changes R101 (rule R6).
Never crosses: Reservations’ list of reservations. Notifications never reads it.
