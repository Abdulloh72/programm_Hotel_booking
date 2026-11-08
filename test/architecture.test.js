/**
 * test/architecture.test.js
 * P06 – Architecture tests: 3 border checks guarding modular boundaries.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function getJsFiles(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getJsFiles(fullPath));
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

function getImportLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split('\n')
    .filter(line => line.trim().startsWith('import ') && line.includes(' from '));
}

// ── Rule 1: Reservations uses only the public contracts of other modules ──────
test('Reservations uses only the public contracts of other modules', () => {
  const resFiles = getJsFiles(path.resolve('src/reservations'));
  const violations = [];
  const forbiddenPatterns = [
    'rooms/internal',
    'payments/internal',
    'notifications/internal',
  ];

  for (const file of resFiles) {
    const rel = path.relative(path.resolve('src'), file);
    for (const line of getImportLines(file)) {
      for (const forbidden of forbiddenPatterns) {
        if (line.includes(forbidden)) {
          violations.push(
            `${rel} illegally imports internal code: "${line.trim()}"`
          );
        }
      }
    }
  }

  assert.deepStrictEqual(
    violations,
    [],
    `Border violation: Reservations must only use public contracts of other modules:\n${violations.join('\n')}`
  );
});

// ── Rule 2: Rooms does not depend on any other module ─────────────────────────
test('Rooms does not depend on any other module', () => {
  const roomsFiles = getJsFiles(path.resolve('src/rooms'));
  const violations = [];
  const forbiddenModules = ['reservations', 'payments', 'notifications'];

  for (const file of roomsFiles) {
    const rel = path.relative(path.resolve('src'), file);
    for (const line of getImportLines(file)) {
      for (const mod of forbiddenModules) {
        if (line.includes(`/${mod}`) || line.includes(`../${mod}`)) {
          violations.push(
            `${rel} illegally depends on ${mod}: "${line.trim()}"`
          );
        }
      }
    }
  }

  assert.deepStrictEqual(
    violations,
    [],
    `Border violation: Rooms must not depend on any other module:\n${violations.join('\n')}`
  );
});

// ── Rule 3: Payments and Notifications do not depend on Reservations ──────────
test('Payments and Notifications do not depend on Reservations', () => {
  const files = [
    ...getJsFiles(path.resolve('src/payments')),
    ...getJsFiles(path.resolve('src/notifications')),
  ];
  const violations = [];

  for (const file of files) {
    const rel = path.relative(path.resolve('src'), file);
    for (const line of getImportLines(file)) {
      if (line.toLowerCase().includes('reservations')) {
        violations.push(
          `${rel} illegally depends on reservations: "${line.trim()}"`
        );
      }
    }
  }

  assert.deepStrictEqual(
    violations,
    [],
    `Border violation: Payments and Notifications must never depend on Reservations:\n${violations.join('\n')}`
  );
});
