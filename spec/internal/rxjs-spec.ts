import { expect } from 'chai';
import * as umd from '../../src/internal/umd';
import * as rx_index from '../../src';
import * as rx_operators from '../../src/operators';
import * as rx_testing from '../../src/testing';
import * as rx_ajax from '../../src/ajax';
import * as rx_websocket from '../../src/websocket';

describe('rxjs exports', () => {
  Object.keys(rx_index).forEach(key => {
    it(`should export rxjs.${key}`, () => {
      expect(umd[key]).to.equal(rx_index[key]);
    });
  });

  Object.keys(rx_operators).forEach(key => {
    it(`should export rxjs.operators.${key}`, () => {
      expect(umd.operators[key]).to.equal(rx_operators[key]);
    });
  });

  Object.keys(rx_testing).forEach(key => {
    it(`should export rxjs.testing.${key}`, () => {
      expect(umd.testing[key]).to.equal(rx_testing[key]);
    });
  });

  Object.keys(rx_ajax).forEach(key => {
    it(`should export rxjs.ajax.${key}`, () => {
      expect(umd.ajax[key]).to.equal(rx_ajax[key]);
    });
  });

  Object.keys(rx_websocket).forEach(key => {
    it(`should export rxjs.websocket.${key}`, () => {
      expect(umd.websocket[key]).to.equal(rx_websocket[key]);
    });
  });
});
