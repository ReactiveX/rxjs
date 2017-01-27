/**
 * This function returns the current `Zone` if `Zone` is loaded or `null` if `Zone` is not loaded.
 *
 * It is expected that the VM will inline the `() => null` case when no `Zone` is present resulting
 * in no performance impact.
 */
export const getZone: () => Zone = typeof Zone !== 'undefined' && Zone.current
    ? () => Zone.current
    : () => null;
