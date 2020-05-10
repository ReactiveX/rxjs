#!/usr/bin/env bash

set -eu -o pipefail

cd ./marbles/

for input in *.txt; do
    output="./marbles/svgs/${input/.txt/.svg}"
    echo "./marbles/${input}" "$output"
done | xargs -t -n2 -P4 npm run generate:marbles -- -f -z 400