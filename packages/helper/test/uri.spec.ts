import { formatApiUri } from '../src/uri';

describe('formatApiUri', () => {
  it('should format the API URI correctly', () => {
    const uri = '/api/users';
    const formattedUri = formatApiUri(uri);
    expect(formattedUri).toBe('/api/users');

    const uri2 = '/api/users/{id}';
    const formattedUri2 = formatApiUri(uri2);
    expect(formattedUri2).toBe('/api/users');
  });
});
