import { analyseArgies, getDate } from '../../../CalculateDates/calculateDate';
import { argiesFunc } from '../../../ArgiesAndAnastoli/ArgiesFunc';
import { addArgAndAnastDays } from '../../../Various/addAndRemoveDays';
import { anastoliFunc } from '../../../ArgiesAndAnastoli/AnastoliFunc';
import { extraArgies } from '../../../ArgiesAndAnastoli/extraArgies';
import { anastoliDimosiouFunc } from '../../Anastoles/anastoliDimosiou';
import { Options } from '../../Types/interfaces';
import { checkIfIncludedSingle } from '../../Anastoles/prosthikiHmeron2021';
import { earlierThan } from '../../../Various/checkEarlierOrLaterDate';
import {
  checkIfIncluded,
  getAnastolesAnaDikastirio,
  normalizePeriohesWithExceptions,
} from '../../../Dikastiria/dikastiria';
import { reverseDate } from '../../../Various/reverseDate';

export const getProtaseisAddedDays = (start: string, options: Options) => {
  let text: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  } = { nomothesia: [], ypologismos: [], imeres: [] };
  if (new Date(start).getTime() >= new Date('2022-01-01').getTime()) {
    if (options.klisi === false) {
      let days = options?.katoikos_code === '2' ? 120 : 90;
      text.imeres.push(
        `Eντός ${days} ημερών από το τέλος της προθεσμίας για επίδοση της αγωγής.`
      );
    } else {
      let days = options?.katoikos_code === '2' ? 120 : 90;
      text.imeres.push(`Eντός ${days} ημερών από την κατάθεση της κλήσης.`);
    }
  }
  if (new Date(start).getTime() < new Date('2022-01-01').getTime()) {
    let days = options?.katoikos_code === '2' ? 130 : 100;
    text.imeres.push(
      `Eντός ${days} ημερών από την κατάθεση της αγωγής. Βλ. 237 § 1 εδ. α΄ ΚΠολΔ, όπως ίσχυε μέχρι την 31η.12.2021, (αντικαταστάθηκε βάσει του άρθρου 12 του Ν.4842/2021).`
    );
  }

  let days = options?.katoikos_code === '2' ? 130 : 100;

  if (earlierThan('2021-03-26', start)) {
    let argiesDimosiou: string[] = [];
    if (options?.dimosio_code === '2') {
      argiesDimosiou = anastoliDimosiouFunc();
    }
    let topiki = options?.topiki ?? 'Αθηνών';

    const year = parseInt(start.slice(0, 4));

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
      text.ypologismos.push(
        `Προστέθηκαν επιπλέον 7 ημέρες επειδή η τελική ημερομηνία είναι από 22-3-2021 έως 26-3-2021 βάσει της παρ. 3α εδ. βα' του πεδίου 4 του ΦΕΚ 1076/Β/20-03-2021`
      );
    }
    const argia = analyseArgies(start, days, {
      argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
      anastoli: addArgAndAnastDays(anastoliFunc(year), [
        ...getAnastolesAnaDikastirio(topiki, 'protaseis'),
        ...argiesDimosiou,
      ]),
    });
    let dayOfWeek = '';
    if (new Date(argia).getDay() === 0) {
      dayOfWeek = ' (Κυριακή)';
    }
    if (new Date(argia).getDay() === 6) {
      dayOfWeek = ' (Σάββατο)';
    }
    if (argia) {
      text.ypologismos.push(
        `Επειδή η ${reverseDate(
          argia
        )} είναι αργία${dayOfWeek}, η ημερομήνια μετατέθηκε στην επομένη εργάσιμη.`
      );
    }
  }
  if (earlierThan('2022-02-22', start)) {
    let argiesDimosiou: string[] = [];
    if (options?.dimosio_code === '2') {
      argiesDimosiou = anastoliDimosiouFunc();
    }

    const year = parseInt(start.slice(0, 4));
    let new_protaseis = getDate(start, days, {
      argies: ['2022-01-22', '2022-01-23'],
      anastoli: [],
    });

    let topiki = options?.topiki ?? 'Αθηνών';

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
      text.ypologismos.push(
        `Προστέθηκαν επιπλέον 7 ημέρες ημέρες επειδή η τελική ημερομηνία είναι από 24-01-2022 έως 29-01-2022 βάσει της παρ. 3 του άρθρου 8 της από 29.1.2022 ΠΝΠ (ΦΕΚ Α΄14/29.1.2022)`
      );
    }
    const argia = analyseArgies(start, days, {
      argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
      anastoli: addArgAndAnastDays(anastoliFunc(year), [
        ...getAnastolesAnaDikastirio(topiki, 'protaseis'),
        ...argiesDimosiou,
      ]),
    });
    let dayOfWeek = '';
    if (new Date(argia).getDay() === 0) {
      dayOfWeek = ' (Κυριακή)';
    }
    if (new Date(argia).getDay() === 6) {
      dayOfWeek = ' (Σάββατο)';
    }
    if (argia) {
      text.ypologismos.push(
        `Επειδή η ${reverseDate(
          argia
        )} είναι αργία${dayOfWeek}, η ημερομήνια μετατέθηκε στην επομένη εργάσιμη.`
      );
    }
    return text;
  } else {
    let argiesDimosiou: string[] = [];
    if (options?.dimosio_code === '2') {
      argiesDimosiou = anastoliDimosiouFunc();
    }
    let topiki = options?.topiki ?? 'Αθηνών';

    const year = parseInt(start.slice(0, 4));
    const argia = analyseArgies(start, days, {
      argies: addArgAndAnastDays(argiesFunc(year), [...extraArgies]),
      anastoli: addArgAndAnastDays(anastoliFunc(year), [
        ...getAnastolesAnaDikastirio(topiki, 'protaseis'),
        ...argiesDimosiou,
      ]),
    });
    let dayOfWeek = '';
    if (new Date(argia).getDay() === 0) {
      dayOfWeek = ' (Κυριακή)';
    }
    if (new Date(argia).getDay() === 6) {
      dayOfWeek = ' (Σάββατο)';
    }
    if (argia) {
      text.ypologismos.push(
        `Επειδή η ${reverseDate(
          argia
        )} είναι αργία${dayOfWeek}, η ημερομήνια μετατέθηκε στην επομένη εργάσιμη.`
      );
    }
    return text;
  }
};
