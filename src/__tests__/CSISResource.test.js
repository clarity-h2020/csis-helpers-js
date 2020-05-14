/* 
 * ***************************************************
 * 
 * cismet GmbH, Saarbruecken, Germany
 * 
 *               ... and it just works.
 * 
 * ***************************************************
 */

 // Using ie9 polyfills as the "kitchen sink" of polyfills
// https://github.com/clarity-h2020/csis-helpers-js/issues/12
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import CSISResource from './../classes/CSISResource';
import { CSISResource as _CSISResource } from './../../dist/index.js';

import apiResponseResources from './../__fixtures__/resources.json';
import templateResource from './../__fixtures__/templateResource';
import log from 'loglevel';

test('[DEV] test CSISResource getServiceType', () => {
	expect(apiResponseResources.data).not.toBeNull();
	expect(apiResponseResources.included).not.toBeNull();
	const csisResource = new CSISResource(apiResponseResources.data[0], apiResponseResources.included);
	const serviceType = csisResource.getServiceType();
	expect(serviceType).not.toBeNull();
	expect(serviceType.attributes.name).toEqual('ogc:wcs');
});

test('[PROD] test CSISResource getServiceType', () => {
	expect(apiResponseResources.data).not.toBeNull();
	expect(apiResponseResources.included).not.toBeNull();
	const csisResource = new _CSISResource(apiResponseResources.data[0], apiResponseResources.included);
	const serviceType = csisResource.getServiceType();
	expect(serviceType).not.toBeNull();
	expect(serviceType.attributes.name).toEqual('ogc:wcs');
});

test.skip('[DEV] test CSISResource getParametersMaps', () => {
	expect(templateResource.data).not.toBeNull();
	expect(templateResource.included).not.toBeNull();
	const csisResource = new CSISResource(templateResource.data, templateResource.included);
	const parametersMaps = csisResource.getParametersMaps();
	expect(parametersMaps.length).toEqual(411);
});

test.skip('[PROD] test CSISResource getParametersMaps', () => {
	expect(templateResource.data).not.toBeNull();
	expect(templateResource.included).not.toBeNull();
	const csisResource = new _CSISResource(templateResource.data, templateResource.included);
	const parametersMaps = csisResource.getParametersMaps();
	expect(parametersMaps.length).toEqual(411);
});

