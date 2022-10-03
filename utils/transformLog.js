const fs = require('fs');

exports.TransformLog = fileName => {
    const logFile = fs.readFileSync(`${fileName}`, 'utf-8');
    const array = logFile.split("\n");
    const dataArray = []
    for (let i = 0; i < array.length; i++) {
        if (array[i] == '') continue 
        dataArray.push(JSON.parse(array[i]));
    }
    return dataArray;
}
