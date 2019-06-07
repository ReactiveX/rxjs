# Breaking Changes

RxJS introduces some breaking changes with the release of version 6. About the major release
breaking changes one can read all the important facts at the [pipeable operator](../pipeable-operators) and the corresponding [migration](../migration) page.

Unfortunately we recently introduces other breaking changes, which will be listed below.

<div class="alert is-important">
  <span>
    Please do note that it's highly possible that you aren't affected by a breaking change, eventhough you are migrating to that
    particular version.
  </span>
</div>

## RxJS@6.4.0

### TypeScript@2.7.0 Regression

RxJS itselfs already used TypeScript 2.8 for quite a while, but version 6.4 was the first version officially relying on features of TypeScript 2.8.
Unfortunately this might break your code if you used to use TypeScript 2.7. You also might run into this issue, when you are using Angular and the Angular CLI with the Version 6.0.X.

You will notice that you are affected by this breaking change when you try to build your application and run into an error looking similar to

```sh
ERROR in node_modules/rxjs/internal/types.d.ts(81,44): error TS1005: ';' expected
node_modules/rxjs/internal/types.d.ts(81,74): error TS1005: ';' expected.
node_modules/rxjs/internal/types.d.ts(81,77): error TS1109: Expression expected.
```

#### Solving the issue

For this particular issue you have two ways to fix it properly:

1. You could update your project to TypeScript version >= 2.8
   In general most of the user of RxJS said that this update was flawless. This is likely possible because the Breaking Changes of TypeScript 2.8 are just affecting a very small user base. You can read about the Breaking Changes of TypeScript 2.8 [here](https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#typescript-28).
2. You can pin your project to rxjs@6.3.3
   In general one should prefer the first option to keep up to date with all his dependencies. If there is really no way to migrate your project to TypeScript >= 2.8 than you can use the previous minor release of rxjs by strictly pinning it in your package.json file.
