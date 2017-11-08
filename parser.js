import fs from 'fs';
import cheerio from 'cheerio';

const filename = './mails/mail.html';
const html = fs.readFileSync(filename, {encoding: 'utf8'});

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

// Get productDetails
let productDetails = [];

$('.product-travel-date').each((key, product_date) => {
    let i = 0;
    let resultProduct = { "date" : $(product_date).text(), "trains" : {} };

    productDetails.push(resultProduct);
});

$('.product-details > tbody').each((key, product) => {
    productDetails[key].type = $(product).find('.travel-way').text().replace(/ /g, '');
    productDetails[key].trains.departureTime = $(product).find('.origin-destination-hour .segment-departure').text();
    productDetails[key].trains.departureStation = $(product).find('.origin-destination-station .segment-departure').text();
    productDetails[key].trains.arrivalTime = $(product).find('.origin-destination-hour .segment-arrival').text();
    productDetails[key].trains.arrivalStation = $(product).find('.origin-destination-station .segment-arrival').text();

    $(product).find('.origin-destination-hour').each((key_destination_hour, product_destination_hour) => {
        switch (key_destination_hour) {
            case 0 :
                productDetails[key].trains.departureTime = $(product_destination_hour).text().replace(/ /g, '');
                break;
            case 1 :
                productDetails[key].trains.arrivalTime = $(product_destination_hour).text().replace(/ /g, '');
                break;
            default :
                break;
        }
    });

    $(product).find('.origin-destination-station').each((key_destination_station, product_destination_station) => {
        switch (key_destination_station) {
            case 0 :
                productDetails[key].trains.departureStation = $(product_destination_station).text();
                break;
            case 1 :
                productDetails[key].trains.arrivalStation = $(product_destination_station).text();
                break;
            default :
                break;
        }
    });

    $(product).find('.segment').each((key_segment, product_segment) => {
        switch (key_segment) {
            case 0 :
                productDetails[key].trains.type = $(product_segment).text().replace(/ /g, '');
                break;
            case 1 :
                productDetails[key].trains.number = $(product_segment).text().replace(/ /g, '');
                break;
            default :
                break;
        }
    });
});

// Get passengers
let passengers = [];
$('.passengers').each((key, passengers_data) => {
   if(key === productDetails.length - 1) {
       $(passengers_data).find('tr').each((key_passenger, passengers_data_info) => {
           let passenger = {};
           if(key_passenger % 2) {
               passenger.age = '(' + $(passengers_data_info).find('.typology').text().match(/\((.*?)\)/)[1] + ')'
               passenger.type = $(passengers_data_info).find('.fare-details ').text().includes('Billet échangeable et remboursable')
                                    ? 'échangeable'
                                    : 'non échangeable';

               passengers.push(passenger)
           }

       });

       productDetails[key].trains.passengers = passengers;
   }
});