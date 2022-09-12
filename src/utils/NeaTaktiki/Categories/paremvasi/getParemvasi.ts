import { getDate } from '../../../CalculateDates/calculateDate';
import { argiesFunc } from '../../../ArgiesAndAnastoli/ArgiesFunc';
import { addArgAndAnastDays } from '../../../Various/addAndRemoveDays';
import { anastoliFunc } from '../../../ArgiesAndAnastoli/AnastoliFunc';
import { extraArgies } from '../../Argies/extraArgies';
import { anastoliDimosiouFunc } from '../../Anastoles/anastoliDimosiou';
import { Options } from '../../Types/interfaces';
import { checkIfIncludedSingle } from '../../Anastoles/prosthikiHmeron2021';
import { getAnastolesAnaDikastirio } from '../../../Dikastiria/dikastiria';

// interface Options {
//   dimosio?: boolean;
// }
export const getParemvasi = (start: string, options: Options): string => {
  let argiesDimosiou: string[] = [];
  let days = options?.katoikos_code === '2' ? 90 : 60;

  if (options?.dimosio_code === '2') {
    argiesDimosiou = anastoliDimosiouFunc();
  }
  let topiki = options?.topiki ?? 'Αθηνών';

  const year = parseInt(start.slice(0, 4));

  let paremvasi = getDate(start, days, {
    argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
    anastoli: addArgAndAnastDays(anastoliFunc(year), [
      ...getAnastolesAnaDikastirio(topiki, 'paremvasi'),
      ...argiesDimosiou,
    ]),
  });

  if (
    new Date('2021-03-21') <= new Date(paremvasi) &&
    new Date('2021-03-26') >= new Date(paremvasi) &&
    checkIfIncludedSingle(topiki)
  ) {
    paremvasi.setDate(paremvasi.getDate() + 8);
  }

  return paremvasi.toISOString().split('T')[0];
};
