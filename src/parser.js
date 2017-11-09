import fs from 'fs';
import cheerio from 'cheerio';
import moment from 'moment';

const filename = './mails/mail.html';
const html = fs.readFileSync(filename, {encoding: 'utf8'});

const $ = cheerio.load(html);

exports.getResult = function() {
    let result = {
        "status": "ok",
        "result": {
            "trips": [
                {
                    "code": this.getRefCode(),
                    "name": this.getRefName(),
                    "details": {
                        "price": this.getTotalPrice(),
                        "roundTrips": this.getRoundTrips()
                    }
                }
            ],
            "custom": {
                "prices": this.getPricing()
            }
        }
    };

    fs.writeFile('./result.json', JSON.stringify(result), function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log('done')
        }
    })
};

exports.getPricing = function() {
    let prices = [];
    $('.product-header').each((index, element) => {
        $(element).find('tr > td').each((index2, element2) => {
            if($(element2).text().includes(" €")) {
                let price = parseFloat($(element2).text().match(/([0-9,]+(\\,[0-9]{2})?)/gm)[0].replace(/,/g,'.'));
                prices.push({ "value" : price });
            }
        });
    });

    return prices;
};

exports.getRefCode = function() {
    let code = "";
    $('.pnr-ref').each((key, ref_code) => {
        $(ref_code).find('.pnr-info').each((key_info, ref_code_info) => {
            code = $(ref_code_info).text()
        });
    });

    return code.trim();
};

exports.getRefName = function() {
    let name = "";

    $('.pnr-name').each((key, ref_name) => {
        $(ref_name).find('.pnr-info').each((key_info, ref_name_info) => {
            name = $(ref_name_info).text()
        });
    });

    return name.trim();
};

exports.getTotalPrice = function() {
    return parseFloat($('.total-amount > tbody > tr > td.very-important')
        .text()
        .match(/([0-9,]+(\\,[0-9]{2})?)/gm)[0].replace(/,/g,'.')
    );
};

exports.getRoundTrips = function() {
    let roundTrips = [];

    // Get product date
    $('.product-travel-date').each((key, product_date) => {
        let date = new Date($(product_date).text() + " 2016");
        date = moment(date.toISOString());
        let roundTrip = { "date" : date.format('YYYY-MM-DD HH:mm:ss.SSS') + "Z", "trains" : [] };

        roundTrips.push(roundTrip);
    });

    // Get product details
    $('.product-details > tbody').each((key, product) => {
        let train = {};

        train.type = $(product).find('.travel-way').text().trim();

        $(product).find('.origin-destination-hour').each((key_destination_hour, product_destination_hour) => {
            switch (key_destination_hour) {
                case 0 :
                    train.departureTime = $(product_destination_hour).text().replace(/ /g, '').replace(/h/g, ':');
                    break;
                case 1 :
                    train.arrivalTime = $(product_destination_hour).text().replace(/ /g, '').replace(/h/g, ':');
                    break;
                default :
                    break;
            }
        });

        $(product).find('.origin-destination-station').each((key_destination_station, product_destination_station) => {
            switch (key_destination_station) {
                case 0 :
                    train.departureStation = $(product_destination_station).text().trim();
                    break;
                case 1 :
                    train.arrivalStation = $(product_destination_station).text().trim();
                    break;
                default :
                    break;
            }
        });

        $(product).find('.segment').each((key_segment, product_segment) => {
            switch (key_segment) {
                case 0 :
                    train.type = $(product_segment).text().trim();
                    break;
                case 1 :
                    train.number = $(product_segment).text().trim();
                    break;
                default :
                    break;
            }
        });

        roundTrips[key].trains.push(train);
    });

    // Get passengers
    let passengers = [];
    $('.passengers').each((key, passengers_data) => {
        if(key === roundTrips.length - 1) {
            $(passengers_data).find('tr').each((key_passenger, passengers_data_info) => {
                let passenger = {};
                if(key_passenger % 2) {
                    passenger.age = '(' + $(passengers_data_info).find('.typology').text().match(/\((.*?)\)/)[1] + ')';
                    passenger.type = $(passengers_data_info).find('.fare-details ').text().includes('Billet échangeable et remboursable')
                        ? 'échangeable'
                        : 'non échangeable';

                    passengers.push(passenger)
                }
            });
            roundTrips[key].trains[0].passengers = passengers;
        }
    });

    return roundTrips;

};


