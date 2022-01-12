// TODO(pmansour): uncomment this once I figure out absolute ES6 imports in Jasmine.
// import urlLib from '../../src/util/url.js';
// const { getLoginRedirectUrl } = urlLib;

// describe("getLoginRedirectUrl", function() {
//   it("should support URL scheme for the continuation URL", function() {
//     const redirectUrl = new URL(getLoginRedirectUrl('https://google.com'));
//     expect(redirectUrl.searchParams.get('continue')).toEqual('https://google.com');
//   });

//   describe("when redirecting to meet.google.com", function() {
//     const continuationUrl = 'meet.google.com';

//     it("should URL encode the continuation URL", function() {
//       const redirectUrl = new URL(getLoginRedirectUrl(continuationUrl));
//       expect(redirectUrl.search).toContain(encodeURIComponent(continuationUrl));
//     });
//   });
// });
