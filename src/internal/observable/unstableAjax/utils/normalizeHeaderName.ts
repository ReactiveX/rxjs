/**
 * This will mutate provided header object.
 *
 * @param headers
 * @param normalizedName
 */
const normalizeHeaderName = (headers: Record<string, any> | undefined, normalizedName: string) => {
  if (!headers) {
    return;
  }

  Object.keys(headers)
    .filter(key => key !== normalizedName && key.toUpperCase() === normalizedName.toUpperCase())
    .map(key => ({ key, value: headers[key] }))
    .forEach(({ key, value }) => {
      headers[normalizedName] = value;
      delete headers[key];
    });
};

export { normalizeHeaderName };
