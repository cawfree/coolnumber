# coolnumber

A way to safely give programmatically-generated decimal values a little flare! 💅

## 🚀 getting started

This package will coerce the digits of an input value to the nearest user-friendly decimal value, whilst taking care not to exceed caller-defined bounds.

You can download [__coolnumber__](https://npmjs.com/package/coolnumber) from [__npm__](https://npmjs.io):

```sh
yarn add coolnumber
```

## ✍️ usage

It's super easy to use [`coolnumber`](https://github.com/cawfree/coolnumber), maybe even _too easy_, so please take care to specify the `max` and `min` values if used in a financial applications to prevent your users from getting rekt. If your value cannot be coerced to a coolnumber, it will be returned equal to the original input value but formatted to the requested `precision`, which defaults in [`wei`](https://eth-converter.com/).

```typescript
import {coolnumber} from 'coolnumber';

coolnumber({
  min: '1',
  max: undefined,
  value: '1',
  coolNumbers: ['69', '420'],
  precision: 2,
}); // 1.69 😈

coolnumber({
  value: '15',
  min: '1',
  coolNumbers: ['1559'],
  precision: 2,
}); // 15.59 🔥
```

## 🦄 types

| Parameter    | Type                          | Default     |
|--------------|-------------------------------|-------------|
| value        | BigDecimalish                 | `undefined` |
| max?         | BigDecimalish                 | `undefined` |
| min?         | BigDecimalish                 | `undefined` |
| precision?   | number                        | `18`        |
| coolNumbers? | readonly (string \| number)[] | `[69, 420]` |

## ✌️ license
[__MIT__](./MIT)
