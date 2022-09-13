import { getDate } from '../../../CalculateDates/calculateDate';
import { argiesFunc } from '../../../ArgiesAndAnastoli/ArgiesFunc';
import { addArgAndAnastDays } from '../../../Various/addAndRemoveDays';
import { anastoliFunc } from '../../../ArgiesAndAnastoli/AnastoliFunc';
import { extraArgies } from '../../../ArgiesAndAnastoli/extraArgies';
import { anastoliDimosiouFunc } from '../../Anastoles/anastoliDimosiou';
import { Options } from '../../Types/interfaces';
import { checkIfIncludedSingle } from '../../Anastoles/prosthikiHmeron2021';
import {
  checkIfIncluded,
  getAnastolesAnaDikastirio,
  normalizePeriohesWithExceptions,
} from '../../../Dikastiria/dikastiria';

// interface Options {
//   dimosio?: boolean;
// }
export const getProtaseis = (start: string, options: Options): string => {
  let argiesDimosiou: string[] = [];
  if (options?.dimosio_code === '2') {
    argiesDimosiou = anastoliDimosiouFunc();
  }
  let topiki = options?.topiki ?? 'Αθηνών';

  const year = parseInt(start.slice(0, 4));
  if (new Date(start).getTime() >= new Date('2022-01-01').getTime()) {
    if (options.klisi === false) {
      let epidosiDays = options?.katoikos_code === '2' ? 60 : 30;

      let epidosi = getDate(start, epidosiDays, {
        argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
        anastoli: addArgAndAnastDays(anastoliFunc(year), [
          ...getAnastolesAnaDikastirio(topiki, 'epidosi'),
          ...argiesDimosiou,
        ]),
      });
      let days = options?.katoikos_code === '2' ? 120 : 90;

      let protaseis = getDate(epidosi.toISOString().split('T')[0], days, {
        argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
        anastoli: addArgAndAnastDays(anastoliFunc(year), [
          ...getAnastolesAnaDikastirio(topiki, 'protaseis'),
          ...argiesDimosiou,
        ]),
      });

      return protaseis.toISOString().split('T')[0];
    } else {
      let days = options?.katoikos_code === '2' ? 120 : 90;

      let protaseis = getDate(start, days, {
        argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
        anastoli: addArgAndAnastDays(anastoliFunc(year), [
          ...getAnastolesAnaDikastirio(topiki, 'protaseis'),
          ...argiesDimosiou,
        ]),
      });

      return protaseis.toISOString().split('T')[0];
    }
  } else {
    let topiki = options?.topiki ?? 'Αθηνών';
    let days = options?.katoikos_code === '2' ? 130 : 100;

    let protaseis = getDate(start, days, {
      argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
      anastoli: addArgAndAnastDays(anastoliFunc(year), [
        ...getAnastolesAnaDikastirio(topiki, 'protaseis'),
        ...argiesDimosiou,
      ]),
    });

    if (
      new Date('2021-03-21') <= new Date(protaseis) &&
      new Date('2021-03-26') >= new Date(protaseis) &&
      checkIfIncludedSingle(topiki)
    ) {
      protaseis.setDate(protaseis.getDate() + 8);
    }

    let new_protaseis = getDate(start, days, {
      argies: ['2022-01-22', '2022-01-23'],
      anastoli: [],
    });

    // console.log(new_protaseis);
    // console.log(start);
    if (
      new Date('2022-01-24') <= new Date(new_protaseis) &&
      new Date('2022-01-29') >= new Date(new_protaseis) &&
      checkIfIncluded(
        topiki,
        normalizePeriohesWithExceptions(
          [
            'Πειραιά',
            'Αθηνών',
            'Ρόδου',
            'Ηρακλείου',
            'Λιβαδειάς',
            'Θηβών',
            'Χαλκίδας',
            'Νάξου',
            'Κω',
            'Ρεθύμνης',
            'Σύρου',
            'Χανίων',
            'Λασιθίου',
          ],
          []
        )
      )
    ) {
      protaseis = getDate(
        new Date('2022-01-30').toUTCString(),
        Math.ceil(
          Math.abs(
            ((new_protaseis as unknown) as number) -
              ((new Date('2022-01-24') as unknown) as number)
          ) /
            (1000 * 60 * 60 * 24)
        ) + 7,
        {
          argies: addArgAndAnastDays(argiesFunc(), [
            '2021-05-04',
            '2022-05-02',
          ]),
          anastoli: anastoliFunc(),
        }
      );
    }
    return protaseis.toISOString().split('T')[0];
  }
};
