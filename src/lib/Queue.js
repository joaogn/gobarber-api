import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CanceldationMail';
import redisConfig from '../config/redis';

// vetor que vai receber todos os jobs da aplicação
const jobs = [CancellationMail];

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    // faz um loop pelos jobs e criar uma objeto com a key e o handle e coloca dentro da fila
    // armazena o bee, o bee connecta com o redis que consegue armazena e coletar valores do banco
    // e armazena o handle que processa a fila(a funcionalidade)
    // desestrutura o job para pegar o key e o handle
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  // armazena o job dentro da fila
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // pega o job e processa em tempo real, ou seja toda fez que tiver
  // uma adição de job na fila ele pega e processa o job em background
  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];
      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
