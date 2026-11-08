# P03 design notes

## Classes used
- **Room** – holds a room id and type.
- **DateRange** – holds check-in and check-out dates; knows how to detect overlaps.
- **Reservation** – links a guest, a room, and a date range; has an auto-assigned id ("R101", "R102" …).
- **ReservationStore** – keeps all reservations in a JavaScript array; assigns IDs.
- **EmailSender** – prints an e-mail confirmation to the console; counts sent emails.
- **BookingService** – the main service: search, reserve, cancel. Receives store and email via constructor.

## How clashes are detected (R3)
`reserve()` loops through all existing reservations. If any reservation uses the same room number **and** its `DateRange.overlaps()` returns True, the method returns `None` immediately.

## How the race occurs
Two threads both call `reserve()` at the same time. Both read the store before either has written, so neither sees the other's booking. Both succeed → double booking.

---

# P04 design notes

## Refactoring

Refactoring means reorganising the internal structure of code — renaming things, splitting files, introducing interfaces — while keeping its **observable behaviour exactly the same**.

Must stay the same:
- All 6 tests from Step 2 still pass after every move.
- The demo prints the same nine lines as in P03.
- The race demo still shows "Double booking!" (refactoring does not fix bugs).

## SOLID – five principles in plain words

| Harf | Qoida | Hotel misolida |
|------|-------|----------------|
| **S** – Single responsibility | Har bir klass faqat bitta o'zgarish sababiga ega. | `DateRange` faqat sana qoidalari uchun o'zgaradi; `EmailSender` faqat yuborish uchun. |
| **O** – Open/closed | Yangi xatti-harakatni mavjud kodni o'zgartirmay yangi kod bilan qo'shamiz. | SMS → yangi klass; `BookingService` ga tegmaymiz. |
| **L** – Liskov substitution | Har bir implementatsiya boshqasi bilan almashtirilishi mumkin. | Email, SMS yoki Fake sender — `BookingService` barchasi bilan ishlaydi. |
| **I** – Interface segregation | Interfeys kichik bo'lsin. | `INotificationSender` faqat bitta `send()` metodi. |
| **D** – Dependency inversion | Muhim klasslar konkret yordamchilarga emas, interfeyslarga bog'liq bo'lsin. | `BookingService` → `INotificationSender`, `EmailSender` emas. |

## What our code breaks

- `BookingService` asks for exactly `ReservationStore` **(D: dependency inversion)**. In P07 we would have to edit `BookingService` just to use a database — the booking rules have not changed, but we still touch the file that contains them.

- `BookingService` asks for exactly `EmailSender` **(D and O: dependency inversion + open/closed)**. Adding SMS means opening `BookingService` and editing its constructor and `reserve()` — working code that should never need to change for a new notification channel.

## Proof
- Tests: all 8 tests pass (6 original + R6 + SMS).
- Demo output: exactly the same 9 lines as before.
- Race demo: still double-books (refactoring does not fix concurrency bugs; planned for P09).

---

# P06 design notes

## Before
- Tests: 8 passing tests.
- Demo: exactly the same nine demo lines as P04.
- Race: still double-booking (two guests book the same room at the same moment).

## Modules

| Module | Public contract (others may use) | Internal code (only the module, the wiring and the tests) |
|---|---|---|
| Rooms | Room, the room catalog promise | InMemoryRoomCatalog |
| Reservations | BookingService, BookingResult, Reservation, DateRange, Guest, ReservationStatus, the store promise | InMemoryReservationStore |
| Payments | PaymentStatus, the payment service promise | SimulatedPaymentService |
| Notifications | Confirmation, the notification sender promise | EmailNotificationSender, SmsNotificationSender |

## Architecture rules

1. **Reservations uses only the public contracts of other modules:**
   BookingService may use the Notifications contract (`Confirmation`), never the email sender. Notifications can change how it sends without touching booking.
2. **Rooms does not depend on any other module:**
   Rooms knows nothing about reservations, money or messages. Rooms is the base everything else builds on.
3. **Payments and Notifications do not depend on Reservations:**
   The arrows point one way, from Reservations outwards. No dependency circle, ever.

## Broken on purpose
The check "Reservations uses only the public contracts of other modules" failed when `src/reservations/booking.js` directly imported `EmailNotificationSender` from `../notifications/internal/email.js`. The failure output clearly pinpointed the violation: `reservations/booking.js illegally imports internal code: "import { EmailNotificationSender } from '../notifications/internal/email.js';"`. Removing the forbidden import restored all checks to green.

## After
- Tests: 11 green checks (8 behaviour tests + 3 architecture boundary checks).
- Demo: the same nine demo lines as P04.
- Race: still double-booking (refactoring and modularizing do not fix concurrency bugs; planned for P09).


