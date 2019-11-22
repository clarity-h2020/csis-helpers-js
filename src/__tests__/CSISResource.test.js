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

test('[DEV] test CSISResource getParametersMaps', () => {
	expect(templateResource.data).not.toBeNull();
	expect(templateResource.included).not.toBeNull();
	const csisResource = new CSISResource(templateResource.data, templateResource.included);
	const parametersMaps = csisResource.getParametersMaps();
	expect(parametersMaps.length).toEqual(410);
});

test('[PROD] test CSISResource getParametersMaps', () => {
	expect(templateResource.data).not.toBeNull();
	expect(templateResource.included).not.toBeNull();
	const csisResource = new _CSISResource(templateResource.data, templateResource.included);
	const parametersMaps = csisResource.getParametersMaps();
	expect(parametersMaps.length).toEqual(410);
});
