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
export const getParemvasiProsek = (start: string, options: Options): string => {
  let argiesDimosiou: string[] = [];
  if (options?.dimosio) {
    argiesDimosiou = anastoliDimosiouFunc();
  }

  let topiki = options?.topiki ?? 'Αθηνών';

  const year = parseInt(start.slice(0, 4));

  // Ν. 5221/2025 (Αρθ. 238 νέο): Για αγωγές από 1/1/2026, η παρέμβαση μετά
  // προσεπίκληση υπολογίζεται από το πέρας επίδοσης με 70/100 ημέρες
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
    let days = options?.exoterikou ? 100 : 70;

    let paremvasi_prosek = getDate(epidosiDate, days, {
      argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
      anastoli: addArgAndAnastDays(anastoliFunc(year), [
        ...getAnastolesAnaDikastirio(topiki, 'paremvasi_prosek', options?.yliki),
        ...barbaraGetAnastolesAnaDikastirio(
          topiki,
          'paremvasi_prosek',
          options?.yliki
        ),
        ...danielGetAnastolesAnaDikastirio(
          topiki,
          'paremvasi_prosek',
          options?.yliki
        ),
        ...argiesDimosiou,
      ]),
    });

    return paremvasi_prosek.toISOString().split('T')[0];
  }

  // Προϊσχύον δίκαιο: 90/120 ημέρες από κατάθεση
  let days = options?.exoterikou ? 120 : 90;

  let paremvasi_prosek = getDate(start, days, {
    argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
    anastoli: addArgAndAnastDays(anastoliFunc(year), [
      ...getAnastolesAnaDikastirio(topiki, 'paremvasi_prosek', options?.yliki),
      ...barbaraGetAnastolesAnaDikastirio(
        topiki,
        'paremvasi_prosek',
        options?.yliki
      ),
      ...danielGetAnastolesAnaDikastirio(
        topiki,
        'paremvasi_prosek',
        options?.yliki
      ),
      ...argiesDimosiou,
    ]),
  });
  if (
    new Date('2021-03-21') <= new Date(paremvasi_prosek) &&
    new Date('2021-03-26') >= new Date(paremvasi_prosek) &&
    checkIfIncludedSingle(topiki)
  ) {
    paremvasi_prosek.setDate(paremvasi_prosek.getDate() + 8);
  }
  return paremvasi_prosek.toISOString().split('T')[0];
};
