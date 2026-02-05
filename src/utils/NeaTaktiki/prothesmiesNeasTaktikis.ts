import { getEpidosi } from './Categories/epidosi/getEpidosi';
import { getEpidosiDetails } from './Categories/epidosi/getEpidosiDetails';
import { getDateErgasimesOnly } from '../CalculateDates/calculateDate';
import { argiesFunc } from '../ArgiesAndAnastoli/ArgiesFunc';
import { addArgAndAnastDays } from '../Various/addAndRemoveDays';
import { anastoliFunc } from '../ArgiesAndAnastoli/AnastoliFunc';
import { extraArgies } from '../ArgiesAndAnastoli/extraArgies';
import { anastoliDimosiouFunc } from './Anastoles/anastoliDimosiou';

import { getParemvasi } from './Categories/paremvasi/getParemvasi';
import { getParemvasiProsek } from './Categories/paremvasiProsek/getParemvasiProsek';
import { getProtaseis } from './Categories/protaseis/getProtaseis';
import { getProsthiki } from './Categories/prosthiki/getProsthiki';
import { Options } from './Types/interfaces';
import { getOpsigeneis } from './Categories/opsigeneis/getOpsigeneis';
import { getAntikrousiOpsig } from './Categories/opsigeneisAntikrousi/getOpsigeneisAntikrousi';
import { getParemvasiDetails } from './Categories/paremvasi/getParemvasiDetails';
import { getParemvasiProsekDetails } from './Categories/paremvasiProsek/getParemvasiProsekDetails';
import { getProtaseisDetails } from './Categories/protaseis/getProtaseisDetails';
import { getProsthikiDetails } from './Categories/prosthiki/getProsthikiDetails';
import { getOpsigeneisDetails } from './Categories/opsigeneis/getOpsigeneisDetails';
import { getOpsigeneisAntikrousiDetails } from './Categories/opsigeneisAntikrousi/getOpsigeneisAntikrousiDetails';

interface ProthesmiesNeasTaktikis {
  katathesi: string;
  epidosi: string;
  paremvasi: string;
  paremvasiProsek: string;
  protaseis: string;
  prosthiki: string;
  dikasimos?: string;
  opsigeneis?: string;
  opsigeneisAntikrousi?: string;
  antikrousiArt269?: string;

  epidosiDetails?: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  };
  paremvasiDetails?: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  };
  paremvasiProsekDetails?: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  };
  protaseisDetails?: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  };
  prosthikiDetails?: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  };
  opsigeneisDetails?: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  };
  opsigeneisAntikrousiDetails?: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  };
  antikrousiArt269Details?: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  };
}

export const prothesmiesNeasTaktikis = (
  katathesi: string,
  options?: Options
): ProthesmiesNeasTaktikis => {
  let exoterikou = options?.exoterikou ?? false;
  let dimosio = options?.dimosio ?? false;
  let topiki = options?.topiki ?? 'Αθηνών';
  let dikasimos = options?.dikasimos ?? undefined;
  let yliki = options?.yliki ?? 'Μον';
  let klisi = options?.klisi ?? false;

  let optionsDefault: Options = {
    exoterikou,
    dimosio,
    topiki,
    yliki,
    dikasimos,
    klisi,
  };

  if (options !== undefined) {
    options.topiki = topiki;
  }
  if (options && options?.klisi === undefined) {
    options.klisi = klisi;
  }

  let epidosi = getEpidosi(katathesi, options ? options : optionsDefault);
  let paremvasi = getParemvasi(katathesi, options ? options : optionsDefault);
  let paremvasiProsek = getParemvasiProsek(
    katathesi,
    options ? options : optionsDefault
  );
  let protaseis = getProtaseis(katathesi, options ? options : optionsDefault);

  let prosthiki = getProsthiki(protaseis, options ? options : optionsDefault);
  let opsigeneis: string | undefined = undefined;
  let opsigeneisAntikrousi: string | undefined = undefined;
  let antikrousiArt269: string | undefined = undefined;

  if (options?.dikasimos !== undefined) {
    if (
      new Date(katathesi).getTime() >= new Date('2026-01-01').getTime()
    ) {
      // Ν. 5221/2025 (Αρθ. 269 § 3): Αντίκρουση 5 εργάσιμες ημέρες ΜΕΤΑ τη συζήτηση
      // Οψιγενείς ισχυρισμοί: ΚΑΤΑΡΓΗΘΗΚΑΝ
      let argiesDimosiou: string[] = [];
      if (options?.dimosio) {
        argiesDimosiou = anastoliDimosiouFunc();
      }
      const yearDikasimos = parseInt(options.dikasimos.slice(0, 4));
      let antikrousiDate = getDateErgasimesOnly(options.dikasimos, 5, {
        argies: addArgAndAnastDays(argiesFunc(yearDikasimos), [...extraArgies]),
        anastoli: addArgAndAnastDays(anastoliFunc(yearDikasimos), [
          ...argiesDimosiou,
        ]),
      });
      antikrousiArt269 = antikrousiDate.toISOString().split('T')[0];
    } else if (
      new Date(katathesi).getTime() >= new Date('2022-01-01').getTime()
    ) {
      // Προϊσχύον δίκαιο (Ν. 4842/2021): Οψιγενείς 20 ημέρες ΠΡΙΝ,
      // Αντίκρουση 10 ημέρες ΠΡΙΝ τον δικάσιμο
      opsigeneis = getOpsigeneis(
        options.dikasimos,
        options ? options : optionsDefault
      );
      opsigeneisAntikrousi = getAntikrousiOpsig(
        options.dikasimos,
        options ? options : optionsDefault
      );
    }
  }

  const prothesmies: ProthesmiesNeasTaktikis = {
    katathesi,
    epidosi,
    paremvasi,
    paremvasiProsek,
    protaseis,
    prosthiki,
    dikasimos: options?.dikasimos,
    opsigeneis,
    opsigeneisAntikrousi,
    antikrousiArt269,
    epidosiDetails: getEpidosiDetails(
      katathesi,
      epidosi,
      options ? options : optionsDefault
    ),
    paremvasiDetails: getParemvasiDetails(
      katathesi,
      paremvasi,
      options ? options : optionsDefault
    ),
    paremvasiProsekDetails: getParemvasiProsekDetails(
      katathesi,
      paremvasiProsek,
      options ? options : optionsDefault
    ),
    protaseisDetails: getProtaseisDetails(
      katathesi,
      protaseis,
      options ? options : optionsDefault
    ),
    prosthikiDetails: getProsthikiDetails(
      protaseis,
      prosthiki,
      options ? options : optionsDefault
    ),
  };
  if (opsigeneis !== undefined && options?.dikasimos !== undefined) {
    prothesmies.opsigeneisDetails = getOpsigeneisDetails(
      options.dikasimos,
      opsigeneis,
      options ? options : optionsDefault
    );
  }
  if (opsigeneisAntikrousi !== undefined && options?.dikasimos !== undefined) {
    prothesmies.opsigeneisAntikrousiDetails = getOpsigeneisAntikrousiDetails(
      options.dikasimos,
      opsigeneisAntikrousi,
      options ? options : optionsDefault
    );
  }
  if (antikrousiArt269 !== undefined && options?.dikasimos !== undefined) {
    prothesmies.antikrousiArt269Details = {
      nomothesia: [
        `Αρθ. 269 § 3 ΚΠολΔ (Ν. 5221/2025). Μετά τη συζήτηση, οι διάδικοι δικαιούνται, μέσα σε πέντε (5) εργάσιμες ημέρες, να καταθέσουν σημείωμα για την αντίκρουση ισχυρισμών που προβλήθηκαν κατά τη συζήτηση. Βλ. Αρθ. 269 § 3 ΚΠολΔ, όπως αντικαταστάθηκε με το Ν. 5221/2025 (Α' 133/28-7-2025). Ισχύει για αγωγές που κατατίθενται από 1/1/2026.`,
      ],
      ypologismos: [],
      imeres: [
        `5 εργάσιμες ημέρες μετά τη συζήτηση (δικάσιμο).`,
      ],
    };
  }

  return prothesmies;
};
