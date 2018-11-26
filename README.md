# Firebase-util

[![Build Status](https://travis-ci.org/firebase/firebase-util.svg?branch=master)](https://travis-ci.org/firebase/firebase-util)
[![Coverage Status](https://img.shields.io/coveralls/firebase/firebase-util.svg)](https://coveralls.io/r/firebase/firebase-util)
[![Version](https://badge.fury.io/gh/firebase%2Ffirebase-util.svg)](http://badge.fury.io/gh/firebase%2Ffirebase-util)

This is a collection of power toys (mostly experimental) and utilities for use in Firebase.

## Updated to Firebase SDK v3.0.x

Firebase SDK has been updated to v3.x so several steps need to be taken in order to work with new API.
Migration guide is avalaible in: https://firebase.google.com/support/guides/firebase-web

Once the migration steps have been taken, we need to make some changes in our previous firebase v2 code in order to have firebase-util working again.
As surely you have realized, most significant changes are:
 - We no longer instantiate a database references via new Firebase. Instead, we will initialize the SDK via *firebase.initializeApp()* and then we get a database reference with: *firebase.database().ref()* (note the lower case firebase! It's meaningful!)
 - Many no-argument getters have been changed to read-only properties
 
**So what is different with firebase-util**?

Collaterally, the way we get a firebase reference. The way we get some objects like .key, .parent, .ref, that are now read-only properties instead of functions. And the lower case **firebase** namespace, of course!

So basically, now we get a reference like this:
```
var fb = firebase.database().ref();
```
Then we use firebase-util like this (note once again the **lower case** *firebase*):
```
var norm = new firebase.util.NormalizedCollection(
   fb.child('login'),
   fb.child('profile')
);
var scrollRef = new firebase.util.Scroll(fb, 'number');
var emailKey = firebase.util.escapeEmail( anEmailAddress );
```

Finally we retrieve some of the properties like this (without the **()**):
```
var ref = norm.ref;
var key = snapshot.key;
```

## The Tools

 - **firebase.util.NormalizedCollection**
   Sync to multiple Firebase database paths and seamlessly merge the data into a single object. You can use most of your favorite
   Firebase database methods (on, once, set, etc) normally. The merged data is distributed back to the responsible paths
   during set/update/remove ops. [View Docs and API](src/NormalizedCollection/README.md)

 - **firebase.util.Paginate**
   Infinite scrolling and pagination with Firebase data. [View Docs and API](src/Paginate/README.md)

## Setup

### In the browser

With Bower: `bower install firebase-util`

From the CDN: https://cdn.firebase.com/libs/firebase-util/x.x.x/firebase-util.min.js

```
<script>
   // off the global Firebase.util namespace
   var emailKey = firebase.util.escapeEmail( anEmailAddress );

   // or in your browserify packages
   //var fbutil = require('firebase-util');
</script>
```

### In Node

```javascript
var fbutil = require('./firebase-util.js');
var emailKey = fbutil.escapeEmail( anEmailAddress );
```

## Global Utilities

### Firebase.util.logLevel(int)

Log debugging info to JavaScript console (or command line in node.js). Defaults to 'warn' (errors and warnings).
This can be set or changed at any time to any of the following:

```javascript
firebase.util.logLevel(true);  // default logging (also accepts 'all' or 'on')
firebase.util.logLevel(false); // all logging off (also accepts 0, 'off' or 'none')
firebase.util.logLevel('error'); // error, warn, info, log, or debug
```

Debugging can also be enabled in the browser by adding `debugLevel=x` into the url's query parameters. This allows one to turn on debugging for quick troubleshooting without having to modify any code.

The logLevel() method returns a `revert` function that can be used to restore the logging level to it's previous value:

```javascript
// log a whole lotta junk
var revert = firebase.util.logLevel('debug');

// ...run some code...

// revert to default logging
revert();
```

You can also filter log output with a RegExp:

```javascript
// only print logs that begin with "Path"
firebase.util.logLevel('debug', /^Path/);
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

# LICENSE

See [MIT LICENSE](MIT)
