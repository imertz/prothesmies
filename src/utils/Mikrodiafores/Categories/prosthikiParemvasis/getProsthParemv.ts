import { getDate } from '../../../CalculateDates/calculateDate';
import { argiesFunc } from '../../../ArgiesAndAnastoli/ArgiesFunc';
import { addArgAndAnastDays } from '../../../Various/addAndRemoveDays';
import { anastoliFunc } from '../../../ArgiesAndAnastoli/AnastoliFunc';
import { extraArgies } from '../../../ArgiesAndAnastoli/extraArgies';
import { Options } from '../../Types/interfaces';
import { anastoliDimosiouFunc } from '../../Anastoles/anastoliDimosiou';

// interface Options {
//   dimosio?: boolean;
// }
export const getProsthParemv = (
  proskParemv: string,
  options?: Options
): string => {
  let argiesDimosiou: string[] = [];
  let days = 5;

  if (options?.dimosio_code) {
    argiesDimosiou = anastoliDimosiouFunc();
  }
  const year = parseInt(proskParemv.slice(0, 4));
  let prosthParemv = getDate(proskParemv, days, {
    argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
    anastoli: addArgAndAnastDays(anastoliFunc(year), [...argiesDimosiou]),
  });

  return prosthParemv.toISOString().split('T')[0];
};
