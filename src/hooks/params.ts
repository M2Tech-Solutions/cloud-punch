export function useParams<
  AwaitedParams extends Record<string, string>,
>(): Partial<AwaitedParams> {
  if (typeof window === "undefined") {
    return {} as AwaitedParams;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const params = {} as AwaitedParams;
  searchParams.forEach((value, key) => {
    params[key as keyof AwaitedParams] =
      value as AwaitedParams[keyof AwaitedParams];
  });
  return params;
}
