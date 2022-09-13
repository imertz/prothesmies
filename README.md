![Προθεσμίες logo](https://github.com/imertz/prothesmies/blob/master/logo.jpg)
# prothesmies

Εφαρμογή ανοιχτού κώδικα για τον υπολογισμό Δικαστικών προθεσμιών.

## Εγκατάσταση

```bash
npm install prothesmies
```

## Χρήση

```js
const prothesmies = require('prothesmies');

const apotelesmata = prothesmies.prothesmiesNeasTaktikis('2022-02-20', {
  dikasimos: '2022-12-14',
  topiki: 'Αθηνών',
  yliki: 'Ειρ',
});
```

##### In ES6 module notation:

```js
import { prothesmiesNeasTaktikis } from 'prothesmies';

const apotelesmata = prothesmiesNeasTaktikis('2022-02-20', {
  dikasimos: '2022-12-14',
  topiki: 'Αθηνών',
  yliki: 'Ειρ',
});
```

# License

[MIT](./LICENSE)
