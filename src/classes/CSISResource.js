/* 
 * ***************************************************
 * 
 * cismet GmbH, Saarbruecken, Germany
 * 
 *               ... and it just works.
 * 
 * ***************************************************
 */

import CSISHelpers from '../lib/CSISHelpers.js'

/**
 * Experimental CSIS Resource Class
 * 
 * @author [Pascal Dihé](https://github.com/p-a-s-c-a-l)
 * @class
 */
export default class CSISResource {

    /**
     * 
     * @param {Object} resource 
     * @param {Object[]} includes 
     * @constructor
     */
    constructor(resource, includes) {
        this.resource = resource;
        this.includes = includes;
    }

    /**
     * Convenience method for retrieving the service type from Drupal resource JSON object
     * 
     * @return {String}
     */
    getServiceType() {
        const serviceType = this.getTags('taxonomy_term--service_type');
        return (Array.isArray(serviceType) && serviceType.length > 0) ? serviceType[0] : null;
    }

    /**
     * 
     * @param {String} referenceType 
     * @returns {Object{[]}
     */
    getReferences(referenceType) {
        return CSISHelpers.extractReferencesFromResource(this.resource, this.includes, referenceType);
    }

    /**
     * 
     * @param {String} tagType 
     * @returns {Object{[]}
     */
    getTags(tagType) {
        return CSISHelpers.extractTagsfromResource(this.resource, this.includes, tagType);
    }

    /**
     * @deprecated
     */
    getParametersMaps() {
        return CSISHelpers.parametersMapsFromTemplateResource(this.resource, this.includes);
    }
}