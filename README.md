A javascript console implementation on top of ACE editor.


## Dependencies

- ace
- (jquery)[http://code.jquery.com/jquery-1.8.0.js]
- (jquery-ui)[http://code.jquery.com/ui/1.9.0-rc.1/jquery-ui.js]
- (jquery.layout)[http://layout.jquery-dev.net/lib/js/jquery.layout-latest.js]
- (jquery.layout.css)[http://layout.jquery-dev.net/lib/css/layout-default-latest.css]

Optional:
- ace theme-textmate
- ace mode-javascript

### How to build our custom hacked ACE

Clone our custom repo
```
git clone git://github.com/rxaviers/ace.git
```

Branch console_hacks
```
cd ace
git checkout console_hacks
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

### Downloading dependencies

```
wget -O libs/jquery.js "http://code.jquery.com/jquery-1.8.0.js"
wget -O libs/jquery-ui.js "http://code.jquery.com/ui/1.9.0-rc.1/jquery-ui.js"
wget -O libs/jquery.layout.js "http://layout.jquery-dev.net/lib/js/jquery.layout-latest.js"
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
