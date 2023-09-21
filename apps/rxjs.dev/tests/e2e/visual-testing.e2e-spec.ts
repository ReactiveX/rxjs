import { browser } from 'protractor';

const Eyes = require('eyes.selenium').Eyes;
const eyes = new Eyes();

describe('RxJS Docs', function() {
  it('shows the landing page', () => {
    eyes.open(browser, 'Landing Page', 'RxJS Docs');
    browser.get('');
    eyes.checkWindow('Landing page!');
    eyes.close();
  });

  it('shows the overview page', () => {
    eyes.open(browser, 'Overview Page', 'RxJS Docs');
    browser.get('/guide/overview');
    eyes.checkWindow('Overview page!');
    eyes.close();
  });

  it('shows the API page', () => {
    eyes.open(browser, 'API Page', 'RxJS Docs');
    browser.get('/api');
    eyes.checkWindow('API page!');
    eyes.close();
  });

  it('shows the migration page', () => {
    eyes.open(browser, 'Migration Page', 'RxJS Docs');
    browser.get('/guide/v6/migration');
    eyes.checkWindow('Migration page!');
    eyes.close();
  });

  it('shows the team page', () => {
    eyes.open(browser, 'Team Page', 'RxJS Docs');
    browser.get('/team');
    eyes.checkWindow('Team page!');
    eyes.close();
  });
});
