const path = require('path');
const fs = require('fs');
const translate = require('./translator.js');

testTranslate();

async function testTranslate() {
    let tr = await translate.translate('Hello World', { from: 'auto', to: 'ta' });
    console.log(tr);
}

exports.genLocale = async (req, res) => {
    let app = req.query.app || 'animal';
    let locale = req.body.locale;
    let key = req.body.key;

    let appDir = path.join(__dirname, '../lang/' + app);
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir);
    }
    let localePath = path.join(appDir, '/' + locale + '.json');
    if (!fs.existsSync(localePath)) {
        fs.writeFileSync(localePath, '{}');
    }
    
    
    let tr = await translate.translate(key, { from: 'auto', to: locale });
    let localeFile = fs.readFileSync(localePath);
    let localeJson = JSON.parse(localeFile);
    localeJson[key] = tr;
    fs.writeFileSync(localePath, JSON.stringify(localeJson, null, 4));
    console.log(`Locale: ${locale}, key: ${key}, value: ${tr}`);

    res.send({
        'status': '200',
        'message': 'OK',
        'data': localeJson
    })
}
exports.getLocale = async (req, res) => {
    let app = req.query.app || 'animal';
    let locale = req.query.locale;

    let appDir = path.join(__dirname, '../lang/' + app);
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir);
    }
    let localePath = path.join(appDir, '/' + locale + '.json');
    if (!fs.existsSync(localePath)) {
        fs.writeFileSync(localePath, '{}');
    }
    let localeFile = fs.readFileSync(localePath);
    let localeJson = JSON.parse(localeFile);
    console.log(`Locale: ${locale}, got ${Object.keys(localeJson).length} keys`);
    res.send({
        'status': '200',
        'message': 'OK',
        'data': localeJson
    })
}

