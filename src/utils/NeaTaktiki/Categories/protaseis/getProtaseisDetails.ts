import { Options } from '../../Types/interfaces';
import { legalAnalysis } from '../../../LegalAnalysis/legalAnalysis';
import {
  checkIfAnastoliDiakopon,
  earlierThan,
  laterThan,
} from '../../../Various/checkEarlierOrLaterDate';
import { getProtaseisAddedDays } from './getProtaseisAddedDays';
import { checkIfIncluded } from '../../../Dikastiria/dikastiria';

export const getProtaseisDetails = (
  start: string,
  prothesmia: string,
  options: Options
) => {
  let topiki = options?.topiki ?? 'Αθηνών';

  const filtered = legalAnalysis.filter(
    r =>
      checkIfIncluded(topiki, r.periohes) &&
      (r.eidos.includes('protaseis') || r.eidos.includes('all'))
  );
  let text: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  } = { nomothesia: [], ypologismos: [], imeres: [] };
  text.nomothesia = [
    `Αρθ.237 § 1 ΚΠολΔ. Μέσα σε εκατό (100) ημέρες από την κατάθεση της αγωγής οι διάδικοι οφείλουν να καταθέσουν τις προτάσεις και να προσκομίσουν όλα τα αποδεικτικά μέσα και τα διαδικαστικά έγγραφα που επικαλούνται με αυτές. Μέσα στην ίδια προθεσμία κατατίθενται το αποδεικτικό επίδοσης της αγωγής, καθώς και τα πληρεξούσια έγγραφα προς τους δικηγόρους κατά το άρθρο 96. Το δικαστικό ένσημο κατατίθεται το αργότερο μέχρι τη συζήτηση της υπόθεσης. Η παραπάνω προθεσμία παρατείνεται κατά τριάντα (30) ημέρες για όλους τους διαδίκους αν ο εναγόμενος ή κάποιος από τους ομοδίκους του διαμένει στο εξωτερικό ή είναι άγνωστης διαμονής.`,
  ];

  filtered.forEach(r => {
    if (
      (!earlierThan(start, r.dates_start) &&
        laterThan(r.dates_start, prothesmia)) ||
      (!earlierThan(start, r.dates_end) && !laterThan(prothesmia, r.dates_end))
    ) {
      if (text.ypologismos.length === 0) {
        text.ypologismos.push('Εξαιρέθηκαν οι ημερομηνίες:');
      }

      text.ypologismos.push(r.text);
    }
  });
  if (
    checkIfAnastoliDiakopon(
      start,
      prothesmia,
      options.dimosio_code ? options.dimosio_code : '1'
    )
  ) {
    text.ypologismos.push(
      'Εξαιρέθηκαν οι ημερομηνίες της αναστολής λόγω δικαστικών διακοπών.'
    );
  }
  const addedDaysText = getProtaseisAddedDays(start, options);
  text.ypologismos = [...text.ypologismos, ...addedDaysText.ypologismos];
  text.imeres = addedDaysText.imeres;

  return text;
};
