import * as onboardingService from '../services/onboardingService.js';

export async function getByToken(req, res) {
  try {
    const { token } = req.params;
    const data = await onboardingService.getByToken(token);

    if (!data) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to fetch data' });
  }
}

export async function save(req, res) {
  try {
    const { token } = req.params;
    const { data } = req.body;

    const result = await onboardingService.saveOnboarding(token, data);

    if (!result) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to save data' });
  }
}
