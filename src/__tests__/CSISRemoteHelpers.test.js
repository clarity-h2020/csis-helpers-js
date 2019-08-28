import axios from 'axios';
import log from 'loglevel';

import * as CSISRemoteHelpers from './../lib/CSISRemoteHelpers.js';
import * as CSISHelpers from './../lib/CSISHelpers.js';

import {CSISRemoteHelpers as _CSISRemoteHelpers, CSISHelpers as _CSISHelpers} from './../../dist/index.js';

import apiResponseStudy from './../__fixtures__/study.json';

/**
 * @type {Object[]}
 */
var headers = undefined;
try {
    import('./../__fixtures__/csisHeaders.js').then(
        (module) => { headers = module.default; log.info('headers.js fixture found, executing remote API tests'); },
        (error) => { log.info('csisHeaders.js is not present, skipping remote API tests'); }
    );
} catch (error) {
    //ignore
}

let debugLogInterceptor;

/**
 * Set auth headers for live API test
 */
beforeAll(async (done) => {

    if (!headers) {
        try {
            const module = await import('./../__fixtures__/csisHeaders.js');
            headers = module.default;
            log.info('headers.js fixture found, executing remote API tests');
        } catch (error) {
            log.info('csisHeaders.js is not present, skipping remote API tests');
        }
    }

    //axios.defaults.withCredentials = true;
    if (headers && Array.isArray(headers)) {
        log.info('headers.js fixture found, executing remote API tests');
        headers.forEach((header) => {
            // this will fail when a new instance of axios has been created in CSISRemoteHelpers
            // because the instance is created with the *previous* defaults! :o
            //axios.defaults.headers.common[header[0]] = header[1];

            // therefore we change the instance in CSISRemoteHelpers :o
            CSISRemoteHelpers.csisClient.defaults.headers.common[header[0]] = header[1];
        });
    } else {
        log.warn('no headers.js fixture found, skipping remote API tests');
    }
    debugLogInterceptor = CSISRemoteHelpers.csisClient.interceptors.request.use((request) => {
        //log.debug(JSON.stringify(request));
        return request;
    });
    done();
});

beforeEach(async (done) => {
    // after 1st login / set cookie, the token is fixed, otherwise different for each call
    const xCsrfToken = await CSISRemoteHelpers.getXCsrfToken();
    CSISRemoteHelpers.csisClient.defaults.headers.common[axios.defaults.xsrfHeaderName] = xCsrfToken;
    done();
});

afterAll(() => {
    //delete axios.defaults.withCredentials;
    delete CSISRemoteHelpers.csisClient.defaults.headers.common[axios.defaults.xsrfHeaderName];
    if (headers) {
        delete CSISRemoteHelpers.csisClient.defaults.headers.common[headers[0]];
    }
    CSISRemoteHelpers.csisClient.interceptors.request.eject(debugLogInterceptor);
});

test('get and compare X-CSRF Token', async (done) => {
    expect.assertions(1);
    const token1 = await CSISRemoteHelpers.getXCsrfToken();
    const token2 = await CSISRemoteHelpers.getXCsrfToken();
    // if not logged in by session cookie, token will be different for each request
    if (!headers) {
        expect(token1).not.toEqual(token2);
    } else {
        expect(token1).toEqual(token2);
    }

    done();
});

describe('Remote API tests with authentication', () => {

    setTimeout(function(){
        //do what you need here
    }, 2000);

    // skip tests if local headers file containing session cookie is not available
    if (!headers) {
        it.only('no headers.js fixture found, skipping remote API tests', () => {
            log.warn('no headers.js fixture found, skipping remote API tests');
        });
    }

    it('test get EMIKAT Credentials', async (done) => {
        const emikatCredentials = await CSISRemoteHelpers.getEmikatCredentialsFromCsis();
        expect.assertions(2);
        expect(emikatCredentials).toBeDefined();
        expect(emikatCredentials).not.toBeNull();
        done();
    });

    it('[DEV] test get complete Study', async (done) => {
        const studyGroupNode = await CSISRemoteHelpers.getStudyGroupNodeFromCsis(undefined, 'c3609e3e-f80f-482b-9e9f-3a26226a6859');
        expect.assertions(6);
        expect(studyGroupNode).toBeDefined();
        expect(studyGroupNode).not.toBeNull();
        expect(apiResponseStudy).toBeDefined();
        expect(apiResponseStudy).not.toBeNull();
        expect(apiResponseStudy.data).not.toBeNull();
        expect(apiResponseStudy.data.id).toEqual(studyGroupNode.data.id);
        done();
    });

    it('[PROD] test get complete Study', async (done) => {
        const studyGroupNode = await _CSISRemoteHelpers.getStudyGroupNodeFromCsis(undefined, 'c3609e3e-f80f-482b-9e9f-3a26226a6859');
        expect.assertions(6);
        expect(studyGroupNode).toBeDefined();
        expect(studyGroupNode).not.toBeNull();
        expect(apiResponseStudy).toBeDefined();
        expect(apiResponseStudy).not.toBeNull();
        expect(apiResponseStudy.data).not.toBeNull();
        expect(apiResponseStudy.data.id).toEqual(studyGroupNode.data.id);
        done();
    });

    it('[DEV] test get datapackage resources for eu-gl:hazard-characterization', async (done) => {
        const resourcesApiResponse = await CSISRemoteHelpers.getDatapackageResourcesFromCsis(undefined, "a8ff7930-4a9f-4289-8246-3383ba13c30f");
        
        expect.assertions(6);
        
        expect(resourcesApiResponse).toBeDefined();
        expect(resourcesApiResponse).not.toBeNull();
        expect(resourcesApiResponse.data).not.toBeNull();
        expect(resourcesApiResponse.included).not.toBeNull();
        
        const filteredResources = CSISHelpers.filterResourcesByEuglId(
            resourcesApiResponse.data, 
            resourcesApiResponse.included,  
            'eu-gl:hazard-characterization');

        log.info(`filteredResources: ${filteredResources.length}`);

        expect(filteredResources).not.toBeNull();
        expect(filteredResources.length).toBeGreaterThan(0);

        done();
    });
});
