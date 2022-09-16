import { getDateReverse } from '../../../CalculateDates/calculateDate';
import { argiesFunc } from '../../../ArgiesAndAnastoli/ArgiesFunc';
import { addArgAndAnastDays } from '../../../Various/addAndRemoveDays';
import { anastoliFunc } from '../../../ArgiesAndAnastoli/AnastoliFunc';
import { extraArgies } from '../../../ArgiesAndAnastoli/extraArgies';
import { anastoliDimosiouFunc } from '../../Anastoles/anastoliDimosiou';
import { Options } from '../../Types/interfaces';
import { getAnastolesAnaDikastirio } from '../../../Dikastiria/dikastiria';

// interface Options {
//   dimosio?: boolean;
// }
export const getAntikrousiOpsig = (start: string, options: Options): string => {
  let argiesDimosiou: string[] = [];
  if (options?.dimosio) {
    argiesDimosiou = anastoliDimosiouFunc();
  }
  let topiki = options?.topiki ?? 'Αθηνών';

  const year = parseInt(start.slice(0, 4));
  let epidosi = getDateReverse(start, 10, {
    argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
    anastoli: addArgAndAnastDays(anastoliFunc(year), [
      ...getAnastolesAnaDikastirio(topiki, 'antikrousi', options?.yliki),
      ...argiesDimosiou,
    ]),
  });

  if (
    new Date('2021-03-21') <= new Date(epidosi) &&
    new Date('2021-03-26') >= new Date(epidosi) &&
    [
      'Πειραιά',
      'Αθηνών',
      'Θεσσαλονίκης',
      'Ρόδου',
      'Ηρακλείου',
      'Λιβαδειάς',
      'Θηβών',
      'Χαλκίδας',
      'Σάμου',

      'Νάξου',
      'Κω',
      'Ρεθύμνης',
      'Σύρου',

      'Κατερίνης',
      'Χαλκιδικής',
      'Ευρυτανίας',
      'Μυτιλήνης',

      'Χίου',
      'Άρτας',
      'Θεσπρωτίας',
      'Λαμίας',
      'Άμφισσας',
      'Ναυπλίου',
      'Κορίνθου',
      'Αγρινίου',
      'Λευκάδας',
      'Μεσολογίου',
      'Σάμου',
    ].includes(topiki)
  ) {
    epidosi.setDate(epidosi.getDate() + 8);
  }
  return epidosi.toISOString().split('T')[0];
};
