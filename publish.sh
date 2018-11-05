## Run the tests first
npm test

## Build the package
rm -rf package/
npm run build

## Move to the package so we can publish
cd package/

## Publish the next version
npm publish --tag next

## Clean up
cd ../
rm -rf package/
