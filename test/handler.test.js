const handler = require("../modules/summary/controller");

describe('dashboard function', () => {
  it('it should return not null responce', () => {
    expect(handler.hello()).toBe(3);
  });
});