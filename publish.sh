#!/bin/bash

echo "Publish master or stable?"
select branch in "master" "stable"; do
  read -p "You selected $branch. [Enter] to continue"
  git checkout $branch

  git pull upstream $branch

  read -p "Just pulled $branch from upstream. If everything is okay, hit [Enter]"

  echo "Clear node_modules?"
  select yn in "Yes" "No"; do
    case $yn in
      Yes) rm -rf node_modules/; npm i; break;;
      No) echo "Skipped clearing node_modules"; break;;
    esac
  done

  if [ $branch = "master" ]; then
    echo "You cannot publish master from this script at this time. To continue, publish manually from this point."
    exit 1
  fi

  echo "What type of publish?"
  select version_type in "patch" "minor" "major"; do
    read -p "Creating commit and tag for a $version_type release. Press [Enter].";

    # Use npm to increment the version and capture it
    version_with_v=`npm version $version_type`

    # Remove the "v" from v8.8.8 to get 8.8.8
    version=`echo $version_with_v | cut -b 2-`

    # Remove npm's v8.8.8 tag and replace it with 8.8.8
    # because that's what we've always done
    git tag -d $version_with_v

    echo "Deleted tag because it's wrong, no worries, we'll tag again in a sec"

    echo "Generating CHANGELOG.md"
    npm run generate_changelog

    # Quickly show changes to verify
    git diff
    read -p "Examine and correct CHANGELOG.md. [Enter] to continue"

    git tag $version


    read -p "git tag updated to $version; [Enter] to continue";
    break
  done


  read -p "Ready to publish @reactivex/rxjs@$version. [Enter] to continue"
  npm publish

  read -p "Ready to publish rxjs@$version. [Enter] to continue"
  cd dist/package/
  npm publish
  cd ../../

  read -p "Ready to push $branch to upstream. [Enter] to continue"
  git push upstream $branch
  git push upstream --tags

  break
done
