import db from '../models/index.js';
import { ADMIN_STATUS } from '../constants/client.js';

const { Client, ClientForm } = db;

export async function getByToken(token) {
  const client = await Client.findOne({
    where: { inviteToken: token },
    include: [
      {
        model: ClientForm,
        as: 'form',
        required: false,
        where: { formType: 'onboarding' },
      },
    ],
  });

  if (!client) return null;

  if (client.adminStatus === ADMIN_STATUS.ACTIVE) {
    throw Object.assign(
      new Error('El enlace de onboarding ya no está disponible'),
      { status: 410 },
    );
  }

  return {
    id: client.id,
    business_name: client.businessName,
    email: client.email,
    onboarding_status: client.onboardingStatus,
    form_data: client.form ? client.form.data : null,
  };
}

export async function saveOnboarding(token, data) {
  const client = await Client.findOne({
    where: { inviteToken: token },
  });

  if (!client) return null;

  if (client.adminStatus === ADMIN_STATUS.ACTIVE) {
    throw Object.assign(
      new Error('El enlace de onboarding ya no está disponible'),
      { status: 410 },
    );
  }

  const t = await db.sequelize.transaction();
  try {
    const [form, created] = await ClientForm.findOrCreate({
      where: {
        clientId: client.id,
        formType: 'onboarding',
      },
      defaults: {
        clientId: client.id,
        formType: 'onboarding',
        data,
      },
      transaction: t,
    });

    if (!created) {
      await form.update({ data }, { transaction: t });
    }

    if (client.onboardingStatus === 'pending') {
      await client.update({ onboardingStatus: 'onboarding' }, { transaction: t });
    }

    await t.commit();
    return { success: true };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
