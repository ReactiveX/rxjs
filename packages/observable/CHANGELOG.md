# 7.0.0 (2026-07-05)

### 🚀 Features

- Add es2015 entries to the exports declaration to support Angular

- ⚠️ RxJS updated to TypeScript 4.9

- ⚠️ Dropping support for Node 14.

- No longer publishing UMD or ES5 builds

### 🔥 Performance

- remove comments from js-files

### 🩹 Fixes

- VS code will now properly import operators, et al

- RxJS now supports tslib 2.x, rather than just 2.1.x

- RxJS now supports tslib 2.x, rather than just 2.1.x

#### ⚠️ Breaking Changes

- RxJS is now being built with TypeScript 4.9 and we assume that TS 4.9 or higher will be used with our types. At the time of this writing the risk is around the existence of the `ReadableStream` type in TypeScript. If that's not supported in your version of TypeScript, you might be able to work around this issue by defining a global ReadableStream type."
- Node 14 is no longer supported in version 8. End of life for Node 14 is April 30, 2023. There's no reason for RxJS version 8 to support it, as we won't even be out of beta at that point.

### ❤️ Thank You

- Alan Agius
- Alexander Kuzmin
- Andrew Crites
- Andrew Leedham
- Anirudh Varma
- Arpad Vas
- Ben Lesh
- Benedikt Meurer
- Bill Barry
- Boris Cherny
- Bowen Ni
- Bram Gotink
- Caleb Boyd
- Christian Kohler
- Christian Svensson
- Christopher Dahm
- Chua Kang Ming
- Cotton Hou
- Daniel Wiehl
- David Driscoll
- demensky
- Dennis
- Dkosasih
- Dmitry Demensky
- Dylan Cutler
- Elias Ylönen
- Evert Bouw
- Felix Becker
- Georgii Dolzhykov
- Gerhard Gradnig
- Gregor Stamac
- Henry Zhang
- Ido Sela
- Ignacio Le Fluk
- Ingo Bürk
- Jan-Niklas W
- Jason Awbrey
- Jay Phelps
- Jeremy
- Jesse Jaara
- John Chadwick
- JoostK
- Josep M Sobrepere
- kaos
- Klaus Meinhardt
- Kristiyan Kostadinov
- Kristoffer K
- leewz
- Liu Bowen
- Mark Knapp
- Martin Probst
- Martin Sikora
- Mateusz Podlasin
- Matthias Kunnen
- Mattias Holmlund
- Michael Hladky
- Michael Paul
- Michael Spaxman
- Mladen Jakovljević
- Moshe Kolodny
- Mykolas
- Naiwei Zheng
- nename0
- Nicholas Jamieson
- Nicolas DUBIEN
- ò_ó
- OJ Kwon
- Oleksandr Sherekin
- Oliver Hoff
- Oliver Joseph Ash
- Paul Taylor
- peaBerberian
- Philip Sanetra
- Raphael Ochsenbein
- Raziel
- Rehan Sattar
- Rob Simpson
- Roc Wong
- Rohan Sikdar
- Ryan R Sundberg
- Sam Saccone
- Scott Cooper
- Sebastian
- Sebastian Pernett
- Simen Bekkhus
- Taras Mankovski
- thefliik
- Tim Deschryver
- tmair
- Tomas Dostal
- Valentin Hăloiu
- Victor Oliva
- Yadong Xie
- Zcating
