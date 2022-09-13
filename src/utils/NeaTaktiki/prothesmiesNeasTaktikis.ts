import { getEpidosi } from './Categories/epidosi/getEpidosi';
import { getEpidosiDetails } from './Categories/epidosi/getEpidosiDetails';

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
  // or_dikasti: string;
  // or_dikasimou: string;
  opsigeneis?: string;
  opsigeneisΑntikrousi?: string;
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
}

export const prothesmiesNeasTaktikis = (
  start: string,
  options?: Options
): ProthesmiesNeasTaktikis => {
  let katoikos_code = options?.katoikos_code ?? '1';
  let dimosio_code = options?.dimosio_code ?? '1';
  let topiki = options?.topiki ?? 'Αθηνών';
  let dikasimos = options?.dikasimos ?? undefined;
  let yliki = options?.yliki ?? 'Μον';
  let ylikiGreek = 'Μον ';
  if (yliki === 'Πολ') {
    ylikiGreek = 'Πολ  ';
  }
  if (yliki === 'Ειρ') {
    ylikiGreek = 'Ειρ  ';
  }

  let optionsDefault: Options = {
    katoikos_code,
    dimosio_code,
    topiki: `${ylikiGreek}${topiki}`,
    yliki,
    dikasimos,
  };

  if (options !== undefined) {
    options.topiki = `${ylikiGreek}${topiki}`;
  }

  let epidosi = getEpidosi(start, options ? options : optionsDefault);
  let paremvasi = getParemvasi(start, options ? options : optionsDefault);
  let paremvasiProsek = getParemvasiProsek(
    start,
    options ? options : optionsDefault
  );
  let protaseis = getProtaseis(start, options ? options : optionsDefault);
  let prosthiki = getProsthiki(protaseis, options ? options : optionsDefault);
  let opsigeneis = undefined;
  let opsigeneisΑntikrousi = undefined;
  if (
    new Date(start).getTime() >= new Date('2022-01-01').getTime() &&
    options?.dikasimos !== undefined
  ) {
    console.log(options.dikasimos);

    opsigeneis = getOpsigeneis(
      options?.dikasimos,
      options ? options : optionsDefault
    );
    opsigeneisΑntikrousi = getAntikrousiOpsig(
      options?.dikasimos,
      options ? options : optionsDefault
    );
  }

  const prothesmies: ProthesmiesNeasTaktikis = {
    katathesi: start,
    epidosi,
    paremvasi,
    paremvasiProsek,
    protaseis,
    prosthiki,
    dikasimos: options?.dikasimos,
    opsigeneis,
    opsigeneisΑntikrousi,
    epidosiDetails: getEpidosiDetails(
      start,
      epidosi,
      options ? options : optionsDefault
    ),
    paremvasiDetails: getParemvasiDetails(
      start,
      paremvasi,
      options ? options : optionsDefault
    ),
    paremvasiProsekDetails: getParemvasiProsekDetails(
      start,
      paremvasiProsek,
      options ? options : optionsDefault
    ),
    protaseisDetails: getProtaseisDetails(
      start,
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
    console.log(options.dikasimos);

    prothesmies.opsigeneisDetails = getOpsigeneisDetails(
      options.dikasimos,
      opsigeneis,
      options ? options : optionsDefault
    );
  }
  if (opsigeneisΑntikrousi !== undefined && options?.dikasimos !== undefined) {
    prothesmies.opsigeneisAntikrousiDetails = getOpsigeneisAntikrousiDetails(
      options.dikasimos,
      opsigeneisΑntikrousi,
      options ? options : optionsDefault
    );
  }
  return prothesmies;
};
