import fs from 'fs';
import cheerio from 'cheerio';

const filename = './mails/mail.html';
const html = fs.readFileSync(filename, {encoding: 'utf8'});
const data = [];

const $ = cheerio.load(html);


// Get Pricing
let prices = [];
$('.product-header').each((index, element) => {
    $(element).find('tr > td').each((index2, element2) => {
        if($(element2).text().includes(" €")) {
            let price = parseFloat($(element2).text().match(/([0-9,]+(\\,[0-9]{2})?)/gm)[0].replace(/,/g,'.'));
            prices.push({ "value" : price });
        }
    });
});

// Get ref code
let code = "";
$('.pnr-ref').each((key, ref_code) => {
    $(ref_code).find('.pnr-info').each((key_info, ref_code_info) => {
        code = $(ref_code_info).text()
    });
});

// Get ref name
let name = "";
$('.pnr-name').each((key, ref_name) => {
    $(ref_name).find('.pnr-info').each((key_info, ref_name_info) => {
        name = $(ref_name_info).text()
    });
});

// Get totalPrice
let totalPrice = parseFloat($('.total-amount > tbody > tr > td.very-important')
                    .text()
                    .match(/([0-9,]+(\\,[0-9]{2})?)/gm)[0].replace(/,/g,'.')
);
