import { Op } from 'sequelize';
import db from '../models/index.js';
import { BILLING_STATUS } from '../constants/client.js';
import { transitionToPastDue, transitionToSuspended } from './billingService.js';

const { Client } = db;

export async function runBillingCron() {
  const now = new Date();
  const results = { past_due: 0, suspended: 0 };

  const expiredClients = await Client.findAll({
    where: {
      billingStatus: BILLING_STATUS.ACTIVE,
      currentPeriodEnd: { [Op.lte]: now },
    },
  });

  for (const client of expiredClients) {
    await transitionToPastDue(client);
    results.past_due++;
  }

  const pastDueClients = await Client.findAll({
    where: {
      billingStatus: BILLING_STATUS.PAST_DUE,
      graceUntil: { [Op.lte]: now },
    },
  });

  for (const client of pastDueClients) {
    await transitionToSuspended(client);
    results.suspended++;
  }

  console.log(`[billing-cron] Done: ${results.past_due} → past_due, ${results.suspended} → suspended`);
  return results;
}
