import { MonitoringPage } from './app.po';

describe('monitoring App', function() {
  let page: MonitoringPage;

  beforeEach(() => {
    page = new MonitoringPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
