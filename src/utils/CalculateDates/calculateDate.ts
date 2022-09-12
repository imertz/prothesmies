export function getDate(
  start: string,
  noOfDays: number,
  argiesAndAnastoli: { argies: string[]; anastoli: string[] }
) {
  let arr = [];
  let dt = new Date(start);

  for (var i = 0; i < noOfDays; i) {
    dt.setTime(dt.getTime() + 24 * 3600 * 1000);

    if (
      argiesAndAnastoli.anastoli.findIndex(
        r => r === dt.toISOString().split('T')[0]
      ) === -1
    ) {
      arr.push(new Date(dt));
      i++;
    }
  }
  let lastDay = new Date();

  lastDay = arr.at(-1) as Date;

  while (
    [...argiesAndAnastoli.argies, ...argiesAndAnastoli.anastoli].findIndex(
      r => new Date(r).toDateString() === new Date(lastDay).toDateString()
    ) !== -1
  ) {
    lastDay.setTime(lastDay.getTime() + 24 * 3600 * 1000);
    arr.push(new Date(lastDay));
  }
  return arr.at(-1) as Date;
}

export function getDateReverse(
  start: string,
  noOfDays: number,
  argiesAndAnastoli: { argies: string[]; anastoli: string[] }
) {
  let arr = [];
  let dt = new Date(start);
  for (var i = 0; i < noOfDays; i) {
    dt.setTime(dt.getTime() - 24 * 3600 * 1000);
    if (
      argiesAndAnastoli.anastoli.findIndex(
        r => r === dt.toISOString().split('T')[0]
      ) === -1
    ) {
      arr.push(new Date(dt));
      i++;
    }
  }
  let lastDay = new Date();

  lastDay = arr.at(-1) as Date;

  while (
    [...argiesAndAnastoli.argies, ...argiesAndAnastoli.anastoli].findIndex(
      r => new Date(r).toDateString() === new Date(lastDay).toDateString()
    ) !== -1
  ) {
    lastDay.setTime(lastDay.getTime() - 24 * 3600 * 1000);
    arr.push(new Date(lastDay));
  }

  return arr.at(-1) as Date;
}

export function analyseArgies(
  start: string,
  noOfDays: number,
  argiesAndAnastoli: { argies: string[]; anastoli: string[] }
) {
  let firstArgia = [];
  let arr = [];
  let dt = new Date(start);

  for (var i = 0; i < noOfDays; i) {
    dt.setTime(dt.getTime() + 24 * 3600 * 1000);

    if (
      argiesAndAnastoli.anastoli.findIndex(
        r => r === dt.toISOString().split('T')[0]
      ) === -1
    ) {
      arr.push(new Date(dt));
      i++;
    }
  }
  let lastDay = new Date();

  lastDay = arr.at(-1) as Date;

  while (
    [...argiesAndAnastoli.argies, ...argiesAndAnastoli.anastoli].findIndex(
      r => new Date(r).toDateString() === new Date(lastDay).toDateString()
    ) !== -1
  ) {
    if (
      argiesAndAnastoli.argies.findIndex(
        r => new Date(r).toDateString() === new Date(lastDay).toDateString()
      ) !== -1
    ) {
      firstArgia.push(lastDay.toISOString().split('T')[0]);
    }
    lastDay.setTime(lastDay.getTime() + 24 * 3600 * 1000);
    arr.push(new Date(lastDay));
  }
  return firstArgia[0] ? firstArgia[0] : '';
}

export function analyseArgiesReverse(
  start: string,
  noOfDays: number,
  argiesAndAnastoli: { argies: string[]; anastoli: string[] }
) {
  let firstArgia = [];

  let arr = [];
  let dt = new Date(start);
  for (var i = 0; i < noOfDays; i) {
    dt.setTime(dt.getTime() - 24 * 3600 * 1000);
    if (
      argiesAndAnastoli.anastoli.findIndex(
        r => r === dt.toISOString().split('T')[0]
      ) === -1
    ) {
      arr.push(new Date(dt));
      i++;
    }
  }
  let lastDay = new Date();

  lastDay = arr.at(-1) as Date;

  while (
    [...argiesAndAnastoli.argies, ...argiesAndAnastoli.anastoli].findIndex(
      r => new Date(r).toDateString() === new Date(lastDay).toDateString()
    ) !== -1
  ) {
    if (
      argiesAndAnastoli.argies.findIndex(
        r => new Date(r).toDateString() === new Date(lastDay).toDateString()
      ) !== -1
    ) {
      firstArgia.push(lastDay.toISOString().split('T')[0]);
    }
    lastDay.setTime(lastDay.getTime() - 24 * 3600 * 1000);
    arr.push(new Date(lastDay));
  }

  return firstArgia[0] ? firstArgia[0] : '';
}
