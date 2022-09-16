import 'jest';

import BigDecimal from 'js-big-decimal';

import {
  abs,
  BD_ONE,
  BD_ZERO,
  endsWithCoolNumber,
  filterValidRange,
  getMinDelta,
  minMaxCoolNumber,
  pickClosestCoolNumber,
  toDecimalsString,
  coolnumber,
} from '../src';

describe('coolnumber', () => {
  it('jest', () => expect(true).toBeTruthy());

  it('constants', () => {
    expect(BD_ZERO.getValue()).toBe('0');
    expect(BD_ONE.getValue()).toBe('1');
  });

  it('toDecimalsString', () => {

    expect(() => toDecimalsString(BD_ZERO, -1))
      .toThrowError('Precision must be greater than or equal to zero.');

    // Default precision.
    expect(toDecimalsString(BD_ZERO)).toBe('0.000000000000000000');
    expect(toDecimalsString(BD_ONE)).toBe('1.000000000000000000');

    // OpenSea supports up to 4 decimal places.
    expect(toDecimalsString(BD_ONE, 4)).toBe('1.0000');
    expect(toDecimalsString(new BigDecimal('1.1111'), 4)).toBe('1.1111');
    expect(toDecimalsString(new BigDecimal('1.11111'), 4)).toBe('1.1111');
    expect(toDecimalsString(new BigDecimal('1.11'), 4)).toBe('1.1100');

    expect(toDecimalsString(new BigDecimal('1.11'), 0)).toBe('1');
    expect(toDecimalsString(new BigDecimal('-1.11'), 0)).toBe('-1');
    expect(toDecimalsString(new BigDecimal('1.11'), 1)).toBe('1.1');
    expect(toDecimalsString(new BigDecimal('-1.11'), 1)).toBe('-1.1');
  });

  it('getMinDelta', () => {
    expect(() => getMinDelta(-1))
      .toThrowError('Precision must be greater than or equal to zero.');
    expect(getMinDelta(1).getValue())
      .toBe('0.1');
    expect(getMinDelta().getValue())
      .toBe('0.000000000000000001');
    expect(getMinDelta(0).getValue())
      .toBe('1');
  });
  it('endsWithCoolNumber', () => {
    expect(endsWithCoolNumber(new BigDecimal('420'), 420))
      .toBe(true);
    expect(endsWithCoolNumber(new BigDecimal('420'), '420'))
      .toBe(true);
    expect(endsWithCoolNumber(new BigDecimal('4.20'), '420'))
      .toBe(true);
    expect(endsWithCoolNumber(new BigDecimal('4.69'), '420'))
      .toBe(false);
    expect(endsWithCoolNumber(new BigDecimal('4.69'), '69'))
      .toBe(true);
    expect(endsWithCoolNumber(new BigDecimal('6969'), '69'))
      .toBe(true);
    expect(endsWithCoolNumber(new BigDecimal('68.9'), '69'))
      .toBe(false);
  });

  it('minMaxCoolNumber(69,4)', () => {
    const {min, max} = minMaxCoolNumber(new BigDecimal('40'), 69, 4);

    expect(min.getValue()).toBe('39.9969');
    expect(max.getValue()).toBe('40.0069');
  });

  it('minMaxCoolNumber(40.2,2)', () => {
    const {min, max} = minMaxCoolNumber(new BigDecimal('40.2'), 69, 2);

    expect(min.getValue()).toBe('39.69');
    expect(max.getValue()).toBe('40.69');
  });

  it('minMaxCoolNumber(69, 0)', () => {
    const {min, max} = minMaxCoolNumber(new BigDecimal('69'), 69, 0);

    expect(min.getValue()).toBe('69');
    expect(max.getValue()).toBe('69');
  });

  it('minMaxCoolNumber(68, 1)', () => {
    const {min, max} = minMaxCoolNumber(new BigDecimal('68'), 69, 1);

    expect(min.getValue()).toBe('66.9');
    expect(max.getValue()).toBe('76.9');
  });

  it('filterValidRange::bounds', () => {
    const result = filterValidRange({
      max: '1',
      min: '0',
      range: [{max: new BigDecimal('1'), min: new BigDecimal('0')}],
    });

    expect(result[0].getValue()).toEqual(new BigDecimal('1').getValue());
    expect(result[1].getValue()).toEqual(new BigDecimal('0').getValue());
  });

  it('filterValidRange::out-of-bounds', () => {
    const result = filterValidRange({
      max: '1',
      min: '0',
      range: [{max: new BigDecimal('2'), min: new BigDecimal('-1')}],
    });

    expect(result.length).toBe(0);
  });

  it('filterValidRange::partial-min', () => {
    const result = filterValidRange({
      max: '1',
      min: '0',
      range: [{max: new BigDecimal('2'), min: new BigDecimal('0')}],
    });

    expect(result.length).toBe(1);
    expect(result[0].getValue()).toBe('0');
  });

  it('filterValidRange::partial-max', () => {
    const result = filterValidRange({
      max: '1',
      min: '0',
      range: [{max: new BigDecimal('1'), min: new BigDecimal('-1')}],
    });

    expect(result.length).toBe(1);
    expect(result[0].getValue()).toBe('1');
  });

  it('abs', () => {
    expect(abs(new BigDecimal('0')).getValue()).toBe('0');
    expect(abs(new BigDecimal('1.12324')).getValue()).toBe('1.12324');
    expect(abs(new BigDecimal('-1.12324')).getValue()).toBe('1.12324');
  })

  it('pickClosestCoolNumber', () => {
    expect(
      pickClosestCoolNumber({
        value: new BigDecimal('0'),
        range: [new BigDecimal('-0.5'), new BigDecimal('2')],
      }).getValue()
    ).toBe('-0.5');
    expect(
      pickClosestCoolNumber({
        value: new BigDecimal('1.9'),
        range: [new BigDecimal('-0.5'), new BigDecimal('2')],
      }).getValue()
    ).toBe('2');
  });

  it('toCoolNumber', () => {
    expect(coolnumber({value: '1'}))
      .toBe('0.999999999999999969');
    expect(coolnumber({value: '1', min: '1'}))
      .toBe('1.000000000000000069');
    expect(coolnumber({value: '1', min: '1', max: '1'}))
      .toBe('1.000000000000000000');
    expect(coolnumber({value: '1', min: '1', max: '1', precision: 0}))
      .toBe('1');
    expect(coolnumber({value: '1', precision: 0}))
      .toBe('69');
    expect(coolnumber({value: '1', max: '69', precision: 0}))
      .toBe('69');
    expect(coolnumber({value: '1', max: '68', precision: 0}))
      .toBe('-69');
    expect(coolnumber({value: '420'}))
      .toBe('420.000000000000000000');
    expect(coolnumber({value: '69'}))
      .toBe('69.000000000000000000');
  });

  it('readme', () => {
    expect(
      coolnumber({
        min: '1',
        max: undefined,
        value: '1',
        coolNumbers: [69, 420],
        precision: 2,
      })
    ).toBe('1.69');
    expect(
      coolnumber({
        value: '15',
        min: '1',
        coolNumbers: [1559],
        precision: 2,
      })
    ).toBe('15.59');
  });

  it('bug:precision', () => {
    expect(
      coolnumber({
        value: '0.12999999999',
        min: '0.12420000001125',
        max: '0.12999999999',
        precision: 4,
      })
    ).toBe('0.1269');
  });
});

