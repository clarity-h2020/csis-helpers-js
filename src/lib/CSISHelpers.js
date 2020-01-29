/* 
 * ***************************************************
 * 
 * cismet GmbH, Saarbruecken, Germany
 * 
 *               ... and it just works.
 * 
 * ***************************************************
 */

import Wkt from 'wicket';
import log from 'loglevel';

import * as EMIKATHelpers from './EMIKATHelpers.js';

/**
 * Be aware of the difference between default and named exports. It is a common source of mistakes.
 * We suggest that you stick to using default imports and exports when a module only exports a single thing (for example, a component). 
 * That’s what you get when you use export default Button and import Button from './Button'.
 * Named exports are useful for utility modules that export several functions. A module may have at most one default export and as many named exports as you like.
 * 
 * See https://stackoverflow.com/questions/36795819/when-should-i-use-curly-braces-for-es6-import/36796281#36796281
 */

/**
 * Helpers for CSIS API
 * 
 * @author Pascal Dihé
 */
export default class CSISHelpers {
	/**
   * Common Constants for *Template Resources*
   */

	/**
   * The WMS getMap request layers attribute 
   */
	static LAYERS = '${layers}';

	/**
   * Query params extracted from CSIS Helpers. See /examples and /fixtures/csisHelpers.json
   */
	static defaultQueryParams = {
		host: 'https://csis.myclimateservice.eu',
		study_uuid: undefined,
		step_uuid: undefined,
		datapackage_uuid: undefined,
		resource_uuid: undefined,
		study_area: undefined,
		grouping_tag: undefined,
		write_permissions: undefined,
		minx: 72, // deprecated
		miny: 55, // deprecated
		maxx: 30, // deprecated
		maxy: -30, // deprecated
		emikat_id: undefined, // this is the emikat study id
		data_format: EMIKATHelpers.DATA_FORMAT_VALUES[0],
		study_variant: EMIKATHelpers.STUDY_VARIANT_VALUES[0],
		time_period: EMIKATHelpers.TIME_PERIOD_VALUES[0],
		emissions_scenario: EMIKATHelpers.EMISSIONS_SCENARIO_VALUES[0],
		event_frequency: EMIKATHelpers.EVENT_FREQUENCY_VALUES[0]
	};

	/**
    * Drupal JSON API 'deeply' includes objects, e.g. &include=field_references are provided only once in a separate array name 'included'.
    * This method resolves the references and extracts the included  object.
    * 
    * @param {string} type 
    * @param {number} id 
    * @param {Object[]} includedArray 
    * @see https://www.drupal.org/docs/8/modules/jsonapi/includes
   */
	static getIncludedObject(type, id, includedArray) {
		if (type != null && id != null) {
			for (let i = 0; i < includedArray.length; ++i) {
				if (includedArray[i].type === type && includedArray[i].id === id) {
					return includedArray[i];
				}
			}
		}

		return null;
	}

	/**
   * Retrieves the EMIKAT Study / Scenario ID from the Drupal Study
   * 
   * @param {Object} studyGroupNode
   * @return {Number}
   */
	static extractEmikatIdFromStudyGroupNode(studyGroupNode) {
		let emikatId = -1;
		if (
			studyGroupNode.attributes.field_emikat_id !== undefined &&
			studyGroupNode.attributes.field_emikat_id != null &&
			!isNaN(studyGroupNode.attributes.field_emikat_id)
		) {
			emikatId = parseInt(studyGroupNode.attributes.field_emikat_id, 10);
		} else {
			log.warn('no emikat id in study ' + studyGroupNode.attributes.field_emikat_id);
		}

		return emikatId;
	}

	/**
   * Returns the JSON representation of the study area.
   * 
   * @param {Object} studyGroupNode 
   * @returns {JSON}
   */
	static extractStudyAreaFromStudyGroupNode(studyGroupNode) {
		/**
     * @type {Wkt}
     */
		let studyArea = new Wkt.Wkt();

		if (
			studyGroupNode &&
			studyGroupNode.attributes &&
			studyGroupNode.attributes.field_area != null &&
			studyGroupNode.attributes.field_area.value != null
		) {
			studyArea.read(studyGroupNode.attributes.field_area.value);
		} else {
			log.warn('no study area in study ' + studyGroupNode);
		}

		const studyAreaJson = studyArea.toJson();
		return studyAreaJson;
	}

	/**
   * Filters resource array by tag name which are included in the tags array (due to Drupal API quirks).
   * 
   * @param {Object[]} resourceArray the original resource array
   * @param {Object[]} tagsArray included objects - Drupal APi style! :-/
   * @param {string} tagType The tag type, e.g. 'taxonomy_term--eu_gl'
   * @param {string} tagName The name of the tag, e.g.'Hazard Characterization - Local Effects'
   * @return {Object[]}
   * @see getIncludedObject()
   */
	static filterResourcesbyTagName(resourceArray, tagsArray, tagType, tagName) {
		/**
     * If we request exactly **one** resource, there would be a possibility for simplification that applies to all taxonomy terms and tags: 
     * Instead of looking at `resource.relationships.field_resource_tags.data` we just have to search in `tagsArray` (included objects, respectively).
     */
		let filteredResourceArray = resourceArray.filter((resource) => {
			if (
				resource.relationships.field_resource_tags != null &&
				resource.relationships.field_resource_tags.data != null &&
				resource.relationships.field_resource_tags.data.length > 0
			) {
				return resource.relationships.field_resource_tags.data.some((tagReference) => {
					return tagReference.type === tagType
						? tagsArray.some((tagObject) => {
								return (
									tagReference.type === tagObject.type &&
									tagReference.id === tagObject.id &&
									tagObject.attributes.name === tagName
								);
							})
						: false;
				});
			} else {
				log.warn('no tags found  in resource ' + resource.id);
			}
			return false;
		});

		log.debug(
			filteredResourceArray.length +
				' resources left after filtering ' +
				resourceArray.length +
				' resources by tag type ' +
				tagType +
				' and tag name ' +
				tagName
		);

		return filteredResourceArray;
	}

	/**
 * Filters resource array by tag id which are included in the tags array (due to Drupal API quirks).
 * 
 * @param {Object[]} resourceArray the original resource array
 * @param {Object[]} tagsArray included objects - Drupal APi style! :-/
 * @param {string} id The id of the UU-GL Taxonomy tag, e.g.'eu-gl:hazard-characterization:local-effects'
 * @return {Object[]}
 * @see getIncludedObject()
 */
	static filterResourcesByEuglId(resourceArray, tagsArray, id) {
		/**
     * If we request exactly **one** resource, there would be a possibility for simplification that applies to all taxonomy terms and tags: 
     * Instead of looking at `resource.relationships.field_resource_tags.data` we just have to search in `tagsArray` (included objects, respectively).
     */
		const tagType = 'taxonomy_term--eu_gl';
		let filteredResourceArray = resourceArray.filter((resource) => {
			if (
				resource.relationships.field_resource_tags != null &&
				resource.relationships.field_resource_tags.data != null &&
				resource.relationships.field_resource_tags.data.length > 0
			) {
				return resource.relationships.field_resource_tags.data.some((tagReference) => {
					return tagReference.type === tagType
						? tagsArray.some((tagObject) => {
								return (
									tagReference.type === tagObject.type &&
									tagReference.id === tagObject.id &&
									tagObject.attributes.field_eu_gl_taxonomy_id &&
									tagObject.attributes.field_eu_gl_taxonomy_id.value &&
									tagObject.attributes.field_eu_gl_taxonomy_id.value === id
								);
							})
						: false;
				});
			} else {
				log.warn('no EU-GL tags found  in resource ' + resource.id);
			}

			return false;
		});

		log.debug(
			filteredResourceArray.length +
				' resources left after filtering ' +
				resourceArray.length +
				' resources by tag type ' +
				tagType +
				' and EU-GL id ' +
				id
		);

		return filteredResourceArray;
	}

	/**
     * Filters resource array by reference type which are included in the references array (due to Drupal API quirks).
     * 
     * @param {Object[]} resourceArray the original resource array
     * @param {Object[]} referencesArray included objects - Drupal APi style! :-/
     * @param {string} referenceType The reference type, e.g. '@mapview:ogc:wms'
     * @return {Object[]}
     * @see getIncludedObject()
     */
	static filterResourcesbyReferenceType(resourceArray, referencesArray, referenceType) {
		let filteredResourceArray = resourceArray.filter((resource) => {
			if (
				resource.relationships.field_references != null &&
				resource.relationships.field_references.data != null &&
				resource.relationships.field_references.data.length > 0
			) {
				return resource.relationships.field_references.data.some((referenceReference) => {
					return referencesArray.some((referenceObject) => {
						return (
							referenceReference.type === referenceObject.type &&
							referenceReference.id === referenceObject.id &&
							referenceObject.attributes.field_reference_type === referenceType
						);
					});
				});
			} else {
				log.warn(`no references found in resource '${resource.attributes.title}' (${resource.id})`);
			}

			return false;
		});
		// ES6 template string: https://eslint.org/docs/rules/no-template-curly-in-string
		log.debug(
			`${filteredResourceArray.length} resources left after filtering ${resourceArray.length} resources by reference type ${referenceType}`
		);

		return filteredResourceArray;
	}
	/**
      * Extracts references which are included in the references array (due to Drupal API quirks) from a resource
      * 
      * @param {Object} resource the original resource
      * @param {Object[]} referencesArray included objects - Drupal APi style! :-/
      * @param {string} referenceType The reference type, e.g. '@mapview:ogc:wms'
      * @return {Object[]}
      * @see getIncludedObject()
      */
	static extractReferencesfromResource(resource, referencesArray, referenceType) {
		let references = [];
		// the reference type is available only at the level of the `included` array
		if (
			resource.relationships.field_references != null &&
			resource.relationships.field_references.data != null &&
			resource.relationships.field_references.data.length > 0
		) {
			references = resource.relationships.field_references.data.flatMap((referenceReference) => {
				let filteredReferences = referencesArray.filter((referenceObject) => {
					return (
						referenceReference.type === referenceObject.type &&
						referenceReference.id === referenceObject.id &&
						referenceObject.attributes.field_reference_type === referenceType
					);
				});
				return filteredReferences;
			});
		}
		log.debug(`${references.length} references found in resouce for reference type ${referenceType}`);
		return references;
	}

	/**
      * Extracts tags which are included in the tags array (due to Drupal API quirks) from a resource
      * 
      * @param {Object} resource the original resource
      * @param {Object[]} tagsArray included objects - Drupal APi style! :-/
      * @param {string} tagType The tag type, e.g. '@mapview:ogc:wms'
      * @return {Object[]}
      * @see getIncludedObject()
      */
	static extractTagsfromResource(resource, tagsArray, tagType) {
		let tags = [];
		if (
			resource.relationships.field_resource_tags != null &&
			resource.relationships.field_resource_tags.data != null &&
			resource.relationships.field_resource_tags.data.length > 0
		) {
			tags = resource.relationships.field_resource_tags.data.flatMap((tagReference) => {
				return tagReference.type === tagType
					? tagsArray.filter(
							(tagObject) => tagReference.type === tagObject.type && tagReference.id === tagObject.id
						)
					: [];
			});
		}
		log.debug(`${tags.length} tags found in resource for tag type ${tagType}`);
		return tags;
	}

	/**
   * Extract the resource variable values for a specific variable from the resource tags array.
   * 
   * @param {Object} resource the original resource
   * @param {Object[]} tagsArray included objects - Drupal APi style! :-/ 
   * @param {*} variableName The variable we are interested in e.g. 'layers'
   * @return {String[]}
   */
	static extractVariableValuesfromResource(resource, tagsArray, variableName) {
		let variableValues = [];
		let variableTags = extractTagsfromResource(resource, tagsArray, 'taxonomy_term--dp_variables');
		if (variableTags && variableTags.length > 0) {
			const iterator = variableTags.values();
			for (const variableTag of iterator) {
				if (
					variableTag.attributes &&
					variableTag.attributes.field_var_name &&
					variableTag.attributes.field_var_name.toLowerCase() == variableName.toLowerCase() &&
					variableTag.attributes.field_var_value
				) {
					variableValues.push(variableTag.attributes.field_var_value);
				}
			}
		} else {
			log.warn(`no tags of type 'taxonomy_term--dp_variables' in resource`);
		}

		return variableValues;
	}

	/**
   * This is a completely unnecessary method  that does nothing than adding unnecessary complexity to the system.
   * Since we did not mange to agree on a simple set of variable values that are used across different services,
   * we have to program around a problem that we invented by ourselves. Another sad example how avoidable accidental complexity
   * is introduced by incoherence and lack of harmonization. See https://github.com/clarity-h2020/csis/issues/101#issuecomment-565025875
   * 
   * @param {Object} resource the original resource
   * @param {Object[]} tagsArray included objects - Drupal APi style! :-/ 
   * @param {*} variableName The variable we are interested in e.g. 'layers'
   * @param {*} variableName Actually the value received via query params but unfortunately sometimes not the real value. Confusing.
   * @return {String[]}
   */
	static extractVariableValueForVariableMeaningFromResource(resource, tagsArray, variableName, variableMeaning) {
		// what a mess. if no 'meaning' is found, return the plain value received via query param.
		let variableValue = variableMeaning;
		let variableTags = extractTagsfromResource(resource, tagsArray, 'taxonomy_term--dp_variables');
		if (variableTags && variableTags.length > 0) {
			const iterator = variableTags.values();
			// yes, 'field_var_meaning2'. No refactoring in Drupal -> https://github.com/clarity-h2020/docker-drupal/issues/29
			// This JSON FORMAT is madness: NOT variableTag.attributes.field_var_meaning2 BUT variableTag.relationships.field_var_meaning2
			for (const variableTag of iterator) {
				if (
					variableTag.attributes &&
					variableTag.attributes.field_var_name &&
					variableTag.attributes.field_var_name.toLowerCase() == variableName.toLowerCase() &&
					variableTag.attributes.field_var_value
				) {
					if (
						variableTag.relationships.field_var_meaning2 &&
						getIncludedObject(
							variableTag.relationships.field_var_meaning2.data.type,
							variableTag.relationships.field_var_meaning2.data.id,
							tagsArray
						) &&
						getIncludedObject(
							variableTag.relationships.field_var_meaning2.data.type,
							variableTag.relationships.field_var_meaning2.data.id,
							tagsArray
						).attributes.field_var_meaning == variableMeaning
					) {
						log.debug(
							`variable name / query parameter '${variableName}' maps to meaning '${variableMeaning}' with value '${variableTag
								.attributes.field_var_value}' in resource '${resource.attributes.title}'.`
						);
						return variableTag.attributes.field_var_value;
					} else {
						/*log.debug(
							`variable name / query parameter '${variableName}' does not map to variable meaning '${variableMeaning}' (${getIncludedObject(
								variableTag.relationships.field_var_meaning2.data.type,
								variableTag.relationships.field_var_meaning2.data.id,
								tagsArray
							).attributes.field_var_meaning}) in resource ${resource.attributes.title}`
						);*/
					}
				} else {
					/*log.debug(
						`variable name / query parameter '${variableName}' does not map to variable tag '${variableTag
							.attributes.field_var_name}' in resource ${resource.attributes.title}`
					);*/
				}
			}
		} else {
			log.warn(`no tags of type 'taxonomy_term--dp_variables' in resource ${resource.attributes.title}`);
		}

		log.warn(
			`${variableName} does not map to meaning/value ${variableValue} in resource ${resource.attributes.title}`
		);

		return variableValue;
	}

	static extractVariableNamesfromResource(resource, tagsArray) {
		let variableNames = new Set();
		let variableTags = extractTagsfromResource(resource, tagsArray, 'taxonomy_term--dp_variables');
		if (variableTags && variableTags.length > 0) {
			const iterator = variableTags.values();
			for (const variableTag of iterator) {
				if (variableTag.attributes && variableTag.attributes.field_var_name) {
					variableNames.add(variableTag.attributes.field_var_name);
				}
			}
		} else {
			log.warn(`no tags of type 'taxonomy_term--dp_variables' in resource`);
		}

		return Array.from(variableNames);
	}

	/**
	 * Take a template resource and create parameters map for all possible variable combinations! OMG!
	 * 
	 * This "strongly demanded feature" has become unnecessary now. It didn't make much sense in the first place, tough.
	 * 
	 * @param {*} resource 
	 * @param {*} tagsArray 
	 * @return {Map[]}
	 * @deprecated  don't use this method!
	 */
	static parametersMapsFromTemplateResource(resource, tagsArray) {
		/**
		 * 
		 * @param {*} variableNames 
		 * @param {*} parametersMaps 
		 * @param {*} parametersMap 
		 */
		const expandVariables = function(variableNames, parametersMaps, parametersMap) {
			if (!variableNames || variableNames.length === 0) {
				return;
			}

			log.debug(`expanding resource ${resource.attributes.title} by ${variableNames.length} variables`);
			variableNames.forEach((variableName, variableNameIndex, array) => {
				const variableValues = CSISHelpers.extractVariableValuesfromResource(resource, tagsArray, variableName);
				if (variableValues && variableValues.length > 0) {
					variableValues.forEach((variableValue, variableValueIndex) => {
						if (variableValueIndex > 0) {
							// create new entry
							// Circumvent another incoherence in CSIS taxonomies: '${'+variableName+'}'
							parametersMaps.push(new Map(parametersMap).set('${' + variableName + '}', variableValue));
						} else {
							// see https://github.com/clarity-h2020/csis-helpers-js/issues/8#issuecomment-558593929
							parametersMap.set('${' + variableName + '}', variableValue);
						}

						// create a new Map Entry for each variableName=variableValue combination
						if (variableNameIndex < variableNames.length - 1) {
							expandVariables(array.slice(variableNameIndex + 1), parametersMaps, parametersMap);
						}
					});
				} else {
					log.warn(`no values for variable ${variableName} found in resource ${resource.attributes.title} `);
				}
			});
		};

		const parametersMaps = [];
		parametersMaps.push(new Map());
		expandVariables(
			CSISHelpers.extractVariableNamesfromResource(resource, tagsArray),
			parametersMaps,
			parametersMaps[0]
		);

		log.debug(
			`creating ${parametersMaps.length} virtual resources from template resource ${resource.attributes
				.title} (${resource.id})`
		);
		return parametersMaps;
	}

	/**
 * Replaces ${variables} in template url by actual values from the urlVariables map.
 * 
 * @param {String} urlTemplate 
 * @param {Map<String,any>} urlVariables 
 * @return {String}
 * 
 */
	static addUrlParameters(urlTemplate, urlVariables) {
		// same method different name.
		// of course we could try to call CSISHelpers.addUrlParameters from EMIKATHelpers.addEmikatParameters
		// however, this would result in a cyclic import.
		return EMIKATHelpers.addEmikatParameters(urlTemplate, urlVariables);
	}

	/**
	 * This generates a parameters map and this is where this unfortunate "variable meaning" stuff has to be sorted out.
	 * 
	 * @param {Map} queryParameterMap 
	 * @param {Object} queryParameters 
	 * @param {Object} resource 
	 * @param {Object} tagsArray 
	 * @return {Map}
	 */
	static generateParametersMap(queryParameterMap, queryParameters, resource, tagsArray) {
		log.info(
			`generating parameters map for ${queryParameterMap.size} = ${Object.keys(queryParameters)
				.length} parameters for ${resource.attributes.title}`
		);
		const parametersMap = new Map();
		// e.g. key = '${emikat_id}' and value = 'emikat_id';
		queryParameterMap.forEach((value, key) => {
			if (queryParameters[value]) {
				// what a mess! See https://github.com/clarity-h2020/csis/issues/101#issuecomment-565025875
				const mappedValue = CSISHelpers.extractVariableValueForVariableMeaningFromResource(
					resource,
					tagsArray,
					value,
					queryParameters[value]
				);
				if (mappedValue) {
					parametersMap.set(key, mappedValue);
				} else {
					parametersMap.set(key, queryParameters[value]);
				}
				//log.debug(`${key} = ${parametersMap.get(key)}`);
			} else {
				//log.debug(`no value for query parameter ${key} = ${value} found`);
			}
		});

		// Another JS Madness: Object.keys() !== objectInstance.keys()
		// -> Object.keys(queryParameters).length instead of queryParameters.keys().length
		log.info(
			`parameters map with ${parametersMap.size} entries for ${queryParameterMap.size} = ${Object.keys(
				queryParameters
			).length} parameters for ${resource.attributes.title} generated`
		);

		return parametersMap;
	}
}

/**
 * We can either use "import CSISHelpers from './CSISHelpers.js'" and call  "CSISHelpers.getIncludedObject(...)" or
 * "import {getIncludedObject} from './CSISHelpers.js'" and call "getIncludedObject(...)".
 * 
 * However, It is not recommended to mix default exports with “named” exports. 
 * See https://www.kaplankomputing.com/blog/tutorials/javascript/understanding-imports-exports-es6/
 */

export const parametersMapsFromTemplateResource = CSISHelpers.parametersMapsFromTemplateResource;
export const extractVariableNamesfromResource = CSISHelpers.extractVariableNamesfromResource;
export const extractVariableValuesfromResource = CSISHelpers.extractVariableValuesfromResource;
export const addUrlParameters = CSISHelpers.addUrlParameters;
export const extractEmikatIdFromStudyGroupNode = CSISHelpers.extractEmikatIdFromStudyGroupNode;
export const getIncludedObject = CSISHelpers.getIncludedObject;
export const filterResourcesbyTagName = CSISHelpers.filterResourcesbyTagName;
export const filterResourcesByEuglId = CSISHelpers.filterResourcesByEuglId;
export const filterResourcesbyReferenceType = CSISHelpers.filterResourcesbyReferenceType;
export const extractReferencesfromResource = CSISHelpers.extractReferencesfromResource;
export const extractTagsfromResource = CSISHelpers.extractTagsfromResource;
export const extractStudyAreaFromStudyGroupNode = CSISHelpers.extractStudyAreaFromStudyGroupNode;
export const defaultQueryParams = CSISHelpers.defaultQueryParams;
export const generateParametersMap = CSISHelpers.generateParametersMap;

/**
 * Re-Export *common* variable constants defined in EMIKATHelpers and add new common constants not relevant for EMIKATHelpers
 * WARNING: These re-exports do not work with DEFAULT export. CSISHelpers.QUERY_PARAMS === undefined. 
 * DON't use import CSISHelpers from './../lib/CSISHelpers.js'; !
 */

export const LAYERS = CSISHelpers.LAYERS;
/**
 * 
 */
export const QUERY_PARAMS = EMIKATHelpers.QUERY_PARAMS;
export const DATA_FORMAT = EMIKATHelpers.DATA_FORMAT;
export const DATA_FORMAT_VALUES = EMIKATHelpers.DATA_FORMAT_VALUES;
export const EMISSIONS_SCENARIO = EMIKATHelpers.EMISSIONS_SCENARIO;
export const EMISSIONS_SCENARIO_VALUES = EMIKATHelpers.EMISSIONS_SCENARIO_VALUES;
export const EVENT_FREQUENCY = EMIKATHelpers.EVENT_FREQUENCY;
export const EVENT_FREQUENCY_VALUES = EMIKATHelpers.EVENT_FREQUENCY_VALUES;
export const STUDY_VARIANT = EMIKATHelpers.STUDY_VARIANT;
export const STUDY_VARIANT_VALUES = EMIKATHelpers.STUDY_VARIANT_VALUES;
export const TIME_PERIOD = EMIKATHelpers.TIME_PERIOD;
export const TIME_PERIOD_VALUES = EMIKATHelpers.TIME_PERIOD_VALUES;
/**
 * WARNING: This re-export does not work. CSISHelpers.addTemplateParameters === undefined.
 * Don't ask why. This is another JS-madness. :-(
 */
export const addTemplateParameters = EMIKATHelpers.addEmikatParameters;
