# This Repo

Is here because I had _sometimes_ failing tests. Here's what those look like:

```
FAILED TESTS:
  filterable-table
    ✖ "before each" hook
      Firefox 64.0.0 (Mac OS X 10.13.0)
    uncaught exception: AssertionError: expected 0 to equal 1 (:0)

    __shouldColorIcon()
      ✖ will return true for the icon representing the selected sort
        Firefox 64.0.0 (Mac OS X 10.13.0)
        Firefox 64.0.0 (Mac OS X 10.13.0)
      expected false to be true
      AssertionError@/Users/zempelc/[redacted]/node_modules/chai/chai.js:9449:13
      [3]</module.exports/Assertion.prototype.assert@/Users/zempelc/code/[redacted]/node_modules/chai/chai.js:239:13
      [5]</module.exports/<@/Users/zempelc/code/[redacted]/node_modules/chai/chai.js:1021:5
      propertyGetter@/Users/zempelc/code/[redacted]/node_modules/chai/chai.js:7899:22
      proxyGetter@/Users/zempelc/code/[redacted]/node_modules/chai/chai.js:9247:14
      ./components/x-filterable-table.karma.unit.test.js/</</</</<@test/unit/index.js:20206:11


      ✖ will return false for icons not representing the selected sort
        Firefox 64.0.0 (Mac OS X 10.13.0)
        Firefox 64.0.0 (Mac OS X 10.13.0)
      expected true to be false
      AssertionError@/Users/zempelc/code/[redacted]/node_modules/chai/chai.js:9449:13
      [3]</module.exports/Assertion.prototype.assert@/Users/zempelc/code/[redacted]/node_modules/chai/chai.js:239:13
      [5]</module.exports/<@/Users/zempelc/code/[redacted]/node_modules/chai/chai.js:1056:5
      propertyGetter@/Users/zempelc/code/[redacted]/node_modules/chai/chai.js:7899:22
      proxyGetter@/Users/zempelc/code/[redacted]/node_modules/chai/chai.js:9247:14
      ./components/x-filterable-table.karma.unit.test.js/</</</</<@test/unit/index.js:20227:11
```

I'm trying to accomplish two things:
1) Figure out how why this failure is occuring
2) Learn how to test `lit-element` based components more effectively

The answer was: use https://open-wc.org test helpers!
