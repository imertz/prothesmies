import { getDate } from '../../../CalculateDates/calculateDate';
import { argiesFunc } from '../../../ArgiesAndAnastoli/ArgiesFunc';
import { addArgAndAnastDays } from '../../../Various/addAndRemoveDays';
import { anastoliFunc } from '../../../ArgiesAndAnastoli/AnastoliFunc';
import { extraArgies } from '../../Argies/extraArgies';
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
export const getProsthiki = (
  protaseisDate: string,
  options: Options
): string => {
  let argiesDimosiou: string[] = [];
  if (options?.dimosio_code === '2') {
    argiesDimosiou = anastoliDimosiouFunc();
  }
  let topiki = options?.topiki ?? 'Αθηνών';

  const year = parseInt(protaseisDate.slice(0, 4));

  let prosthiki = getDate(protaseisDate, 15, {
    argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
    anastoli: addArgAndAnastDays(anastoliFunc(year), [
      ...getAnastolesAnaDikastirio(topiki, 'prosthiki'),
      ...argiesDimosiou,
    ]),
  });
  if (
    new Date('2021-03-21') <= new Date(prosthiki) &&
    new Date('2021-03-26') >= new Date(prosthiki) &&
    checkIfIncludedSingle(topiki)
  ) {
    console.log('hi');

    prosthiki.setDate(prosthiki.getDate() + 8);
  }
  let new_prosthiki = getDate(protaseisDate, 15, {
    argies: ['2022-01-22', '2022-01-23'],
    anastoli: [],
  });

  if (
    new Date('2022-01-24') <= new Date(new_prosthiki) &&
    new Date('2022-01-29') >= new Date(new_prosthiki) &&
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
    prosthiki = getDate(
      new Date('2022-01-30').toUTCString(),
      Math.ceil(
        Math.abs(
          ((new_prosthiki as unknown) as number) -
            ((new Date('2022-01-24') as unknown) as number)
        ) /
          (1000 * 60 * 60 * 24)
      ) + 7,
      {
        argies: addArgAndAnastDays(argiesFunc(), ['2021-05-04', '2022-05-02']),
        anastoli: anastoliFunc(),
      }
    );
  }
  return prosthiki.toISOString().split('T')[0];
};
