import fs from 'fs';
import htmlparser from 'htmlparser2';

const filename = './mails/mail.html';
const html = fs.readFileSync(filename, {encoding: 'utf8'});
const data = [];

const parser = new htmlparser.Parser({
    ontext: function(text){
        data.push(text);
    }
}, {decodeEntities: false});

parser.write(html);
parser.end();

let tmpData = [];

// Clear

for (let i=0, l=data.length; i<l; i++) {
    if (data[i].replace(/ /g,'') !== "" && !data[i].includes("\\r\\n")) {
        tmpData.push(data[i])
    }
}


let prices = [];

for (let i=0, l=tmpData.length; i<l; i++) {

    // Pricing
    if(
        (tmpData[i].replace(/&nbsp;/g,' ').includes("4 passagers ")
        || tmpData[i].replace(/&nbsp;/g,' ').includes("Carte Enfant+"))
        && tmpData[i+1].replace(/&nbsp;/g,' ').includes(" €")
    ) {
        let price = parseFloat(tmpData[i + 1].match(/([0-9,]+(\\,[0-9]{2})?)/gm)[0].replace(/,/g,'.'));
        prices.push({"values" : price})
    }

    //console.log(tmpData[i].replace(/&nbsp;/g,' '));
}

console.log(code, name, totalPrice);




