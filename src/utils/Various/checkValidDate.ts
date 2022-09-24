export function checkValidDate(date: string) {
  let valid = true;
  const year = date.split('-')[0];
  const month = date.split('-')[1];
  const day = date.split('-')[2];

  if (year.length !== 4 || parseInt(year) === NaN) {
    valid = false;
  }
  if (month.length !== 2 || parseInt(month) === NaN || parseInt(month) > 12) {
    valid = false;
  }
  if (day.length !== 2 || parseInt(day) === NaN || parseInt(day) > 31) {
    valid = false;
  }
  return valid;
}

console.log(checkValidDate('202-5-23'));
