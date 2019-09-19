/* 
 * ***************************************************
 * 
 * cismet GmbH, Saarbruecken, Germany
 * 
 *               ... and it just works.
 * 
 * ***************************************************
 */

import axios from 'axios';

/**
 * Until [this discussion](https://github.com/clarity-h2020/data-package/issues/42) is settled,
 * we define the variable names we know already ...
 */

/**
 * The EMIKAT STUDY ID
 * 
 * @type {String}
 */
export const EMIKAT_STUDY_ID = '${emikat_id}';

/**
 * STUDY_VARIANT=BASELINE ... (for future selection of an alternative ADAPTATION variants)
 * 
 * @type {String}
 */
export const STUDY_VARIANT = '${study_variant}';

/**
 * TIME_PERIOD='Baseline' ... (Alternatives are: '20110101-20401231', '20410101-20701231' and '20710101-21001231')
 * 
 * @type {String}
 */
export const TIME_PERIOD = '${time_period}';

/**
 * Allowed values for TIME_PERIOD constant
 * @type {String[]}
 */
export const TIME_PERIOD_VALUES = ['Baseline', '20110101-20401231', '20410101-20701231', '20710101-21001231'];

/**
 * EMISSIONS_SCENARIO='Baseline' ... (Alternatives are: 'rcp26', 'rcp45' and 'rcp85')
 * 
 * @type {String}
 */
export const EMISSIONS_SCENARIO = '${emissions_scenario}';

/**
 * Allowed values for EMISSIONS_SCENARIO constant
 * @type {String[]}
 */
export const EMISSIONS_SCENARIO_VALUES = ['Baseline', 'rcp26', 'rcp45', 'rcp85'];

/**
 * EVENT_FREQUENCY='Rare' ... (Alternatives are: 'Occassional' or 'Frequent')
 * 
 * @type {String}
 */
export const EVENT_FREQUENCY = '${event_frequency}';

/**
 * Allowed values for EVENT_FREQUENCY constant
 * @type {String[]}
 */
export const EVENT_FREQUENCY_VALUES = ['Rare', 'Occasional', 'Frequent'];

const emikatClient = axios.create();

/**
 * 
 * @param {String} url
 * @param {String} emikatCredentials
 * @throws
 */
export async function fetchData(url, emikatCredentials) {
  try {

    console.log('fetching from EMIKAT:' + url);

    const response = await emikatClient.get(url, { headers: { Authorization: emikatCredentials } });

    // we *could* do once:  
    // emikatClient.defaults.headers.common['Authorization'] = emikatCredentials;
    // but that would break functional code as it has side effects on the emikatClient instance.

    return response;

  } catch (e) {
    console.error('could not fetch EMIKAT data from ' + url, e);
    throw e;
  }
};

/**
 * 
 * @param {*} url 
 * @param {*} authString 
 * @deprecated
 */
export async function fetchUsers(url, authString) {
  try {
    console.log('fetching from:' + url);
    const response = await emikatClient.get(url, { headers: { Authorization: authString } });

    // we *could* do once:  
    emikatClient.defaults.headers.common['Authorization'] = authString;
    // but that would break functional code as it has side effects on the emikatClient instance.

    //console.log(JSON.stringify(response));
    return response;

  } catch (e) {
    console.error(e);
    throw e;
  }
};

/**
 * Replaces EMIKAT_STUDY_ID with the actual study id.
 * Note: We *could* use template strings in a fixed URL,  e.g.
 * `https://service.emikat.at/EmiKatTst/api/scenarios/${emikat_id}/feature/view.2812/table/data`
 * However, this has to many drawbacks
 * 
 * @param {String} urlTemplate 
 * @param {String|Number} emikatId 
 * @return {String}
 * 
 * @deprecated use addEmikatParameters() instead!
 */
export function addEmikatId(urlTemplate, emikatId) {
  if (urlTemplate && emikatId && urlTemplate.includes(EMIKAT_STUDY_ID)) {
    //return urlTemplate.replace(EMIKAT_STUDY_ID, emikatId.toString());
    return addEmikatParameters(urlTemplate, new Map([[EMIKAT_STUDY_ID, emikatId]]));
  }

  return urlTemplate;
}

/**
 * Replaces EMIKAT_STUDY_ID with the actual study id.
 * Note: We *could* use template strings in a fixed URL,  e.g.
 * `https://service.emikat.at/EmiKatTst/api/scenarios/${emikat_id}/feature/view.2812/table/data`
 * However, this has to many drawbacks
 * 
 * @param {String} urlTemplate 
 * @param {Map<String,any>} emikatVariables 
 * @return {String}
 * 
 * @deprecated
 */
export function addEmikatParameters(urlTemplate, emikatVariables) {
  if (urlTemplate && emikatVariables) {
    let url = (' ' + urlTemplate).slice(1);
    emikatVariables.forEach((value, key) => {
      url = url.replace(key, value.toString());
    });

    return url;
  }

  return urlTemplate;
}

/**
 * Generates a simple column definition for ReactTable from EMIKAT tabular Data
 * 
 * @param {Object[]} columnnames 
 * @return {Object[]}
 */
export function generateColumns(columnnames) {

  // add parentheses around the entire body `({})` to force the parser to treat the object literal 
  // as an expression so that it's not treated as a block statement.
  return columnnames.map((columnname, index) => ({
    id: columnname, // Required because our accessor is not a string
    Header: columnname,
    accessor: row => row.values[index] // Custom value accessors!
  }));
}

/**
 * We can either use "import EMIKATHelpers from './EMIKATHelpers.js'" and call  "EMIKATHelpers.getIncludedObject(...)" or
 * "import {getIncludedObject} from './EMIKATHelpers.js'" and call "getIncludedObject(...)".
 */