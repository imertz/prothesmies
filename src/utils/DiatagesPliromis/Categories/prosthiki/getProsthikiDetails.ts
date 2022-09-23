import { Options } from '../../Types/interfaces';
import { checkIfAnastoliDiakopon } from '../../../Various/checkEarlierOrLaterDate';
import { getProsthikiAddedDays } from './getProsthikiAddedDays';

export const getProsthikiDetails = (
  proskomidi: string,
  prothesmia: string,
  options?: Options
) => {
  let text: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  } = { nomothesia: [], ypologismos: [], imeres: [] };
  text.nomothesia = [
    `Αρθ.468 § 2 ΚΠολΔ. Μέσα σε είκοσι (20) ημέρες από τη λήξη της προθεσμίας για την επίδοση της αγωγής, οι διάδικοι προσκομίζουν στο ειρηνοδικείο τα αποδεικτικά τους μέσα και ο εναγόμενος υποβάλλει με έγγραφο υπόμνημα τους ισχυρισμούς του. Μέχρι δύο (2) ένορκες βεβαιώσεις, επιτρέπονται και χωρίς κλήση του αντιδίκου. Εντός προθεσμίας πέντε (5) ημερών από τη λήξη της ως άνω προθεσμίας οι διάδικοι μπορούν να καταθέσουν έγγραφη προσθήκηαντίκρουση. Νέοι ισχυρισμοί με την προσθήκη μπορεί να προταθούν και νέα αποδεικτικά μέσα να προσκομισθούν μόνο για την αντίκρουση ισχυρισμών που περιέχονται στο ως άνω υπόμνημα. Εκπρόθεσμα αποδεικτικά μέσα και ισχυρισμοί των διαδίκων δεν λαμβάνονται υπόψη.`,
  ];

  if (
    checkIfAnastoliDiakopon(
      proskomidi,
      prothesmia,
      options?.dimosio ? options.dimosio : false
    )
  ) {
    text.ypologismos.push(
      'Εξαιρέθηκαν οι ημερομηνίες της αναστολής λόγω δικαστικών διακοπών.'
    );
  }
  const addedDaysText = getProsthikiAddedDays(proskomidi, options);
  text.ypologismos = [...text.ypologismos, ...addedDaysText.ypologismos];
  text.imeres = addedDaysText.imeres;

  return text;
};
