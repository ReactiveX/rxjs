# MigrationTimeLine Container Component

The migration timeline container takes over the following things: 

- react to URL changes and map it to component state
As we can not control the URL we have to introduce some parsing in between URL change and component state update: 
  - ensure proper release UID (parsing, searching for latest release)
  - ensure proper item UID (parsing, search for relevant release item)
  
- react to migration data changes and map it to component state (as we have no backend this happens only once from static data)
  - calculate UID`s linking and Date formatting

- react to UI interaction and trigger navigation (URL is leading and reflected in the component state)
  - release selection 
  - item selection

The UI consists out of:
- A navigation bar that enables us to navigate between release versions
- A list of releases that displays all information related to the release including a list of deprecations ect..

# MigrationTimeLine Container Component