jsCart
======

Just a fiddle about with node to make a basic shopping cart.

Later exented to include QoS templates. That is, templates processed server side, but exported to client for later processing if the model a template requires is not available within the given timeframe.

See here for vaguely related diagram:

https://docs.google.com/drawings/d/1EOB6ksAV_W2WDtKZ4XXkZ-0ZaRbuMHfFmaAGTL_8600

User Access
===========

There are primitive user access controls built in using the manacle module.

In practice this is intended to run behind a user identification layer that would inject a header with user ID. For the sake of this example, add a 'cn' header to emulate a 'logged in user'. For this example, the actual value of the header is not relevant.

A 'logged in user' can see the 'fast' application. Without the header, this will not be shown.


A-B Testing
===========

A simple example of A-B Testing is included. Set the header 'ab' to 'apple' to show the user Apple products (imagine they have been identified as particularly interested in these). As with user identification, in the real world this header would be set above this application where possible.

How to run it
=============

```
$ npm install
$ npm start
```

Then hit one of these URLS:

http://localhost:3030/qosTemplates.html

http://localhost:3030/cart.html
