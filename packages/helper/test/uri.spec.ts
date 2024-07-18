import { removeUriPathParams } from '../src/uri';

describe('removeUriPathParams', () => {
  it('should format the API URI correctly', () => {
    const uri = '/api/users';
    const formattedUri = removeUriPathParams(uri);
    expect(formattedUri).toBe('/api/users');

    const uri2 = '/api/users/{id}';
    const formattedUri2 = removeUriPathParams(uri2);
    expect(formattedUri2).toBe('/api/users');

    const uri3 = '/api/users/{id}/posts/{postId}';
    const formattedUri3 = removeUriPathParams(uri3);
    expect(formattedUri3).toBe('/api/users/posts');
  });
});
