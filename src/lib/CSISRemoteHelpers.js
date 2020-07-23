import log from 'loglevel';
import axios from 'axios';

export const csisClient = axios.create({ withCredentials: true });
csisClient.defaults.headers.common['Accept'] = 'application/vnd.api+json';
csisClient.defaults.headers.common['Content-Type'] = 'application/vnd.api+json';

/**
 * Get the X-CSRF Token from the CSIS API. Usually needed only for PUT, POST and PATCH requests.
 * 
 * @param {String} csisBaseUrl 
 * @return {Promise<Object>}
 */
export const getXCsrfToken = async function (csisBaseUrl = 'https://csis.myclimateservice.eu') {
  const apiResponse = await csisClient.get(csisBaseUrl + "/rest/session/token");
  // introduce ugly side effect:
  csisClient.defaults.headers.post['X-CSRF-Token'] = apiResponse.data;
  return apiResponse.data;
}

/**
 * Login to CSIS.
 * 
 * @param {String} csisBaseUrl 
 * @param {String} username 
 * @param {String} password 
 * @return {Promise<Object>}
 */
export const login = async function (csisBaseUrl = 'https://csis.myclimateservice.eu', username, password) {
  const apiResponse = await csisClient.post(csisBaseUrl + "/user/login/?_format=json",
    JSON.stringify({
      'name': username,
      'pass': password
    })
  );

  return apiResponse;
}

/**
* Gets EMIKAT Credentials from Drupal JSON API and return a headers object
* ready to be used with axios.
*
* @param {String} csisBaseUrl
* @return {Promise<Object>}
*/
export const getEmikatCredentialsFromCsis = async function (csisBaseUrl = 'https://csis.myclimateservice.eu') {
  let apiResponse = undefined;
  try {
    apiResponse = await csisClient.get(csisBaseUrl + '/jsonapi', { withCredentials: true });
    const userResponse = await csisClient.get(apiResponse.data.meta.links.me.href, { withCredentials: true });

    if (userResponse.data.data.attributes.field_basic_auth_credentials) {
      // const header = {'Authorization' : 'Basic ' + btoa(userResponse.data.data.attributes.field_basic_auth_credentials)};
      // return header;
      return 'Basic ' + btoa(userResponse.data.data.attributes.field_basic_auth_credentials);
    } else {
      log.error('no field field_basic_auth_credentials in user profile ' + userResponse.data.data.attributes.name);
      return null;
    }
  }
  catch (error) {
    console.error(`could not fetch emikat credentials from $csisBaseUrl`, error);
    if(apiResponse) {
      log.debug(apiResponse);
    }
    // return null;
    throw error;
  }
}

/**
* Gets the Study Node from Drupal JSON AP
*
* @param {String} csisBaseUrl
* @param {String} studyUuid
* @param {String} include
* @return {Promise<Object>}
*/
export const getStudyGroupNodeFromCsis = async function (
  csisBaseUrl = 'https://csis.myclimateservice.eu',
  studyUuid,
  include = 'field_data_package,field_data_package.field_resources,field_data_package.field_resources.field_resource_tags,field_data_package.field_resources.field_references,field_data_package.field_resources.field_resource_tags.field_var_meaning2',
) {

  const requestUrl = csisBaseUrl + '/jsonapi/group/study/' + studyUuid + '?include=' + include;

  try {
    log.debug('fetching study from CSIS API: ' + requestUrl);

    const apiResponse = await csisClient.get(requestUrl, { withCredentials: true });
    return apiResponse.data;
  }
  catch (error) {
    console.error(`could not fetch study from ${requestUrl}`, error);
    throw error;
  }
}

/**
* Gets the Study Node from Drupal JSON API
*
* @param {String} csisBaseUrl
* @param {String} datapackageUuid
* @param {String} include
* @return {Promise<Object>}
*/
export const getDatapackageFromCsis = async function (
  csisBaseUrl = 'https://csis.myclimateservice.eu',
  datapackageUuid,
  include = 'field_resources,field_resources.field_resource_tags,field_resources.field_references,field_resources.field_resource_tags.field_var_meaning2',
) {

  const requestUrl = csisBaseUrl + '/jsonapi/node/data_package/' + datapackageUuid + '?include=' + include;

  try {
    log.debug('fetching datapackage from CSIS API:' + requestUrl);

    const apiResponse = await csisClient.get(requestUrl, { withCredentials: true });
    return apiResponse.data;
  }
  catch (error) {
    console.error(`could not fetch datapackage from ${requestUrl}`, error);
    throw error;
  }
}

/**
* Gets Datapackage Resources array from Drupal JSON API
*
* @param {String} csisBaseUrl
* @param {String} datapackageUuid
* @param {String} include
* @return {Promise<Object>}
*/
export const getDatapackageResourcesFromCsis = async function (
  csisBaseUrl = 'https://csis.myclimateservice.eu',
  datapackageUuid,
  include = 'field_resource_tags,field_references,field_resource_tags.field_var_meaning2'
) {
  const requestUrl = csisBaseUrl + '/jsonapi/node/data_package/' + datapackageUuid + '/field_resources?include=' + include;

  try {
    log.debug('fetching datapackage resources from CSIS API:' + requestUrl);

    const apiResponse = await csisClient.get(requestUrl, { withCredentials: true });
    return apiResponse.data;
  }
  catch (error) {
    console.error(`could not fetch datapackage resources from ${requestUrl}`, error);
    throw error;
  }
}

/**
* Gets a single Resource from Drupal JSON API
* https://csis.myclimateservice.eu/jsonapi/node/data_package_metadata/b834a248-1817-44ce-9cb3-f882198c1e1f?include=field_resource_tags,field_references
*
* @param {String} csisBaseUrl
* @param {String} resourceUuid
* @param {String} include
* @return {Promise<Object>}
*/
export const getDatapackageResourceFromCsis = async function (
  csisBaseUrl = 'https://csis.myclimateservice.eu',
  resourceUuid,
  include = 'field_resource_tags,field_references,field_resource_tags.field_var_meaning2'
) {

  // data_package_metadata WTF? yaeh, that's the name of the resource type :-(
  const requestUrl = csisBaseUrl + '/jsonapi/node/data_package_metadata/' + resourceUuid + '?include=' + include;

  try {
    log.debug('fetching datapackage resources from CSIS API:' + requestUrl);

    const apiResponse = await csisClient.get(requestUrl, { withCredentials: true });
    return apiResponse.data;
  }
  catch (error) {
    console.error(`could not fetch datapackage resources from ${requestUrl}`, error);
    throw error;
  }
}