import { Options } from '../../Types/interfaces';
import {
  barbaraLegalAnalysis,
  danielLegalAnalysis,
  legalAnalysis,
} from '../../../LegalAnalysis/legalAnalysis';
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

  const filtered = [
    ...legalAnalysis,
    ...barbaraLegalAnalysis,
    ...danielLegalAnalysis,
  ].filter(
    r =>
      checkIfIncluded(topiki, r.periohes) &&
      (r.eidos.includes('protaseis') || r.eidos.includes('all'))
  );
  let text: {
    nomothesia: string[];
    ypologismos: string[];
    imeres: string[];
  } = { nomothesia: [], ypologismos: [], imeres: [] };
  if (new Date(start).getTime() >= new Date('2022-01-01').getTime()) {
    if (options.klisi === false) {
      text.nomothesia = [
        `Αρθ.237 § 1 ΚΠολΔ. Μέσα σε ενενήντα (90) ημέρες από τη λήξη της προθεσμίας για την επίδοση της αγωγής κατά την παρ. 2 του άρθρου 215, οι διάδικοι οφείλουν να καταθέσουν τις προτάσεις και να προσκομίσουν όλα τα αποδεικτικά μέσα και τα διαδικαστικά έγγραφα που επικαλούνται με αυτές. Μέσα στην ίδια προθεσμία κατατίθενται το αποδεικτικό επίδοσης της αγωγής, καθώς και τα πληρεξούσια έγγραφα προς τους δικηγόρους κατά το άρθρο 96. Σε περίπτωση έλλειψης των πληρεξουσίων εγγράφων εφαρμόζεται το άρθρο 227. Αν δεν κατατεθούν τα πληρεξούσια έγγραφα μέσα στην προθεσμία που θα ταχθεί, το δικαστήριο εκδίδει οριστική απόφαση επί της αγωγής. Το δικαστικό ένσημο κατατίθεται το αργότερο μέχρι τη συζήτηση της υπόθεσης. Η προθεσμία του πρώτου εδαφίου παρατείνεται σε εκατόν είκοσι (120) ημέρες από τη λήξη της προθεσμίας επίδοσης της αγωγής για όλους τους διαδίκους, αν ο εναγόμενος ή κάποιος από τους ομοδίκους του διαμένει στο εξωτερικό ή είναι άγνωστης διαμονής. Βλ. 237 § 1 ΚΠολΔ, όπως αντικαστάθηκε και ισχύει από την 1η.1.2022 (αντικαταστάθηκε βάσει του άρθρου 12 του Ν.4842/2021).`,
      ];
    } else {
      text.nomothesia = [
        `Αρθ.237 § 1 ΚΠολΔ. Μέσα σε ενενήντα (90) ημέρες από τη λήξη της προθεσμίας για την επίδοση της αγωγής κατά την παρ. 2 του άρθρου 215, οι διάδικοι οφείλουν να καταθέσουν τις προτάσεις και να προσκομίσουν όλα τα αποδεικτικά μέσα και τα διαδικαστικά έγγραφα που επικαλούνται με αυτές. Μέσα στην ίδια προθεσμία κατατίθενται το αποδεικτικό επίδοσης της αγωγής, καθώς και τα πληρεξούσια έγγραφα προς τους δικηγόρους κατά το άρθρο 96. Σε περίπτωση έλλειψης των πληρεξουσίων εγγράφων εφαρμόζεται το άρθρο 227. Αν δεν κατατεθούν τα πληρεξούσια έγγραφα μέσα στην προθεσμία που θα ταχθεί, το δικαστήριο εκδίδει οριστική απόφαση επί της αγωγής. Το δικαστικό ένσημο κατατίθεται το αργότερο μέχρι τη συζήτηση της υπόθεσης. Η προθεσμία του πρώτου εδαφίου παρατείνεται σε εκατόν είκοσι (120) ημέρες από τη λήξη της προθεσμίας επίδοσης της αγωγής για όλους τους διαδίκους, αν ο εναγόμενος ή κάποιος από τους ομοδίκους του διαμένει στο εξωτερικό ή είναι άγνωστης διαμονής. Βλ. 237 § 1 ΚΠολΔ, όπως αντικαστάθηκε και ισχύει από την 1η.1.2022 (αντικαταστάθηκε βάσει του άρθρου 12 του Ν.4842/2021).\nΑρθ.237 § 3 ΚΠολΔ.Στην περίπτωση έκδοσης παραπεμπτικής απόφασης λόγω καθ’ ύλην ή κατά τόπον αναρμοδιότητας ή λόγω μη εισαγωγής της υπόθεσης κατά την προσήκουσα διαδικασία, οι ως άνω προθεσμίες των ενενήντα (90) ή εκατόν είκοσι (120) ημερών για την κατάθεση των προτάσεων αρχίζουν από την κατάθεση της κλήσης για τον προσδιορισμό δικασίμου. Το ίδιο ισχύει, αν το δικαστήριο κηρύξει απαράδεκτη τη συζήτηση της αγωγής. Στις περιπτώσεις των άρθρων 249 και 250 οι διάδικοι μπορούν να καταθέτουν συμπληρωματικές προτάσεις το αργότερο μέχρι τη νέα συζήτηση της υπόθεσης, δίχως να προτείνονται νέοι ισχυρισμοί και νέα αποδεικτικά μέσα με την επιφύλαξη της παρ. 5 του παρόντος Βλ. 237 § 3 ΚΠολΔ, όπως αντικαστάθηκε και ισχύει από την 1η.1.2022 (αντικαταστάθηκε βάσει του άρθρου 12 του Ν.4842/2021).`,
      ];
    }
  } else {
    text.nomothesia = [
      `Αρθ.237 § 1 ΚΠολΔ. Μέσα σε εκατό (100) ημέρες από την κατάθεση της αγωγής οι διάδικοι οφείλουν να καταθέσουν τις προτάσεις και να προσκομίσουν όλα τα αποδεικτικά μέσα και τα διαδικαστικά έγγραφα που επικαλούνται με αυτές. Μέσα στην ίδια προθεσμία κατατίθενται το αποδεικτικό επίδοσης της αγωγής, καθώς και τα πληρεξούσια έγγραφα προς τους δικηγόρους κατά το άρθρο 96. Το δικαστικό ένσημο κατατίθεται το αργότερο μέχρι τη συζήτηση της υπόθεσης. Η παραπάνω προθεσμία παρατείνεται κατά τριάντα (30) ημέρες για όλους τους διαδίκους αν ο εναγόμενος ή κάποιος από τους ομοδίκους του διαμένει στο εξωτερικό ή είναι άγνωστης διαμονής.`,
    ];
  }
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
      options.dimosio ? options.dimosio : false
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
