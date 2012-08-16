A javascript console implementation on top of ACE editor.


## Dependencies

- ace

Optional:
- ace theme-textmate
- ace mode-javascript

### How to build our custom hacked version of ACE

Clone our custom repo
```
git clone git://github.com/rxaviers/ace.git
```

Branch console_hacks
```
cd ace
git branch console_hacks
```

Build
```
npm install
node Makefile.dryice.js -m
```

Copy the built files to /libs
```
cd ..
cp ace/build/src-min/ace.js console.js/libs
```

## Example

In the HTML:
```html
<div id="shell"></div>
```

In the javascript:
```javascript
new Shell("shell");
```
