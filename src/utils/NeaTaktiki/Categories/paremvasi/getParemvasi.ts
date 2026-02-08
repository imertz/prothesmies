import { getDate } from '../../../CalculateDates/calculateDate';
import { argiesFunc } from '../../../ArgiesAndAnastoli/ArgiesFunc';
import { addArgAndAnastDays } from '../../../Various/addAndRemoveDays';
import { anastoliFunc } from '../../../ArgiesAndAnastoli/AnastoliFunc';
import { extraArgies } from '../../../ArgiesAndAnastoli/extraArgies';
import { anastoliDimosiouFunc } from '../../Anastoles/anastoliDimosiou';
import { Options } from '../../Types/interfaces';
import { checkIfIncludedSingle } from '../../Anastoles/prosthikiHmeron2021';
import {
  barbaraGetAnastolesAnaDikastirio,
  danielGetAnastolesAnaDikastirio,
  getAnastolesAnaDikastirio,
} from '../../../Dikastiria/dikastiria';
import { getEpidosiDays } from '../epidosi/getEpidosiDays';

// interface Options {
//   dimosio?: boolean;
// }
export const getParemvasi = (start: string, options: Options): string => {
  let argiesDimosiou: string[] = [];

  if (options?.dimosio) {
    argiesDimosiou = anastoliDimosiouFunc();
  }
  let topiki = options?.topiki ?? 'Αθηνών';

  const year = parseInt(start.slice(0, 4));

  // Ν. 5221/2025 (Αρθ. 238 νέο): Για αγωγές από 1/1/2026, η παρέμβαση υπολογίζεται
  // από το πέρας της προθεσμίας επίδοσης (όχι από κατάθεση) με 40/70 ημέρες
  if (new Date(start).getTime() >= new Date('2026-01-01').getTime()) {
    let epidosiDays = getEpidosiDays(start, options?.exoterikou);
    let epidosi = getDate(start, epidosiDays, {
      argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
      anastoli: addArgAndAnastDays(anastoliFunc(year), [
        ...getAnastolesAnaDikastirio(topiki, 'epidosi', options?.yliki),
        ...barbaraGetAnastolesAnaDikastirio(topiki, 'epidosi', options?.yliki),
        ...danielGetAnastolesAnaDikastirio(topiki, 'epidosi', options?.yliki),
        ...argiesDimosiou,
      ]),
    });
    let epidosiDate = epidosi.toISOString().split('T')[0];
    let days = options?.exoterikou ? 70 : 40;

    let paremvasi = getDate(epidosiDate, days, {
      argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
      anastoli: addArgAndAnastDays(anastoliFunc(year), [
        ...getAnastolesAnaDikastirio(topiki, 'paremvasi', options?.yliki),
        ...barbaraGetAnastolesAnaDikastirio(topiki, 'paremvasi', options?.yliki),
        ...danielGetAnastolesAnaDikastirio(topiki, 'paremvasi', options?.yliki),
        ...argiesDimosiou,
      ]),
    });

    return paremvasi.toISOString().split('T')[0];
  }

  // Προϊσχύον δίκαιο: 60/90 ημέρες από κατάθεση
  let days = options?.exoterikou ? 90 : 60;

  let paremvasi = getDate(start, days, {
    argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
    anastoli: addArgAndAnastDays(anastoliFunc(year), [
      ...getAnastolesAnaDikastirio(topiki, 'paremvasi', options?.yliki),
      ...barbaraGetAnastolesAnaDikastirio(topiki, 'paremvasi', options?.yliki),
      ...danielGetAnastolesAnaDikastirio(topiki, 'paremvasi', options?.yliki),
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
