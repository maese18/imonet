export function orDefaultObject(value, defaultObject) {
  if (value) {
    return value;
  }
  return defaultObject;
}
