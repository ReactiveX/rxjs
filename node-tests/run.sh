
rm -rf node-tests/node_modules/

mkdir -p node-tests/node_modules/rxjs
mkdir -p node-tests/node_modules/rxjs1

cp -R dist/package/. node-tests/node_modules/rxjs
cp -R dist/package/. node-tests/node_modules/rxjs1

{
   node node-tests/test.js
  # node --inspect-brk node-tests/test.js
} || {
  echo 'TEST FAILED'
}

