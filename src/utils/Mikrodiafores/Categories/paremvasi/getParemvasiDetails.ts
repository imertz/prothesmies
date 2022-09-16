import { Options } from '../../Types/interfaces';
import { checkIfAnastoliDiakopon } from '../../../Various/checkEarlierOrLaterDate';
import { getParemvasiAddedDays } from './getParemvasiAddedDays';

export const getParemvasiDetails = (
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
    `Αρθ.468 § 3 ΚΠολΔ. Παρεμβάσεις και ανταγωγές κατατίθενται και επιδίδονται στους διαδίκους μέσα σε προθεσμία είκοσι (20) ημερών από την κατάθεση της αγωγής. Η προθεσμία αυτή παρατείνεται κατά είκοσι (20) ημέρες αν ο εναγόμενος διαμένει στο εξωτερικό ή είναι άγνωστης διαμονής. Η προσκομιδή των αποδεικτικών μέσων και το έγγραφο υπόμνημα των ισχυρισμών στις περιπτώσεις του δεύτερου εδαφίου γίνονται σε προθεσμία τριάντα (30) ή πενήντα (50) ημερών, αντίστοιχα, από την κατάθεση της αγωγής και η έγγραφη προσθήκηαντίκρουση στην προθεσμία του τρίτου εδαφίου της παρ. 2.`,
  ];

  if (
    checkIfAnastoliDiakopon(
      start,
      prothesmia,
      options?.dimosio_code ? options.dimosio_code : false
    )
  ) {
    text.ypologismos.push(
      'Εξαιρέθηκαν οι ημερομηνίες της αναστολής λόγω δικαστικών διακοπών.'
    );
  }
  const addedDaysText = getParemvasiAddedDays(start, options);
  text.ypologismos = [...text.ypologismos, ...addedDaysText.ypologismos];
  text.imeres = addedDaysText.imeres;

  return text;
};
