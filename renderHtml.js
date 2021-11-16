const nunjucks = require('nunjucks');

const renderHtml = (source_template,data,filters={}) => {

    var env = new nunjucks.Environment();

    // Add custom filters to Nunjucks environment
    // https://mozilla.github.io/nunjucks/api#custom-filters
    for(const [key, value] of Object.entries(filters)) {
        env.addFilter(key, value);
        console.log("Added nunjucks custom filter:",key);
    }

    // nunjucks.configure({ autoescape: true });
    let renderedHtml = env.renderString(source_template, data);

    return renderedHtml;
}

module.exports = renderHtml;