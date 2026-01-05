export function humanizeCron(cron) {
  if (!cron) return 'No definido';

  if (cron === '* * * * *') return 'Cada minuto';

  const everyMinutes = cron.match(/^\*\/(\d+)\s\*\s\*\s\*\s\*$/);
  if (everyMinutes) {
    return `Cada ${everyMinutes[1]} minutos`;
  }

  const everyHour = cron.match(/^0\s\*\/(\d+)\s\*\s\*\s\*$/);
  if (everyHour) {
    return `Cada ${everyHour[1]} horas`;
  }

  return 'Programación personalizada';
}
