import AvailableService from '../services/AvailableService';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;
    const { providerId } = req.params;
    if (!date) {
      return res.status(400).json({ error: 'Invalid Date' });
    }

    const searchDate = Number(date);

    const available = await AvailableService.run({
      provider_id: providerId,
      date: searchDate,
    });

    return res.json(available);
  }
}

export default new AvailableController();
