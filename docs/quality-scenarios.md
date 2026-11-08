# Quality scenarios

## Stakeholders

| Who | What they care about |
|---|---|
| Guest | Finds a free room quickly; never loses a booking |
| Receptionist | Never promises one room twice; can cancel at the desk |
| Hotel manager (domain expert) | Knows the rules; wants deposits and SMS soon |
| Development team | Can change one area without breaking the others |
| Email/SMS and payment providers | Outside systems that can be slow or down |

---

## S1 · Performance: fast free-room search

| Part | S1 |
|---|---|
| Source | 200 guests |
| Stimulus | They search free rooms for 12–14 Nov |
| Environment | Within one minute, normal operating conditions |
| Artifact | Free-room search in BookingService (`findFreeRooms`) |
| Response | Returns correct free rooms without dropping requests |
| Measure | Correct free rooms; p95 response time ≤ 1 second |
| Checked in | P08 (cache) and P23 (load test) |

---

## S2 · Data integrity: no double bookings under concurrency

| Part | S2 |
|---|---|
| Source | 100 pairs of guests |
| Stimulus | They book the same room and nights at the exact same moment |
| Environment | High concurrent load |
| Artifact | Reservation storage and BookingService.reserve |
| Response | Exactly one guest receives Confirmed per pair; the other is refused as Unavailable |
| Measure | Exactly 1 Confirmed reservation per pair; 0 double bookings |
| Checked in | P09 |

---

## S3 · Availability: a failed message keeps the booking

| Part | S3 |
|---|---|
| Source | The email provider |
| Stimulus | It stops answering |
| Environment | For 10 minutes, during normal bookings |
| Artifact | BookingService.reserve and the notification sender |
| Response | Every valid booking is still Accepted and saved; the failed message is reported |
| Measure | 0 lost bookings; every failed message is counted |
| Checked in | P04 (R6 test, done) and P10 |

---

## S4 · Security: isolate guest reservations

| Part | S4 |
|---|---|
| Source | A guest or unauthorised caller |
| Stimulus | Tries 100 times to read another guest's reservation |
| Environment | Normal running system via public API |
| Artifact | Reservation lookup endpoint / Find reservation |
| Response | Denies access with unauthorised/forbidden status |
| Measure | 0 reservations shown to the wrong guest (100% blocked) |
| Checked in | P21 |

---

## S5 · Modifiability: add notification channels without touching core rules

| Part | S5 |
|---|---|
| Source | Hotel management / new requirement |
| Stimulus | The hotel adds SMS confirmations |
| Environment | During feature development |
| Artifact | Notification sender and BookingService |
| Response | Sends SMS confirmations without changing the booking rules |
| Measure | BookingService is not edited; at most 2 files change |
| Checked in | P04 (SMS sender, done) |

---

## S6 · Sustainability: energy efficiency per thousand searches

| Part | S6 |
|---|---|
| Source | Workload of 1,000 search queries |
| Stimulus | The same 1,000 searches executed before and after an optimisation |
| Environment | Production server under benchmark conditions |
| Artifact | Room search infrastructure and database queries |
| Response | System answers all searches while minimising unnecessary computation and query load |
| Measure | At least 20% fewer watt-hours per 1,000 completed searches |
| Checked in | P08 (cache) and P24 (energy measurement) |
