// Slightly modified version of entry-wrap-webpack-plugin https://github.com/shakyShane/entry-wrap-webpack-plugin
var ConcatSource = require("webpack/lib/ConcatSource");

function EntryWrap(before, after, options) {
    this.options = options || {};
    this.before = before;
    this.after = after;
}

EntryWrap.prototype.apply = function(compiler) {
    var options = this.options;
    var before = this.before;
    var after = this.after;

    compiler.plugin("compilation", function(compilation) {
        compilation.plugin("optimize-chunk-assets", function(chunks, callback) {
            chunks.forEach(function(chunk) {
                if(!chunk.initial) return;
                const files = chunk.files.filter(file => options.match ? options.match.test(file) : true);
                files.forEach(function(file) {
                    compilation.assets[file] = new ConcatSource(before, "\n", compilation.assets[file], '\n', after);
                });
            });
            callback();
        });
    });
};

module.exports = EntryWrap;
