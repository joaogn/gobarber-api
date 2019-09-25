import { isBefore, subHours } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';

import CancellationMail from '../jobs/CanceldationMail';
import Queue from '../../lib/Queue';

import Cache from '../../lib/Cache';

class CancelAppointmentServices {
  async run({ provider_id, user_id }) {
    const appointment = await Appointment.findByPk(provider_id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== user_id) {
      throw new Error('You dont have permission to cancel appointment');
    }
    // verifica se passa no criterio de horario para deletar
    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      throw new Error('You can only cancel appointments 2 hours in advance');
    }

    appointment.canceled_at = new Date();

    await appointment.save();
    // adicona o job de mandar email passando os dados
    await Queue.add(CancellationMail.key, { appointment });

    // invalidate cache

    await Cache.invalidadePrefix(`user:${user_id}:appointments`);

    return appointment;
  }
}

export default new CancelAppointmentServices();
