import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  addHours,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;
    const { providerId } = req.params;
    if (!date) {
      return res.status(400).json({ error: 'Invalid Date' });
    }

    const searchDate = Number(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });
    // horario disponiveis de forma statica
    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '15:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    const avaiable = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = addHours(
        setSeconds(setMinutes(setHours(searchDate, hour), minute), 0),
        3
      );
      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        avaible:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(avaiable);
  }
}

export default new AvailableController();
