# Requirements

## R1 · Search free rooms
A guest can search for available rooms for a given date range.
The system returns only rooms that have no overlapping reservation.

## R2 · Book a room
A guest can reserve a free room for a given date range.
The system confirms the booking and sends an e-mail notification.

## R3 · Refuse clashes
If a room is already booked for overlapping dates, the system refuses the new booking (returns None / null).

## R4 · E-mail confirmation
When a booking is confirmed, the system sends an e-mail confirmation to the guest.

## R5 · Cancel a booking
A guest can cancel an existing reservation by its ID.
The system removes it and the room becomes available again.
