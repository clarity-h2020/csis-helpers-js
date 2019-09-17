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

import * as EMIKATHelpers from './../lib/EMIKATHelpers.js';
import { EMIKATHelpers as _EMIKATHelpers } from './../../dist/index.js';


// import {create, router, defaults, rewriter} from 'json-server';
import express from 'express'
import populationExposure from './../__fixtures__/tab.CLY_EL_POPULATION_INTERPOLATED.2016.json';

const app = express();
var server;

beforeAll(() => {
  // respond with "hello world" when a GET request is made to the homepage
  app.get('/EmiKatTst/api/scenarios/2846/feature/tab.CLY_EL_POPULATION_INTERPOLATED.2016/table/data', function (req, res) {
    res.json(populationExposure);
  })

  server = app.listen(31337, () => console.log('Example app listening on port 3000!'))
});

it('tests JSON API', async (done) => {
  expect.assertions(1);
  const response = await axios.get('http://localhost:31337/EmiKatTst/api/scenarios/2846/feature/tab.CLY_EL_POPULATION_INTERPOLATED.2016/table/data');
  expect(response.data).toEqual(populationExposure);
  done();
});

test('[DEV] ReactTable columns defintions automatically generated from EMIKAT tabular data', () => {

  const columns = EMIKATHelpers.generateColumns(populationExposure.columnnames);
  expect(columns).toBeInstanceOf(Array);
  expect(columns.length).toEqual(populationExposure.columnnames.length);
  columns.forEach((columDefinition, index) => {
    expect(columDefinition.Header).toEqual(populationExposure.columnnames[index]);
  });
});

test('[RELEASE] ReactTable columns defintions automatically generated from EMIKAT tabular data', () => {

  const columns = _EMIKATHelpers.generateColumns(populationExposure.columnnames);
  expect(columns).toBeInstanceOf(Array);
  expect(columns.length).toEqual(populationExposure.columnnames.length);
  columns.forEach((columDefinition, index) => {
    expect(columDefinition.Header).toEqual(populationExposure.columnnames[index]);
  });
});

test('[RELEASE] URL without EmikatId', () => {

  const url = 'https://clarity.meteogrid.com/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=europe:HI_Tx75p-consecutive-max_historical_19710101-20001231_ensstd&bbox=2145500,982500,6606000,57065000&width=725&height=768&srs=EPSG:3035&format=image/png';
  const transformedUrl = _EMIKATHelpers.addEmikatId(url, 'NO_ID')
  expect(url).toEqual(transformedUrl);
});

test('[RELEASE] URL with EmikatId', () => {
  /**
   * @type {String}
   */
  const url = `https://clarity.meteogrid.com/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=europe:HI_Tx75p-consecutive-max_historical_19710101-20001231_ensstd&bbox=2145500,982500,6606000,57065000&width=725&height=768&srs=EPSG:3035&format=image/png&EMIKAT_STUDY_ID=${_EMIKATHelpers.EMIKAT_STUDY_ID}`;
  /**
   * @type {String}
   */
  const transformedUrl = _EMIKATHelpers.addEmikatId(url, 31337);
  expect(url).not.toEqual(transformedUrl);
  expect(transformedUrl.includes('$')).toBeFalsy;
  expect(transformedUrl.includes('31337')).toBeTruthy;
});

test('[DEV] URL with EMIKAT PARAMETERS', () => {
  /**
   * @type {String}
   */
  const urlTemplate = `https://service.emikat.at/geoserver/clarity/wms?service=WMS&version=1.1.0&request=GetMap&layers=clarity%3Aview.2974&bbox=4672000.0%2C1979500.0%2C4687500.0%2C1988000.0&width=768&height=421&srs=EPSG%3A3035&format=image%2Fgif&CQL_FILTER=PROJECT%3D%27${EMIKATHelpers.STUDY_VARIANT}%27%20and%20PERIOD=%27${EMIKATHelpers.TIME_PERIOD}%27%20AND%20RCP=%27${EMIKATHelpers.EMISSIONS_SCENARIO}%27%20AND%20FREQUENCE=%27${EMIKATHelpers.EVENT_FREQUENCY}%27%20AND%20SZ_ID=${EMIKATHelpers.EMIKAT_STUDY_ID}&styles=T_A`;

  /**
   * @type {String}
   */
  const url = 'https://service.emikat.at/geoserver/clarity/wms?service=WMS&version=1.1.0&request=GetMap&layers=clarity%3Aview.2974&bbox=4672000.0%2C1979500.0%2C4687500.0%2C1988000.0&width=768&height=421&srs=EPSG%3A3035&format=image%2Fgif&CQL_FILTER=PROJECT%3D%27BASELINE%27%20and%20PERIOD=%27Baseline%27%20AND%20RCP=%27Baseline%27%20AND%20FREQUENCE=%27Rare%27%20AND%20SZ_ID=2846&styles=T_A';

  /**
   * @type{Map<String, any>}
   */
  const parametersMap = new Map([
    [EMIKATHelpers.EMIKAT_STUDY_ID, 2846],
    [_EMIKATHelpers.STUDY_VARIANT, 'BASELINE'],
    [_EMIKATHelpers.TIME_PERIOD, 'Baseline'],
    [_EMIKATHelpers.EMISSIONS_SCENARIO, 'Baseline'],
    [_EMIKATHelpers.EVENT_FREQUENCY, 'Rare']
  ]);

  /**
     * @type {String}
     */
  const transformedUrl = EMIKATHelpers.addEmikatParameters(urlTemplate, parametersMap);
  expect(urlTemplate).not.toEqual(transformedUrl);
  expect(transformedUrl.includes('$')).toBeFalsy;
  expect(transformedUrl.includes('2846'));
  expect(transformedUrl.includes('BASELINE'));
  expect(transformedUrl.includes('Baseline'));
  expect(transformedUrl.includes('Rare'));
  expect(url).toEqual(transformedUrl);
});

test('[PROD] URL with EMIKAT PARAMETERS', () => {
  /**
   * @type {String}
   */
  const urlTemplate = `https://service.emikat.at/geoserver/clarity/wms?service=WMS&version=1.1.0&request=GetMap&layers=clarity%3Aview.2974&bbox=4672000.0%2C1979500.0%2C4687500.0%2C1988000.0&width=768&height=421&srs=EPSG%3A3035&format=image%2Fgif&CQL_FILTER=PROJECT%3D%27${_EMIKATHelpers.STUDY_VARIANT}%27%20and%20PERIOD=%27${_EMIKATHelpers.TIME_PERIOD}%27%20AND%20RCP=%27${_EMIKATHelpers.EMISSIONS_SCENARIO}%27%20AND%20FREQUENCE=%27${_EMIKATHelpers.EVENT_FREQUENCY}%27%20AND%20SZ_ID=${_EMIKATHelpers.EMIKAT_STUDY_ID}&styles=T_A`;

  /**
   * @type {String}
   */
  const url = 'https://service.emikat.at/geoserver/clarity/wms?service=WMS&version=1.1.0&request=GetMap&layers=clarity%3Aview.2974&bbox=4672000.0%2C1979500.0%2C4687500.0%2C1988000.0&width=768&height=421&srs=EPSG%3A3035&format=image%2Fgif&CQL_FILTER=PROJECT%3D%27BASELINE%27%20and%20PERIOD=%27Baseline%27%20AND%20RCP=%27Baseline%27%20AND%20FREQUENCE=%27Rare%27%20AND%20SZ_ID=2846&styles=T_A';

  /**
   * @type{Map<String, any>}
   */
  const parametersMap = new Map([
    [_EMIKATHelpers.EMIKAT_STUDY_ID, 2846],
    [_EMIKATHelpers.STUDY_VARIANT, 'BASELINE'],
    [_EMIKATHelpers.TIME_PERIOD, 'Baseline'],
    [_EMIKATHelpers.EMISSIONS_SCENARIO, 'Baseline'],
    [_EMIKATHelpers.EVENT_FREQUENCY, 'Rare']
  ]);


  /**
   * @type {String}
   */
  const transformedUrl = _EMIKATHelpers.addEmikatParameters(urlTemplate, parametersMap);
  expect(urlTemplate).not.toEqual(transformedUrl);
  expect(transformedUrl.includes('$')).toBeFalsy();
  expect(transformedUrl.includes('2846'));
  expect(transformedUrl.includes('BASELINE'));
  expect(transformedUrl.includes('Baseline'));
  expect(transformedUrl.includes('Rare'));
  expect(url).toEqual(transformedUrl);
});

test('[RELEASE] simple URL with EmikatId', () => {
  /**
   * @type {String}
   */
  const url = 'https://service.emikat.at/geoserver/clarity/wms?CQL_FILTER=SZ_ID=${emikat_id}';
  /**
   * @type {String}
   */
  const transformedUrl = EMIKATHelpers.addEmikatId(url, 31337);
  expect(url).not.toEqual(transformedUrl);
  expect(transformedUrl.includes('$')).toBeFalsy();
  expect(transformedUrl.includes('31337')).toBeTruthy();
  expect(transformedUrl).toEqual('https://service.emikat.at/geoserver/clarity/wms?CQL_FILTER=SZ_ID=31337');
});

afterAll(() => {
  server.close(() => {
    //console.log('JSON Server closed');
    //process.exit(0);
  });
});