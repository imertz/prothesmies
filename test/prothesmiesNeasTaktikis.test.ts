import { prothesmiesNeasTaktikis } from '../src/utils/NeaTaktiki/prothesmiesNeasTaktikis';
// import { getProtaseis } from '../src/utils/NeaTaktiki/Categories/getProtaseis';
// import { getProsthiki } from '../src/utils/NeaTaktiki/Categories/getProsthiki';
// import { getParemvasiProsek } from '../src/utils/NeaTaktiki/Categories/getParemvasiProsek';

describe('Υπολογισμός Προθεσμιών Νέας Τακτικής', () => {
  it('works', () => {
    expect(
      prothesmiesNeasTaktikis('2022-06-19', {
        dikasimos: '2022-12-23',
        topiki: 'Θεσσαλονίκης',
        katoikos_code: true,
        dimosio_code: false,
      })
    ).toEqual('2022-07-19T00:00:00.000Z');
  });
});
