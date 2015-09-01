export default function isDate(value) {
  return value instanceof Date && !isNaN(+value);
}