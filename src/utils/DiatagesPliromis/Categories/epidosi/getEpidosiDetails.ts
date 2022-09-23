import { Options } from '../../Types/interfaces';
import { checkIfAnastoliDiakopon } from '../../../Various/checkEarlierOrLaterDate';
import { getEpidosiAddedDays } from './getEpidosiAddedDays';

export const getEpidosiDetails = (
  start: string,
  prothesmia: string,
  options?: Options
) => {
  let text: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  } = { nomothesia: [], ypologismos: [], imeres: [] };
  text.nomothesia = [
    `Αρθ.630Α ΚΠολΔ. Η διαταγή πληρωμής επιδίδεται σε εκείνον κατά του οποίου στρέφεται μέσα σε προθεσμία δύο μηνών από την έκδοσή της. Αν η επίδοση δεν γίνει μέσα στην προθεσμία των δύο μηνών, η διαταγή πληρωμής παύει να ισχύει.\nΕφαρμόζεται αναλογικά η ΚΠολΔ 147 παρ.2, επομένως η προθεσμία υπόκειται στην αναστολή από 1 έως 31 Αυγούστου.`,
  ];

  if (
    checkIfAnastoliDiakopon(
      start,
      prothesmia,
      options?.dimosio ? options.dimosio : false
    )
  ) {
    text.ypologismos.push(
      'Εξαιρέθηκαν οι ημερομηνίες της αναστολής λόγω δικαστικών διακοπών.'
    );
  }
  const addedDaysText = getEpidosiAddedDays(start, options);
  text.ypologismos = [...text.ypologismos, ...addedDaysText.ypologismos];
  text.imeres = addedDaysText.imeres;

  return text;
};
