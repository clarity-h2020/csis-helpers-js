import CSISResource from './../classes/CSISResource';

import apiResponseResources from './../__fixtures__/resources.json';

test('test CSISResource getServiceType', () => {
    expect(apiResponseResources.data).not.toBeNull();
    expect(apiResponseResources.included).not.toBeNull();
    const csisResource = new CSISResource(apiResponseResources.data[0], apiResponseResources.included);
    const serviceType = csisResource.getServiceType();
    expect(serviceType).not.toBeNull();
    expect(serviceType.attributes.name).toEqual('ogc:wcs');
});