jsCart
======

Just a fiddle about with node to make a basic shopping cart.

Later exented to include QoS templates. That is, templates processed server side, but exported to client for later processing if the model a template requires is not available within the given timeframe.

See here for vaguely related diagram:

https://docs.google.com/drawings/d/1EOB6ksAV_W2WDtKZ4XXkZ-0ZaRbuMHfFmaAGTL_8600


How to run it
=============

```
$ npm install
$ npm start
```

Then hit one of these URLS:

http://localhost:3030/qosTemplates.html

http://localhost:3030/cart.html
