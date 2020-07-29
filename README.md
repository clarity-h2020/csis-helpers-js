CLARITY CSIS JavaScript Helpers Module [![Build Status](https://ci.cismet.de/buildStatus/icon?job=csis-helpers-js)](https://ci.cismet.de/view/CLARITY/job/csis-helpers-js/)
===========================

## Description

This is a JavaScript helpers module that supports external AJAX Apps like the [Map Component](https://github.com/clarity-h2020/map-component) or the [Table Component](https://github.com/clarity-h2020/simple-table-component) that are embedded as *External iFrame* into the [CLARITY CSIS Drupal Site](https://csis.myclimateservice.eu/) to communicate with the CSIS [Drupal API](https://csis.myclimateservice.eu/jsonapi/) and the AIT [EMIKAT API](https://service.emikat.at/EmiKatTst/swagger/index.html).

## Implementation

The module exports the following libraries:
- **[CSISHelpers](https://github.com/clarity-h2020/csis-helpers-js/blob/dev/src/lib/CSISHelpers.js)**: Methods to extract [Resources](https://csis-dev.myclimateservice.eu/maintenance/resources) assigned to specific [taxonomies](https://csis.myclimateservice.eu/admin/structure/taxonomy) from the [Data Package](https://csis-dev.myclimateservice.eu/maintenance/datapackages) associated with a specific [Study](https://csis-dev.myclimateservice.eu/maintenance/studies). This is e.g. used by the [HazardMap](https://github.com/clarity-h2020/map-component/blob/dev/src/components/CharacteriseHazardMap.js) to create map layers from [hazard characterization](https://csis.myclimateservice.eu/taxonomy/eu-gl/hazard-characterization) resources and group them according to the [Hazards Taxonomy](https://csis-dev.myclimateservice.eu/admin/structure/taxonomy/manage/hazards/overview).
- **[CSISRemoteHelpers](https://github.com/clarity-h2020/csis-helpers-js/blob/dev/src/lib/CSISRemoteHelpers.js)**: Methods to support the communication with the [Drupal API](https://csis.myclimateservice.eu/jsonapi/). In particular provides convenient access  to Data Packages, Studies, etc.
- **[EMIKATHelpers](https://github.com/clarity-h2020/csis-helpers-js/blob/dev/src/lib/EMIKATHelpers.js)**: Methods for communicating with the [EMIKAT API](https://service.emikat.at/EmiKatTst/swagger/index.html). In particular, support the parametrisation of template URLs with values from the [variables taxonomy](https://csis-dev.myclimateservice.eu/admin/structure/taxonomy/manage/dp_variables/overview), e.g. `time_period` and `emissions_scenario`.

### Tests

[Unit Tests](https://github.com/clarity-h2020/csis-helpers-js/tree/dev/src/__tests__) are executed against a local [express.js](https://expressjs.com/) server which emulates some of the APIs. Testing against the remote CSIS is performed when the ENV file `.env.test.local` with the following ENV vars is available in the repository root:

- ORIGIN=http://localhost:3000 # access-control-allow-origin as specified in CSIS Drupal [/web/sites/default/settings.php](https://scm.atosresearch.eu/ari/clarity-csis-drupal/blob/dev/web/sites/default/settings.php)
- CSIS_USERNAME=
- CSIS_PASSWORD=

**Note:** Unit tests are performed using both the libraries in [src](https://github.com/clarity-h2020/csis-helpers-js/tree/dev/src) and the bundled module [dist](https://github.com/clarity-h2020/csis-helpers-js/tree/dev/dist).

## Installation

### Development Environment

The application uses a [rollup.js](https://rollupjs.org/guide/en/)-based build process that bundles the source files as ES6 modules which can be easily imported into other applications. Node **v12.x** and yarn  **v1.x** has to be installed locally.

## Building

Building and installing the module is straightforward:

```sh
yarn install
yarn build
yarn test
```

The **dev** branch is automatically built on [cismet CI](https://ci.cismet.de/view/CLARITY/job/csis-helpers-js/) based on [this](https://github.com/clarity-h2020/csis-helpers-js/blob/dev/Jenkinsfile) pipeline definition. 

## Deployment

The module is not published in any registry, it can be installed directly from GitHub. Of course, a respective [release](https://github.com/clarity-h2020/csis-helpers-js/releases) (tag) has to exist. The release version can be referenced in the dependencies section of `package.json` as follows

```JSON
"csis-helpers-js": "git://github.com/clarity-h2020/csis-helpers-js.git#semver:^0.6.5",
```

## License
 
MIT © [cismet GmbH](https://github.com/cismet)