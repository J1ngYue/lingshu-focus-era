const esbuild = require('esbuild');
esbuild.buildSync({entryPoints:[require('node:path').join(__dirname,'scene.mjs')],outfile:require('node:path').join(__dirname,'scene.js'),bundle:true,format:'iife',minify:true,legalComments:'eof',target:['chrome110']});
