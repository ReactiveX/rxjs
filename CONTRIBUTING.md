# Contributing to RxJS

[Read and abide by the Code of Conduct](CODE_OF_CONDUCT.md)! Even if you don't read it,
it still applies to you. Ignorance is not an exemption.

Contents
- [Pull Requests](#pull-requests)
  - [Coding Style](#code)
  - [Commit Messages](#commit)
- [Creating Operators](doc/operator-creation.md)
- [Unit Tests](#unit-tests)
  - [Writing Marble Tests](doc/writing-marble-tests.md)
- [Performance Tests](#performance-tests)
  - [Macro](#macro)
  - [Micro](#micro)

(This document is a work and progress and is subject to change)

### <a name="pull-requests"></a> Submitting a Pull Request (PR)
Before you submit your Pull Request (PR) consider the following guidelines:

* Search [GitHub](https://github.com/ReactiveX/RxJS/pulls) for an open or closed PR
  that relates to your submission. You don't want to duplicate effort.
* Make your changes in a new git branch:

     ```shell
     git checkout -b my-fix-branch master
     ```

* Create your patch, following [code style guidelines](#code), and **including appropriate test cases**.
* Run the full test suite and ensure that all tests pass.
* Run the micro and macro performance tests against your feature branch and compare against master
  to ensure performance wasn't changed for the worse.
* Commit your changes using a descriptive commit message that follows our
  [commit message conventions](#commit). Adherence to these conventions
  is necessary because release notes are automatically generated from these messages.

     ```shell
     git commit -a
     ```
  Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

* Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```

* In GitHub, send a pull request to `RxJS:master`.
* If we suggest changes then:
  * Make the required updates.
  * Re-run the test suites to ensure tests are still passing.
  * Re-run performance tests to make sure your changes didn't hurt performance.
  * Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

That's it! Thank you for your contribution!


#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete my-fix-branch
    ```

* Check out the master branch:

    ```shell
    git checkout master -f
    ```

* Delete the local branch:

    ```shell
    git branch -D my-fix-branch
    ```

* Update your master with the latest upstream version:

    ```shell
    git pull --ff upstream master
    ```

### <a id="coding"></a> Coding Style Guidelines

- Please use proper types and generics throughout your code.
- 2 space indentation only
- favor readability over terseness

(TBD): For now try to follow the style that exists elsewhere in the source, and use your best judgment.


### <a id="unit-tests"></a>Unit Tests

Unit tests are located under the [spec directory](/spec). Unit tests over synchronous operators and operations 
can be written in a standard [jasmine](http://jasmine.github.io/) style. Unit tests written against any 
asynchronous operator should be written in [Marble Test Style outlined in detail here](docs/writing-marble-tests.md). 

Each operator under test must be in its own file to cover the following cases:

- Never
- Empty
- Single/Multiple Values
- Error in the sequence
- Never ending sequences
- Early disposal in sequences

If the operator accepts a function as an argument from the user/developer (for example `filter(fn)` or `zip(a, fn)`), 
then it must cover the following cases:

- Success with all values in the callback
- Success with the context, if any allowed in the operator signature
- If an error is thrown


### <a id="performance-tests"></a>Performance Tests

One of the primary goals of this library is (and will continue to be) great performance. As such, we've employed a variety of performance
testing techniques.

  - DON'T labor over minute variations in ops/sec or milliseconds, there will always be varience in perf test results.
  - DON'T alter a performance test unless absolutely necessary. Performance tests may be compared to previous results from previous builds.
  - DO run tests multiple times and make sure the margins of error are low
  - DO run tests in your feature branches and compare them to master
  - DO add performance tests for all new operators
  - DO add performance tests that you feel are missing from other operators
  - DO add additional performance tests for all worthy code paths. If you develop an operator with special handling for scalar observables,
    please add tests for those scenarios
    

#### <a id="macro"></a>Macro
  
[Macro performance tests](perf/macro) are best written for scenarios where many object instance allocations (or deallocations) are occuring. Operators
that create a lot of child subscriptions, or operators that emit new objects like Observables and Subjects are definitely worth creating 
macro performance tests for.

Other scenarios for macro performance testing may include common end-to-end scenarios from real-world apps. If you have a situation in your 
app where you feal RxJS is performing poorly, please [submit and issue](/ReactiveX/RxJS/issues) and include a minimal code example showing
your performance issues. We would love to solve perf for your real-world problems and add those tests to our perf test battery.

Macro performance tests can be run by hosting the root directory with any web server (we use [http-server](https://www.npmjs.com/package/http-server)), 
then running:

```sh
npm run build_all
protractor protractor.conf.js
```


#### <a id="micro"></a>Micro

[Micro performance tests](perf/micro) really only serve to test operations per second. They're quick and easy to develop, and provide a reasonable look into the
relative performance of our operators versus prior versions. All operators should have corresponding micro performance tests.

Micro performance test can be run with:

```sh
npm run build_all
node perf/micro
```

If you wish to run a single micro performance test, you can do so by providing a single argument with the name of the perf test file(s):

```sh
node perf/micro zip
```

## <a name="commit"></a> Commit Message Guidelines

We have very precise rules over how our git commit messages can be formatted.  This leads to **more
readable messages** that are easy to follow when looking through the **project history**.  But also,
we use the git commit messages to **generate the RxJS change log**.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

### Revert
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change. For example
`Observable`, `Subject`, `switchMap`, etc.

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.