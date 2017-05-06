import Now from './dist';

describe('Now API Wrapper', () => {
  const TEST_TOKEN = 'TEST_TOKEN';

  test('throws error if constructor does not get token', () => {
    expect(() => new Now()).toThrow(/token/);
  });

  test('correctly generates API url', () => {
    const now = new Now(TEST_TOKEN);

    const testUrlPath = 'testUrlPath';
    const generatedTestUrl = now._generateUrl(testUrlPath);
    expect(generatedTestUrl).toBe('https://api.zeit.co/testUrlPath');

    const testSlashUrlPath = '/testUrlPath';
    const generatedTestSlashUrlPath = now._generateUrl(testSlashUrlPath);
    expect(generatedTestSlashUrlPath).toBe('https://api.zeit.co/testUrlPath');
  });
});
