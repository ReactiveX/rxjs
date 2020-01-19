# How to maintain the MigrationTimeLine


## Workflow

Lets say we want to deprecate the `resultSelector` of the operator `generate`:
https://github.com/ReactiveX/rxjs/blob/6.5.3/src/internal/observable/generate.ts#L68

1. Collect information for following things:
  - **Source Link**  
    Link to the lines of code in GitHub in the version it got introduced.
    Following things should be considered:
    - The link should target the tag e.g. `.../blob/6.5.4/src/...`
    - The link should target the exact line of code e.g. `.../src/.ts#L42`
      - If multiple lines are effected the link should include all of them e.g. `.../src/.ts#L21-L42`
    `https://github.com/ReactiveX/rxjs/blob/6.5.4/src/internal/observable/generate.ts#L68`
  - **Deprecation Message** 
  The <HumanReadableShortMessage> part from the code placed next to `@deprecated` section.
  The Pattern for the text in the source code is: <HumanReadableShortMessage> - see <LinkToDeprecationPage>
  - **Reason**  
  Short explanation of why the deprecation got introduced 
  - **Implication**  
  This section is an explanation that accompanies the 'before deprecation' and 'after deprecation' snippets.
  It explains the different between the two versions to the user
  in a detailed way to help the user to spot the differences in code.
  - **Code Example Before**  
  Code example showing the situation before the deprecation.
  Consider following guide lines:
    - No '$' notation
    - One line between imports asn code
    - const source ... => ... source.subscribe(next: n => console.log(n));
    - It has to work in StackBlitz in the right version
    - Code should log a result
  - **Code Example After**
  See code example before
  - **Estimated Breaking Version**
  Version of breaking change
  
Data collected for generate look like this:
```typescript
const deprecation = {
    sourceLink: `https://github.com/ReactiveX/rxjs/blob/6.5.4/src/internal/observable/zip.ts#L37`,
    breakingChangeVersion: '7',
    deprecationMsg: `use the map operator instead of a result selector`,
    reason: `By removing the result selector from generate we get a smaller bundle since and better maintainability. Refactoring to use a map operation instead.',
    implication: 'For generate, the removal of the resultSelector argument means that if callers want to
                     perform a projection, they will have to move this code into an additional map operator.
                     To refactor this, take the function used as resultSelector and place it into a map operator below.`,
    exampleBefore: `
    import { generate} from 'rxjs';
    
    const initialState: number = 0;
    const condition: (v: number) => boolean = x => x < 3;
    const iterate:  (state: number) => number =  x => x + 1; 
    const resultSelector: (v: number) => number = x => x * 1000;
    
    const source = generate(initialState, condition, iterate, resultSelector);
    source.subscribe(n => console.log(n));
    `,
    exampleAfter: `
    import { generate} from 'rxjs';
    import { map} from 'rxjs/operators';
     
    const initialState: number = 0;
    const condition: (v: number) => boolean = x => x < 3;
    const iterate:  (state: number) => number =  x => x + 1; 
    const resultSelector: (v: number) => number = x => x * 1000;
    
    const source = generate(initialState, condition, iterate)
    .pipe(
      map(resultSelector)
    );
    source.subscribe(n => console.log(n));
    `
}
```

2. To get a unique id for this item we need some more information:
 - **Subject**  
  The subject of migration. What piece is effected?
  - **Subject Type** 
  This helps to generate the item id.
  As the docs ApiSymbo is reused we get a nice icon that
  shows us the type of the subject i.e. class, function etc.
    - class
    - functions
    - constant
    - var
    - let
- **Subject Action** 
 Short string that explains the action to the item.
  - What happened to the subject?
  - What attribute of the piece is effected? 
  By default 'deprecated'

All data related to the UID has to be url encode able without modifying the string. 

```typescript
const deprecation = {
  // ... previous information
  subject: 'generate',
  subjectType: 'function',
  subjectAction: 'resultSelector-deprecated',
  // this is needed to create the linking between a deprecation and a breaking change
  breakingChangeSubjectAction: 'resultSelector-removed'
}
```
3. Collect information for breakingChange item. Here the only thing we need to know is what happens to the deprecated code.
   In our case it get's removed. This information is needed to fill the `subjectAction` of the breaking change. 
   For our deprecation we would use the string `'resultSelector-removed'`.
   This information is needed to enable linking in the docs page.

4. Create the deprecation message following the pattern:
`@deprecated <HumanReadableShortMessage> - see <LinkToDeprecationPage>`
where `<HumanReadableShortMessage>` is the field `deprecationMsg`
and `<LinkToDeprecationPage>` follows the pattern:
`<URL>#<version>_deprecation-<subjectType>-<subject>-<subjectAction>`

The final deprecation message could loot like this:
`@deprecated use the map operator instead of a result selector - see https://rxjs.dev/migration#6.5.4_deprecation-function-generate-resultSelector-deprecated`


5. Insert the message into code

6. Insert deprecation object into release list:

```typescript
const list = [
  {
    version: '6.5.4',
    deprecations: [
        // new deprecation here
    ] 
  }
];
```

7. Create the breakingChange item:
 
```typescript
const breakingChange = {
    subject: 'generate',
    subjectType: 'function',
    subjectAction: 'resultSelector-removed',
    deprecationVersion: '6.5.4',
    deprecationSubjectAction: 'resultSelector-deprecated',
    breakingChangeMsg: 'Operator generate removed argument resultSelector'
};
```

As we can the only missing information here is `subjectAction` and `breakingChangeMsg`.
The rest can be derived from the deprecation item. 
`deprecationSubjectAction` is needed to enable linking to the deprecation item in the docs page.

8. Insert breakingChange object into release list:

```typescript
const list = [
  {
    version: '7.0.0',
    breakingChanges: [
        // new breakingChange here
    ] 
  }
];
```

## Automation

As help I suggest creating a form that contains drop downs for all enumerable fields and other time saving features.
The form shows the time and the maintainer can check the provided code and open it in StackBlitz in the correct version of deprecation and breaking change.

After the maintainer ensures correctness of the data a copy-to-clipboard button is provided for the deprecation message in code as well as for the json data.
The generated data respects open versions e.g. `7.x` and could do other checks against the existing data.

## Other suggestions

If a user uses a broken link a support form pops up and collects data over e.g. the above described form or a new one.
And gets on click redirected to github with the issue template prefilled for an issue for a missing deprecation information.

