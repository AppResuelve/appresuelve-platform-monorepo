import db from '../models/index.js';

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

  return {
    id: client.id,
    business_name: client.businessName,
    email: client.email,
    status: client.status,
    form_data: client.form ? client.form.data : null,
  };
}

export async function saveOnboarding(token, data) {
  const client = await Client.findOne({
    where: { inviteToken: token },
  });

  if (!client) return null;

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

    if (client.status === 'pending') {
      await client.update({ status: 'onboarding' }, { transaction: t });
    }

    await t.commit();
    return { success: true };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
