import axios from 'axios';
import log from 'loglevel';
import CSISHelpers from './../lib/CSISHelpers.js';
import { CSISHelpers as _CSISHelpers } from './../../dist/index.js';
import express from 'express';
import apiResponseStudy from './../__fixtures__/study.json';
import apiResponseDataPackage from './../__fixtures__/dataPackage.json';
import apiResponseResources from './../__fixtures__/resources.json';
import studyArea from './../__fixtures__/studyArea.json';

const app = express();
var server;

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
    const filteredResources = _CSISHelpers.filterResourcesbyTagName(resourcesArray
        , includedArray, tagType, tagName);
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
	const filteredResources = CSISHelpers.filterResourcesbyReferenceType(resourcesArray, includedArray, referenceType);
	expect(filteredResources.length).toBeLessThan(resourcesArray.length);
	expect(filteredResources).toHaveLength(102);
});

test('[RELEASE] find resources with @mapview:ogc:wms references in resource array', () => {
	const referenceType = '@mapview:ogc:wms';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	const filteredResources = _CSISHelpers.filterResourcesbyReferenceType(resourcesArray, includedArray, referenceType);
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
		log.debug(`found distinct tag $tag.attributes.name in $resourcesArray.length`);
	});
});

/**
 * FIXME: instead of duplicating DEV/RELEASE tests, parametrize the test methods!
 */
test('[RELEASE] find resources with @mapview:ogc:wms references in resource array', () => {
	const referenceType = '@mapview:ogc:wms';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;
	const filteredResources = _CSISHelpers.filterResourcesbyReferenceType(resourcesArray, includedArray, referenceType);
	expect(filteredResources.length).toBeLessThan(resourcesArray.length);
	expect(filteredResources).toHaveLength(102);
});

test('find HC resources with @mapview:ogc:wms references in resource array', () => {
	const tagType = 'taxonomy_term--eu_gl';
	const tagName = 'Hazard Characterization';
	const referenceType = '@mapview:ogc:wms';
	const resourcesArray = apiResponseResources.data;
	const includedArray = apiResponseResources.included;

	const filteredResources = CSISHelpers.filterResourcesbyReferenceType(
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

	const filteredResources = CSISHelpers.filterResourcesbyReferenceType(
		CSISHelpers.filterResourcesbyTagName(resourcesArray, includedArray, tagType, tagName),
		includedArray,
		referenceType
	);
	expect(filteredResources).not.toBeNull();
	expect(filteredResources.length).toBeGreaterThan(0);
	const reference = CSISHelpers.extractReferencesfromResource(filteredResources[0], includedArray, referenceType);
	expect(reference).not.toBeNull();
	expect(reference.length).toBeGreaterThan(0);

	//expect(filteredResources).toHaveLength(30);
});

test('check for emikat id in study', () => {
	const emikatId = CSISHelpers.extractEmikatIdFromStudyGroupNode(apiResponseStudy.data);
	expect(emikatId).toEqual(2846);
});

afterAll(() => {
	log.debug('afterAll');
	server.close(() => {
		//console.log('JSON Server closed');
		//process.exit(0);
	});
});
