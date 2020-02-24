export function trimReservedUrlChars(str: string): string {
  // https://www.ietf.org/rfc/rfc2396.txt
  const unreservedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    '0123456789' +
    '-_.!~*\'()'.split('');
  return str.split('').filter(i => unreservedChars.includes(i)).join('');
}

export function trimReservedLinkChars(str: string): string {
  const reservedChars = '_'.split('');
  return str.split('').filter(i => !(reservedChars.includes(i))).join('');
}
