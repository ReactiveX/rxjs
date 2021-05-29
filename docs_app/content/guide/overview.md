# RxJS Guide

Author: Ben Lesh

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://licensebuttons.net/l/by/4.0/80x15.png" /></a>
This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>

## Work In Progress

This guide is evolving. Some sections below are marked "TODO" because they are currently under development.

## Overview

This section is a guide to how to approach RxJS concepts and how to address common issues while learning and using this library. The goal is to go into as much detail as possible or necessary in as many aspects of RxJS as possible while also trying to provide a quick high-level overview of the concepts.

As you are reading, if you don't have time to dive deeply into any one topic, please note that each section has a **"TLDR"** section at the top. For those of you that aren't sure what that means, it means "Too long, didn't read". These sections intend to give the quickest possible summary of the content of the page.

## Topics

The topics are ordered intentionally to provide insight into things folks will need to know about RxJS first before diving into deeper topics. For example, one of the first things people need to know about RxJS is [how to subscribe to an observable](1-subscribing.md), because often "first contact" with RxJS is because they have gotten an observable back from some API or service they just started using in their codebase.

1. [Subscribing](guide/1-subscribing)
2. [Unsubscribing](guide/2-unsubscribing)
3. [Creating An Observable](guide/3-creating-an-observable)
4. [What Is An Operator?](guide/4-what-is-an-operator)
5. [Implementing Operators](guide/5-implementing-operators)
6. [Chaining Operators](guide/6-chaining-operators)
7. [Flattening Operations](guide/7-flattening-operations)
8. [Subjects](guide/8-subjects)
9. [Advanced Subscription Management](guide/9-advanced-subscription-management)
10. Multicasting (TODO)
11. Error Handling (TODO)
12. Async Await And Promises (TODO)
13. Schedulers And Scheduling (TODO)
14. Testing Operators (TODO)
15. Testing Application Code (TODO)
16. Debugging (TODO)
17. Performance (TODO)

## Additional Topics

- [Why Observables?](guide/why-observables)
- [When You Find RxJS Difficult](guide/but-rxjs-is-hard)
- [Writing Readable RxJS](guide/writing-readable-rxjs)
