import { BILLING_STATUS } from '../constants/client.js';

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonth(date) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  return result;
}

export async function transitionToPastDue(client) {
  const graceDays = client.graceDays || 7;
  const graceUntil = addDays(client.currentPeriodEnd, graceDays);

  await client.update({
    billingStatus: BILLING_STATUS.PAST_DUE,
    graceUntil,
    lastBillingCronAt: new Date(),
  });
}

export async function transitionToSuspended(client) {
  await client.update({
    billingStatus: BILLING_STATUS.SUSPENDED,
    suspendedAt: new Date(),
    graceUntil: null,
    lastBillingCronAt: new Date(),
  });
}

export async function activateBilling(client) {
  const now = new Date();

  await client.update({
    billingStatus: BILLING_STATUS.ACTIVE,
    currentPeriodStart: now,
    currentPeriodEnd: addMonth(now),
    graceUntil: null,
    suspendedAt: null,
  });
}
