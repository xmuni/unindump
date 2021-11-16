const parseXlsx = require('./parseXlsx');
const renderHtml = require('./renderHtml');
const cheerio = require('cheerio');
const express = require('express');
const fs = require('fs');
const path = require("path");






function filterInfoRows($,rows) {
    
    let infoRows = [];

    for(let row of rows) {
        const is_in_subtable = $(row).hasClass('gridLezioniItem');

        if(!is_in_subtable) {
            let rowText = $(row).find('span').text().trim();

            // Remove random line breaks and tabs
            // rowText = rowText.split('\n').join(' ')
            rowText = rowText.split('\t').join(' ');

            if(rowText.startsWith('Elenco delle lezioni')) {
                break;
            }

            infoRows.push(rowText);
        }
    }

    var infoPairs = [];

    for(var i = 0; i < infoRows.length; i += 2) {
        infoPairs.push(infoRows.slice(i, i + 2));
    }

    return infoPairs;
}


function filterLessonsRows($,rows) {

    let remove = ['Lezione n. '];
    
    let lessonTitles = [];

    for(let row of rows) {
        
        const is_in_subtable = $(row).hasClass('gridLezioniItem');

        if(is_in_subtable) {
            let text = $(row).find('td:first-child a:first-child').text().trim().toLowerCase();
            
            for(let replacement of remove) {
                text = text.replace(replacement,'');
            }

            if(text.includes(':')) {
                text = text.split(':')[1].trim();
            }

            lessonTitles.push(text);
        }
    }

    return lessonTitles;
}


function parseUninHtml(filename) {

    if(filename.startsWith('-'))
        return {};
    
    const text = fs.readFileSync(path.join(__dirname, 'input', filename));

    const $ = cheerio.load(text);

    // Get generic info
    const infoTable = $('table')[0];
    const rows = $(infoTable).find('tr');
    const infoRows = filterInfoRows($,rows);

    // Get lessons
    const lessonsTable = $('table')[1];
    const lessonTitles = filterLessonsRows($,$(lessonsTable).find('tr'));

    // console.log(infoRows.join('\n\n'))
    // console.log(lessonTitles.join('\n\n'))

    return {
        info: infoRows,
        lessons: lessonTitles,
    }

    // Array.from(document.querySelectorAll(".gridLezioni tr td:first-child a:first-child")).map(e => e.innerText.trim()).join('\n')
}


function main() {

    const data = parseXlsx('input/topics.xlsx');
    for(let i=0; i<data.length; i++) {
        data[i].id = i;
    }

    const pdflinks = parseXlsx('input/books.xlsx', true);
    // console.log(pdflinks);
    
    for(let obj of data) {
        obj.data = parseUninHtml(obj.filename+'.htm');
    }

    fs.writeFileSync(path.join(__dirname, 'output.json'), JSON.stringify(data,null,4));
    
    const template = fs.readFileSync(path.join(__dirname, 'input/template.html'), 'utf8');
    const renderedHtml = renderHtml(template, {
        data: data,
        pdflinks: pdflinks,
    });
    fs.writeFileSync(path.join(__dirname, 'public/index.html'), renderedHtml, 'utf8');
    console.log('Html Render OK');
}


/* Render HTML and save it to public/index.html */
main();




/* Set up Express.js server */

const server = express();
const port = process.env.PORT || "8000";

// Enable CORS for react frontend
const cors = require('cors');
server.use(cors({ credentials: true })) // THIS FIXES EVERYTHING https://stackoverflow.com/questions/50968152/cross-origin-request-blocked-with-react-and-express

server.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

// Make available to the client all files inside 'public'
server.use(express.static(path.join(__dirname, 'public')));
server.use(express.static('D:\\Dropbox\\Archive\\Pdf books\\Topics'));


/*
server.get("/", (req, res) => {
    // const html = fs.readFileSync(`${__dirname}/ui.html`, 'utf8');
    const html = fs.readFileSync(`${__dirname}/public/index.html`);
    res.status(200).send("Default dummy html");
});
*/

/*
server.get("/rendered", (req, res) => {
    // const html = fs.readFileSync(`${__dirname}/ui.html`, 'utf8');
    main();
    const html = fs.readFileSync(`${__dirname}/public/index.html`);
    res.status(200).send(html);
});
*/

server.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port} ...`);
});

