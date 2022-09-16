import BigDecimal from 'js-big-decimal';

export type BigDecimalish = ConstructorParameters<typeof BigDecimal>[0];

export type CoolNumberMinMax = {
  readonly min: BigDecimal;
  readonly max: BigDecimal;
};

// Prioritized in coolness.
export const DEFAULT_COOL_NUMBERS: readonly number[] = [
  420,
  69,
];

export const BD_ONE = new BigDecimal('1');
export const BD_ZERO = new BigDecimal('0');

export const DEFAULT_PRECISION = 18;

const getValidPrecisionOrThrow = (maybePrecision: number): number => {
  if (maybePrecision < 0) throw new Error('Precision must be greater than or equal to zero.');
  return Math.ceil(maybePrecision);
};

export const toDecimalsString = (e: BigDecimal, maybePrecision = DEFAULT_PRECISION) => {

  const precision = getValidPrecisionOrThrow(maybePrecision);
  const str = e.getValue();
  const i = str.indexOf('.');

  const dp = `${precision > 0 ? '.' : ''}`;

  if (i < 0)
    return `${str}${dp}${[...Array(precision)].map(() => '0').join('')}`;

  const suffix = str.substring(i + 1).substring(0, precision);
  const padding = Math.max(precision - suffix.length, 0);

  return `${str.substring(0, i)}${dp}${suffix}${[...Array(padding)].map(() => '0').join('')}`;
};

export const getMinDelta = (maybePrecision = DEFAULT_PRECISION): BigDecimal => {
  const precision = getValidPrecisionOrThrow(maybePrecision);

  if (maybePrecision === 0)
    return BD_ONE;

  return new BigDecimal(`0.${[...Array(Math.max(precision - 1, 0))].map(() => '0').join('')}1`);
};

export const getCoolNumberOrThrow = (coolNumber: number | string): number => {
  const maybeCoolNumber = typeof coolNumber === 'string'
      ? parseInt(coolNumber)
      : coolNumber;

  // Ensure the coolNumber is indeed a string integer (floats are not permitted).
  if (
      isNaN(maybeCoolNumber)
      || maybeCoolNumber < 0
      || (typeof coolNumber === 'string' && String(maybeCoolNumber) !== coolNumber)
  )
    throw new Error(`Expected positive integer coolNumber, encountered "${String(
        coolNumber
    )}".`);

  return maybeCoolNumber;
};

export const endsWithCoolNumber = (e: BigDecimal, maybeCoolNumber: number | string) => {
  const coolNumber = getCoolNumberOrThrow(maybeCoolNumber);
  return e.getValue().replace('.', '').endsWith(String(coolNumber));
};

export const minMaxCoolNumber = (
  e: BigDecimal,
  maybeCoolNumber: number | string,
  precision: number = DEFAULT_PRECISION
): CoolNumberMinMax => {
  const coolNumber = getCoolNumberOrThrow(maybeCoolNumber);
  const minDelta = getMinDelta(precision);

  let max: BigDecimal = e;
  let min: BigDecimal = e;

  while (!endsWithCoolNumber(max, coolNumber))
    max = max.add(minDelta);

  while (!endsWithCoolNumber(min, coolNumber))
    min = min.subtract(minDelta);

  return {min, max};
};

export const filterValidRange = ({
  max: maybeMax,
  min: maybeMin,
  range,
}: {
  readonly max?: BigDecimalish;
  readonly min?: BigDecimalish;
  readonly range: readonly CoolNumberMinMax[];
}) => {

  const max = range
    .map(({max}) => max)
    .filter((m) => {
      if (!maybeMax) return true;

      const r = BigDecimal.compareTo(new BigDecimal(maybeMax).getValue(), m.getValue());
      return r === 0 || r === 1;
    });

  const min = range
    .map(({min}) => min)
    .filter((m) => {
      if (!maybeMin) return true;

      const r = BigDecimal.compareTo(new BigDecimal(maybeMin).getValue(), m.getValue());
      return r === 0 || r === -1;
    });

  return [...max, ...min];
};

export const abs = (e: BigDecimal) => BigDecimal.compareTo(e.getValue(), BD_ZERO.getValue()) === -1
  ? e.negate()
  : e;

export const pickClosestCoolNumber = ({
  value,
  range,
}: {
  readonly value: BigDecimal;
  readonly range: readonly BigDecimal[];
}) => {

  if (!range.length) return value;

  const deltas = range.map((e) => abs(abs(value).subtract(abs(e))));

  // Find the range with the smallest difference.
  const sorted = [...deltas].sort(
    (a, b) => BigDecimal.compareTo(a.getValue(), b.getValue())
  );

  return range[deltas.indexOf(sorted[0])];
};

export const coolnumber = ({
  value: defaultValue,
  max,
  min,
  precision = 4,
  coolNumbers = DEFAULT_COOL_NUMBERS,
}: {
  readonly value: BigDecimalish;
  readonly max?: BigDecimalish;
  readonly min?: BigDecimalish;
  readonly precision?: number;
  readonly coolNumbers?: readonly (string | number)[];
}) => {
  const value = new BigDecimal(defaultValue);

  const range = filterValidRange({
    min,
    max,
    range: coolNumbers.map(
      (maybeCoolNumber: string | number) => minMaxCoolNumber(value, maybeCoolNumber, precision)
    ),
  });

  return toDecimalsString(
    pickClosestCoolNumber({value, range }),
    precision
  );
};
