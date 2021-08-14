# @nkp/fs-crawl

Crawl the filesystem for files and directories.

Discovering files and directories trigger callbacks allowing the user to take arbitrary action.

## Publishing

To a release a new version:

1. Update the version number in package.json
2. Push the new version to the `master` branch on GitHub
3. Create a `new release` on GitHub for the latest version

This will trigger a GitHub action that tests and publishes the npm package.
