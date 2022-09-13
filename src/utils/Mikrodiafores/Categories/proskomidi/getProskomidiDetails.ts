import { Options } from '../../Types/interfaces';
import { checkIfAnastoliDiakopon } from '../../../Various/checkEarlierOrLaterDate';
import { getProskomidiAddedDays } from './getProskomidiAddedDays';

export const getProskomidiDetails = (
  epidosi: string,
  prothesmia: string,
  options?: Options
) => {
  let text: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  } = { nomothesia: [], ypologismos: [], imeres: [] };
  text.nomothesia = [
    `Αρθ.468 § 1 ΚΠολΔ. Η αγωγή κατατίθεται στη γραμματεία του ειρηνοδικείου και επιδίδεται στον εναγόμενο μέσα σε προθεσμία δέκα (10) ημερών από την κατάθεσή της. Αν ο εναγόμενος διαμένει στο εξωτερικό ή είναι άγνωστης διαμονής η αγωγή επιδίδεται σε προθεσμία τριάντα (30) ημερών από την κατάθεσή της. Το δεύτερο εδάφιο της παρ. 2 του άρθρου 215 εφαρμόζεται αναλόγως.`,
  ];

  if (
    checkIfAnastoliDiakopon(
      epidosi,
      prothesmia,
      options?.dimosio_code ? options.dimosio_code : '1'
    )
  ) {
    text.ypologismos.push(
      'Εξαιρέθηκαν οι ημερομηνίες της αναστολής λόγω δικαστικών διακοπών.'
    );
  }
  const addedDaysText = getProskomidiAddedDays(epidosi, options);
  text.ypologismos = [...text.ypologismos, ...addedDaysText.ypologismos];
  text.imeres = addedDaysText.imeres;

  return text;
};
