export const revalidate = 60;

export function setCacheHeaders(response: Response, maxAge = 60) {
  response.headers.set(
    "Cache-Control",
    `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`
  );
  return response;
}
