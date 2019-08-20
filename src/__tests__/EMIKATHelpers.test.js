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
import {EMIKATHelpers as _EMIKATHelpers} from './../../dist/index.js';


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

it ('tests JSON API', async (done) => {
  expect.assertions(1);
  const response = await axios.get('http://localhost:31337/EmiKatTst/api/scenarios/2846/feature/tab.CLY_EL_POPULATION_INTERPOLATED.2016/table/data');
  expect(response.data).toEqual(populationExposure);
  done();
});

test ('[DEV] ReactTable columns defintions automatically generated from EMIKAT tabular data', ()=>{

  const columns = EMIKATHelpers.generateColumns(populationExposure.columnnames);
  expect(columns).toBeInstanceOf(Array);
  expect(columns.length).toEqual(populationExposure.columnnames.length);
  columns.forEach((columDefinition, index)=>{
    expect(columDefinition.Header).toEqual(populationExposure.columnnames[index]);
  });
});

test ('[RELEASE] ReactTable columns defintions automatically generated from EMIKAT tabular data', ()=>{

  const columns = _EMIKATHelpers.generateColumns(populationExposure.columnnames);
  expect(columns).toBeInstanceOf(Array);
  expect(columns.length).toEqual(populationExposure.columnnames.length);
  columns.forEach((columDefinition, index)=>{
    expect(columDefinition.Header).toEqual(populationExposure.columnnames[index]);
  });
});

afterAll(() => {
  server.close(() => {
    //console.log('JSON Server closed');
    //process.exit(0);
  });
});