export const VERSION = "0.1.2";

export function prepublish(version: string) {
  return true; // false to prevent the publish
}

export function postpublish(version: string) {}
