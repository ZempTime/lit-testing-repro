/** @fileoverview Bootstraps the test bundle for karma-webpack. */
const testsContext = require.context("../../", true, /karma\.unit\.test\.js$/);
testsContext.keys().forEach(testsContext);
