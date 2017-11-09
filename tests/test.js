import test from 'ava';
import fs from 'fs';
import parser from '../dist/src/parser';

const jsonTest = JSON.parse(fs.readFileSync('./tests/test-result.json', 'utf8'));


test.cb('testResult', t => {
    t.plan(2);

    const testResult = () => {
        const json = JSON.parse(fs.readFileSync('./result.json', 'utf8'));

        t.is(json.status, jsonTest.status);
        t.is(typeof json, 'object');
        t.end();
    };

    parser.getResult(testResult);
});

test.cb('testPricing', t => {
    const prices = parser.getPricing();
    const testPrices = jsonTest.result.custom.prices;

    t.is(prices.length, testPrices.length);
    t.is(prices[0].value, testPrices[0].value);
    t.end();
});

test.cb('testRefCode', t => {
    const refCode = parser.getRefCode();
    const testRefCode = jsonTest.result.trips[0].code;

    t.is(refCode, testRefCode);
    t.end();
});

test.cb('testRefName', t => {
    const refName = parser.getRefName();
    const testRefName = jsonTest.result.trips[0].name;

    t.is(refName, testRefName);
    t.end();
});

test.cb('testTotalPrice', t => {
    const totalPrice = parser.getTotalPrice();
    const testTotalPrice = jsonTest.result.trips[0].details.price;

    t.is(totalPrice, testTotalPrice);
    t.end();
});

test.cb('testRoundTrips', t => {
    const roundTrips = parser.getRoundTrips();
    const testRoundTrips = jsonTest.result.trips[0].details.roundTrips;

    t.is(roundTrips.length, testRoundTrips.length);

    t.is(roundTrips[0].type, testRoundTrips[0].type);
    t.is(roundTrips[0].date, testRoundTrips[0].date);

    t.is(roundTrips[0].trains[0].departureTime, testRoundTrips[0].trains[0].departureTime);
    t.is(roundTrips[0].trains[0].arrivalTime, testRoundTrips[0].trains[0].arrivalTime);
    t.is(roundTrips[0].trains[0].departureStation, testRoundTrips[0].trains[0].departureStation);
    t.is(roundTrips[0].trains[0].arrivalStation, testRoundTrips[0].trains[0].arrivalStation);
    t.is(roundTrips[0].trains[0].type, testRoundTrips[0].trains[0].type);
    t.is(roundTrips[0].trains[0].number, testRoundTrips[0].trains[0].number);

    t.is(roundTrips[3].trains[0].passengers.length, testRoundTrips[3].trains[0].passengers.length);
    t.is(roundTrips[3].trains[0].passengers[0].age, testRoundTrips[3].trains[0].passengers[0].age);
    t.is(roundTrips[3].trains[0].passengers[0].type, testRoundTrips[3].trains[0].passengers[0].type);

    t.end();
});