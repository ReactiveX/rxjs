// Instead of using any - or another less-than-ideal type - to workaround a
// TypeScript problem or bug, create a type alias and use that instead.
// Wherever possible, use a TypeScript issue number in the type - something
// like TS_18757 - or use a descriptive name and leave a detailed comment
// alongside the type alias.

// When TypeScript was bumped to version 4.2, there was an issue with
// signatures being deemed incompatible when they ought to be compatible.
// Really, any function should be compatible with `(...args: any[]) => void`.
export type TS_IncompatibleSignature = any;
