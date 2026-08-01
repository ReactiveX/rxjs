import '@rxjs/observable-polyfill';

type ExtensionImplementation = (...args: never[]) => unknown;

interface ExtensionTargets {
  constructor: object;
  prototype: object;
}

export interface InstallObservableExtensionOptions {
  name: string;
  symbol: symbol;
  static?: ExtensionImplementation;
  instance?: ExtensionImplementation;
  targets?: ExtensionTargets;
}

interface PendingInstallation {
  implementation: ExtensionImplementation;
  target: object;
  targetName: 'Observable' | 'Observable.prototype';
}

/** Installs one exact RxJS capability without permitting partial mutation. */
export function installObservableExtension(options: InstallObservableExtensionOptions): void {
  const targets = options.targets ?? {
    constructor: Observable,
    prototype: Observable.prototype,
  };
  const installations: PendingInstallation[] = [];

  if (options.static) {
    installations.push({
      implementation: options.static,
      target: targets.constructor,
      targetName: 'Observable',
    });
  }

  if (options.instance) {
    installations.push({
      implementation: options.instance,
      target: targets.prototype,
      targetName: 'Observable.prototype',
    });
  }

  if (installations.length === 0) {
    throw new TypeError(`Cannot install RxJS ${options.name} extension: no implementation was provided`);
  }

  const pending = installations.filter((installation) => preflightInstallation(options, installation));
  const applied: PendingInstallation[] = [];

  try {
    for (const installation of pending) {
      Object.defineProperty(installation.target, options.symbol, {
        configurable: true,
        enumerable: false,
        value: installation.implementation,
        writable: true,
      });
      applied.push(installation);
    }
  } catch (error) {
    let installation: PendingInstallation | undefined;
    while ((installation = applied.pop())) {
      Reflect.deleteProperty(installation.target, options.symbol);
    }

    throw new TypeError(`Cannot install RxJS ${options.name} extension: property definition failed and the installation was rolled back`, {
      cause: error,
    });
  }
}

function preflightInstallation(options: InstallObservableExtensionOptions, installation: PendingInstallation): boolean {
  const existing = Object.getOwnPropertyDescriptor(installation.target, options.symbol);
  if (existing) {
    if ('value' in existing && existing.value === installation.implementation) {
      return false;
    }

    throw new TypeError(
      `Cannot install RxJS ${options.name} extension on ${installation.targetName}: exact ${formatSymbol(
        options.symbol
      )} is already occupied`
    );
  }

  if (!Object.isExtensible(installation.target)) {
    throw new TypeError(`Cannot install RxJS ${options.name} extension on ${installation.targetName}: target is not extensible`);
  }

  return true;
}

function formatSymbol(symbol: symbol): string {
  return symbol.description === undefined ? symbol.toString() : `Symbol(${symbol.description})`;
}
