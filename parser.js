import fs from 'fs';
import cheerio from 'cheerio';

const filename = './mails/mail.html';
const html = fs.readFileSync(filename, {encoding: 'utf8'});
const data = [];

const $ = cheerio.load(html);


// Get Pricing
$('.product-header').each((index, element) => {
    $(element).find('tr > td').each((index2, element2) => {
        if($(element2).text().includes(" €")) {
            console.log(parseFloat($(element2).text().match(/([0-9,]+(\\,[0-9]{2})?)/gm)[0].replace(/,/g,'.')))
        }
    });
});