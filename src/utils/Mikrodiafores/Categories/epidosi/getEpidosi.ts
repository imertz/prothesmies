import { getDate } from '../../../CalculateDates/calculateDate';
import { argiesFunc } from '../../../ArgiesAndAnastoli/ArgiesFunc';
import { addArgAndAnastDays } from '../../../Various/addAndRemoveDays';
import { anastoliFunc } from '../../../ArgiesAndAnastoli/AnastoliFunc';
import { extraArgies } from '../../../ArgiesAndAnastoli/extraArgies';
import { Options } from '../../Types/interfaces';
import { anastoliDimosiouFunc } from '../../Anastoles/anastoliDimosiou';
import {
  barbaraGetAnastolesAnaDikastirio,
  danielGetAnastolesAnaDikastirio,
} from '../../../Dikastiria/dikastiria';

// interface Options {
//   dimosio?: boolean;
// }
export const getEpidosi = (start: string, options?: Options): string => {
  let argiesDimosiou: string[] = [];
  let topiki = options?.topiki ?? 'Αθηνών';
  // Ν. 5221/2025 (Αρθ. 468): Από 1/1/2026 πάντα 10 ημέρες (αφαιρέθηκε η παράταση εξωτερικού)
  let days = (new Date(start).getTime() >= new Date('2026-01-01').getTime())
    ? 10
    : (options?.exoterikou ? 30 : 10);

  if (options?.dimosio) {
    argiesDimosiou = anastoliDimosiouFunc();
  }
  const year = parseInt(start.slice(0, 4));
  let epidosi = getDate(start, days, {
    argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
    anastoli: addArgAndAnastDays(anastoliFunc(year), [
      ...argiesDimosiou,
      ...barbaraGetAnastolesAnaDikastirio(topiki, 'epidosi', 'Ειρ'),
      ...danielGetAnastolesAnaDikastirio(topiki, 'epidosi', 'Ειρ'),
    ]),
  });

  return epidosi.toISOString().split('T')[0];
};
