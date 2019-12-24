# Data check

## Release

**version** 
type: string 
Examples:
 - 1
 - 1.1
 - 1.1.1
 - 1.1.1-alpha.1
 
**date**  
Find version on [npm](https://www.npmjs.com/package/rxjs).
type: string
Examples for estimated dates:
- YYYY
- YYYY-MM
- YYYY-MM-DD

### Deprecation
- [ ] subject, subjectApiSymbol, subjectAction: Align with others
- [ ] sourceLink: branch and loc correct
- [ ] deprecationMsgCode: check Nicolas suggestions [here](https://github.com/ReactiveX/rxjs/pull/5128#issuecomment-554833722)
- [ ] reason: Can be a lill more wordy than `deprecationMsgCode`
- [ ] implication: Code description to spot the difference
- [ ] exampleBefore, exampleAfter:
  - [ ] No$ notation
  - [ ] One line between imports
  - [ ] const source ... => ... source.subscribe(next: n => console.log(n));
  - [ ] works in StackBlitz
  - [ ] right version
  - [ ] logs a result

---

- [x] 6.0.0-alpha.3
- [x] 6.0.0-alpha.3_deprecation-argument-last-resultSelector
- [x] 6.0.0-alpha.3_deprecation-argument-first-resultSelector
- [x] 6.0.0-beta.4
- [x] 6.0.0-beta.4_deprecation-function-never-deprecated
- [x] 6.0.0-beta.4_deprecation-function-empty-deprecated
- [x] 6.1.0
- [x] 6.1.0_deprecation-interface-ObservableLike-deprecated

// Breaking changes here!
- [x] 6.0.0-rc.0
- [ ] (breakingChange) 6.0.0-rc.0_deprecation-function-concat-deprecated
- [ ] (breakingChange) 6.0.0-rc.0_deprecation-function-merge-deprecated
- [ ] (breakingChange) 6.0.0-rc.0_deprecation-function-combineLatest-deprecated
- [ ] (breakingChange) 6.0.0-rc.0_deprecation-function-zip-deprecated
- [x] 7.0.0-alpha.0
- [x] 7.0.0-alpha.0_deprecation-argument-concat-deprecated
- [x] 7.0.0-alpha.0_deprecation-argument-of-deprecated
- [x] 7.0.0-alpha.0_deprecation-argument-merge-deprecated
- [x] 7.0.0-alpha.0_deprecation-argument-startWith-deprecated
- [x] 7.0.0-alpha.0_deprecation-argument-endWith-deprecated
- [x] 7.0.0-alpha.0_deprecation-class-TestScheduler-property-hotObservables-deprecated
- [x] 7.0.0-alpha.0_deprecation-class-TestScheduler-property-coldObservables-deprecated
- [x] 7.0.0-alpha.0_deprecation-class-VirtualTimeScheduler-moved-frameTimeFactor
- [x] 7.0.0-alpha.0_deprecation-class-VirtualTimeScheduler-property-index-to-private 




---

check all existing breaking changes
 - UIDs match
