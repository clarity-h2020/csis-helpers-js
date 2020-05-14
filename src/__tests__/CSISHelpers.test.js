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
import log from 'loglevel';

// Using ie9 polyfills as the "kitchen sink" of polyfills
// https://github.com/clarity-h2020/csis-helpers-js/issues/12
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

// DON't use this. It imports just the default export which is the CSISHelpers class.
// import CSISHelpers from './../lib/CSISHelpers.js';
import * as CSISHelpers from './../lib/CSISHelpers.js';
import * as EMIKATHelpers from './../lib/EMIKATHelpers.js';
import { CSISHelpers as _CSISHelpers } from './../../dist/index.js';
import express from 'express';
import apiResponseStudy from './../__fixtures__/study.json';
import apiResponseDataPackage from './../__fixtures__/dataPackage.json';
import apiResponseResources from './../__fixtures__/resources.json';
import studyArea from './../__fixtures__/studyArea.json';
import resourceWithVariableMeanings from './../__fixtures__/resourceWithVariableMeanings.json';

const app = express();
var server;

/**
 * 
 * 
 */

beforeAll(() => {
	// https://csis.myclimateservice.eu/jsonapi/group/study/c3609e3e-f80f-482b-9e9f-3a26226a6859
	app.get('/jsonapi/group/study/c3609e3e-f80f-482b-9e9f-3a26226a6859', function(req, res) {
		res.json(apiResponseStudy);
	});

	// https://csis.myclimateservice.eu/jsonapi/node/data_package/a8ff7930-4a9f-4289-8246-3383ba13c30f
	app.get('/jsonapi/node/data_package/a8ff7930-4a9f-4289-8246-3383ba13c30f', function(req, res) {
		res.json(apiResponseDataPackage);
	});

	// https://csis.myclimateservice.eu/jsonapi/node/data_package/a8ff7930-4a9f-4289-8246-3383ba13c30f/field_resources?include=field_resource_tags,field_map_view,field_references,field_analysis_context.field_field_eu_gl_methodology,field_analysis_context.field_hazard
	app.get('/jsonapi/node/data_package/a8ff7930-4a9f-4289-8246-3383ba13c30f/field_resources', function(req, res) {
		res.json(apiResponseResources);
	});

	server = app.listen(31336, () => log.debug('Example app listening on port 31336!'));
});

test('[DEV] test extract study area from study json', async (done) => {
	expect.assertions(5);
	const response = await axios.get('http://localhost:31336/jsonapi/group/study/c3609e3e-f80f-482b-9e9f-3a26226a6859');
	expect(response).toBeDefined();
	expect(response.data).toBeDefined();
	expect(response.data.data).toBeDefined();
	expect(response.data.data).not.toBeNull();

	const studyAreaJson = CSISHelpers.extractStudyAreaFromStudyGroupNode(response.data.data);
	expect(studyAreaJson).toEqual(studyArea);
	done();
});

test('[RELEASE] test extract study area from study json', async (done) => {
	expect.assertions(5);
	const response = await axios.get('http://localhost:31336/jsonapi/group/study/c3609e3e-f80f-482b-9e9f-3a26226a6859');
	expect(response).toBeDefined();
	expect(response.data).toBeDefined();
	expect(response.data.data).toBeDefined();
	expect(response.data.data).not.toBeNull();

	const studyAreaJson = _CSISHelpers.extractStudyAreaFromStudyGroupNode(response.data.data);
	expect(studyAreaJson).toEqual(studyArea);
	done();
});

test('[DEV] find HC LE resources in resource array', () => {
	const tagType = 'taxonomy_term--eu_gl';
	const tagName = 'Hazard Characterization - Local Effects';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	const filteredResources = CSISHelpers.filterResourcesbyTagName(resourcesArray, includedArray, tagType, tagName);
	expect(filteredResources).toHaveLength(17);
});

test('[RELEASE] find HC LE resources in resource array', () => {
	const tagType = 'taxonomy_term--eu_gl';
	const tagName = 'Hazard Characterization - Local Effects';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	const filteredResources = _CSISHelpers.filterResourcesbyTagName(resourcesArray, includedArray, tagType, tagName);
	expect(filteredResources).toHaveLength(17);
});

test('[DEV] find HC resources in resource array', () => {
	const tagType = 'taxonomy_term--eu_gl';
	const tagName = 'Hazard Characterization';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	const filteredResources = CSISHelpers.filterResourcesbyTagName(resourcesArray, includedArray, tagType, tagName);
	expect(filteredResources).toHaveLength(85);
});

test('[RELEASE] find HC resources in resource array', () => {
	const tagType = 'taxonomy_term--eu_gl';
	const tagName = 'Hazard Characterization';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	const filteredResources = _CSISHelpers.filterResourcesbyTagName(resourcesArray, includedArray, tagType, tagName);
	expect(filteredResources).toHaveLength(85);
});

test('[DEV] find resources with @mapview:ogc:wms references in resource array', () => {
	const referenceType = '@mapview:ogc:wms';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	const filteredResources = CSISHelpers.filterResourcesByReferenceType(resourcesArray, includedArray, referenceType);
	expect(filteredResources.length).toBeLessThan(resourcesArray.length);
	expect(filteredResources).toHaveLength(102);
});

test('[RELEASE] find resources with @mapview:ogc:wms references in resource array', () => {
	const referenceType = '@mapview:ogc:wms';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	const filteredResources = _CSISHelpers.filterResourcesByReferenceType(resourcesArray, includedArray, referenceType);
	expect(filteredResources.length).toBeLessThan(resourcesArray.length);
	expect(filteredResources).toHaveLength(102);
});

test('get taxonomy_term--hazards tags from resources ', () => {
	const tagType = 'taxonomy_term--hazards';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	/**
     * @type{Set}
     */
	const distinctTags = new Set();

	expect(resourcesArray).not.toBeNull();
	expect(resourcesArray.length).toBeGreaterThan(0);
	resourcesArray.map((resource) => {
		const tags = CSISHelpers.extractTagsfromResource(resource, includedArray, tagType);
		if (tags) {
			tags.map((tag) => {
				distinctTags.add(tag);
			});
		}
	});

	expect(distinctTags.size).toBeGreaterThan(0);
	distinctTags.forEach((tag) => {
		log.debug(`found distinct tag ${tag.attributes.name} in ${resourcesArray.length}`);
	});
});

/**
 * FIXME: instead of duplicating DEV/RELEASE tests, parametrize the test methods!
 */
test('[RELEASE] find resources with @mapview:ogc:wms references in resource array', () => {
	const referenceType = '@mapview:ogc:wms';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	const filteredResources = _CSISHelpers.filterResourcesByReferenceType(resourcesArray, includedArray, referenceType);
	expect(filteredResources.length).toBeLessThan(resourcesArray.length);
	expect(filteredResources).toHaveLength(102);
});

test('find HC resources with @mapview:ogc:wms references in resource array', () => {
	const tagType = 'taxonomy_term--eu_gl';
	const tagName = 'Hazard Characterization';
	const referenceType = '@mapview:ogc:wms';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;

	const filteredResources = CSISHelpers.filterResourcesByReferenceType(
		CSISHelpers.filterResourcesbyTagName(resourcesArray, includedArray, tagType, tagName),
		includedArray,
		referenceType
	);
	expect(filteredResources.length).toBeLessThan(resourcesArray.length);
	//expect(filteredResources).toHaveLength(30);
});

test('get 1st "reference" for first HC resource with @mapview:ogc:wms references in resource array', () => {
	const tagType = 'taxonomy_term--eu_gl';
	const tagName = 'Hazard Characterization';
	const referenceType = '@mapview:ogc:wms';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;

	const filteredResources = CSISHelpers.filterResourcesByReferenceType(
		CSISHelpers.filterResourcesbyTagName(resourcesArray, includedArray, tagType, tagName),
		includedArray,
		referenceType
	);
	expect(filteredResources).not.toBeNull();
	expect(filteredResources.length).toBeGreaterThan(0);
	const reference = CSISHelpers.extractReferencesFromResource(filteredResources[0], includedArray, referenceType);
	expect(reference).not.toBeNull();
	expect(reference.length).toBeGreaterThan(0);

	//expect(filteredResources).toHaveLength(30);
});

test('check for emikat id in study', () => {
	const emikatId = CSISHelpers.extractEmikatIdFromStudyGroupNode(apiResponseStudy.data);
	expect(emikatId).toEqual(2846);
});

test('[DEV] WMS URL with mapped PARAMETERS', () => {
	/**
	 * @type {String}
	 */
	const urlTemplate =
		'https://clarity.meteogrid.com/geoserver/europe/wms?service=WMS&version=1.1.0&request=GetMap&layers=europe%3API_consecutive-wet-days_${emissions_scenario}_${time_period}_ensmean&srs=EPSG%3A3035&format=image%2Fpng%3B%20mode%3D8bit';

	/**
	 * @type {String}
	 */
	const url =
		'https://clarity.meteogrid.com/geoserver/europe/wms?service=WMS&version=1.1.0&request=GetMap&layers=europe%3API_consecutive-wet-days_historical_19710101-20001231_ensmean&srs=EPSG%3A3035&format=image%2Fpng%3B%20mode%3D8bit';

	/**
	 * Another JS Madness. Associative array are no arrays. Don't use them at all!
	 * See https://www.xul.fr/javascript/associative.php
	 */
	/*const queryParameters = [
		[ 'time_period', 'Baseline' ],
		[ EMIKATHelpers.QUERY_PARAMS.get(CSISHelpers.EMISSIONS_SCENARIO), 'Baseline' ]
	];*/

	const queryParameters = {
		host: 'https://csis.myclimateservice.eu',
		study_uuid: '3c480040-42c5-4bef-a0ff-df05b7ea7329',
		step_uuid: undefined,
		datapackage_uuid: '14c81c77-a6f2-4419-b916-aad431f6accd',
		resource_uuid: undefined,
		study_area: undefined,
		grouping_tag: undefined,
		write_permissions: undefined,
		minx: 72,
		miny: 55,
		maxx: 30,
		maxy: -30,
		emikat_id: undefined,
		data_format: 'data',
		study_variant: 'BASELINE',
		time_period: 'Baseline',
		emissions_scenario: 'Baseline',
		event_frequency: 'Rare',
		url: 'https://csis.myclimateservice.eu'
	};

	/**
	 * @type{Map}
	 */
	const parametersMap = CSISHelpers.generateParametersMap(
		CSISHelpers.QUERY_PARAMS,
		queryParameters,
		resourceWithVariableMeanings.data,
		resourceWithVariableMeanings.included
	);

	expect(parametersMap.size).toEqual(5);

	/**
	 * @type{String[]}
	 */
	const transformedUrl = CSISHelpers.addTemplateParameters(urlTemplate, parametersMap);

	expect(transformedUrl.includes('$')).toBeFalsy;
	expect(transformedUrl.includes('historical')).toBeTruthy;
	expect(transformedUrl.includes('19710101-20001231')).toBeTruthy;
	expect(transformedUrl).not.toEqual(urlTemplate);
	expect(url).toEqual(transformedUrl);
});

test('[PROD] WMS URL with mapped PARAMETERS', () => {
	/**
	 * @type {String}
	 */
	const urlTemplate = `https://clarity.meteogrid.com/geoserver/europe/wms?service=WMS&version=1.1.0&request=GetMap&layers=europe%3API_consecutive-wet-days_${CSISHelpers.EMISSIONS_SCENARIO}_${CSISHelpers.TIME_PERIOD}_ensmean&bbox=2145642.726143716%2C982955.8095900388%2C6605432.868301096%2C5706496.981659953&width=725&height=768&srs=EPSG%3A3035&format=image%2Fpng%3B%20mode%3D8bit`;

	/**
	 * @type {String}
	 */
	const url =
		'https://clarity.meteogrid.com/geoserver/europe/wms?service=WMS&version=1.1.0&request=GetMap&layers=europe%3API_consecutive-wet-days_historical_19710101-20001231_ensmean&bbox=2145642.726143716%2C982955.8095900388%2C6605432.868301096%2C5706496.981659953&width=725&height=768&srs=EPSG%3A3035&format=image%2Fpng%3B%20mode%3D8bit';

	const queryParameters = {
		host: 'https://csis.myclimateservice.eu',
		study_uuid: '3c480040-42c5-4bef-a0ff-df05b7ea7329',
		step_uuid: undefined,
		datapackage_uuid: '14c81c77-a6f2-4419-b916-aad431f6accd',
		resource_uuid: undefined,
		study_area: undefined,
		grouping_tag: undefined,
		write_permissions: undefined,
		minx: 72,
		miny: 55,
		maxx: 30,
		maxy: -30,
		emikat_id: undefined,
		data_format: 'data',
		study_variant: 'BASELINE',
		time_period: 'Baseline',
		emissions_scenario: 'Baseline',
		event_frequency: 'Rare',
		url: 'https://csis.myclimateservice.eu'
	};

	const parametersMap = _CSISHelpers.generateParametersMap(
		_CSISHelpers.QUERY_PARAMS,
		queryParameters,
		resourceWithVariableMeanings.data,
		resourceWithVariableMeanings.included
	);

	expect(parametersMap.size).toEqual(5);

	const transformedUrl = _CSISHelpers.addTemplateParameters(urlTemplate, parametersMap);

	expect(transformedUrl.includes('$')).toBeFalsy;
	expect(transformedUrl.includes('historical')).toBeTruthy;
	expect(transformedUrl.includes('19710101-20001231')).toBeTruthy;
	expect(transformedUrl).not.toEqual(urlTemplate);
	expect(url).toEqual(transformedUrl);
});

afterAll(() => {
	log.debug('afterAll');
	server.close(() => {
		//console.log('JSON Server closed');
		//process.exit(0);
	});
});
