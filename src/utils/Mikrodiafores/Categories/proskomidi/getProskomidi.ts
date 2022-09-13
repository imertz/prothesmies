import { getDate } from '../../../CalculateDates/calculateDate';
import { argiesFunc } from '../../../ArgiesAndAnastoli/ArgiesFunc';
import { addArgAndAnastDays } from '../../../Various/addAndRemoveDays';
import { anastoliFunc } from '../../../ArgiesAndAnastoli/AnastoliFunc';
import { extraArgies } from '../../../ArgiesAndAnastoli/extraArgies';
import { Options } from '../../Types/interfaces';
import { anastoliDimosiouFunc } from '../../Anastoles/anastoliDimosiou';

export const getProskomidi = (epidosi: string, options?: Options): string => {
  let argiesDimosiou: string[] = [];
  let days = 20;

  if (options?.dimosio_code === '2') {
    argiesDimosiou = anastoliDimosiouFunc();
  }
  const year = parseInt(epidosi.slice(0, 4));
  let proskomidi = getDate(epidosi, days, {
    argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
    anastoli: addArgAndAnastDays(anastoliFunc(year), [...argiesDimosiou]),
  });

  return proskomidi.toISOString().split('T')[0];
};
