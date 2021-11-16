/* https://github.com/SheetJS/sheetjs */
const XLSX = require('xlsx')


/*
- parseXlsx used the 'xlsx' library (aka SheetJS).

- Normally returns a list of objects (one object per row, 
  and the first row is used as keys).

- If 'firstColumnAsKey' is true, instead it returns an object where 
  the keys are the values of the first column, and the values are their rows.
*/
function parseXlsx(path, firstColumnAsKey=false) {

    // Requiring the module
    
    // Reading our test file
    const file = XLSX.readFile(path)

    let data = []
    
    const sheets = file.SheetNames
    
    for(let i = 0; i < sheets.length; i++)
    {
        const temp = XLSX.utils.sheet_to_json(file.Sheets[file.SheetNames[i]])
        temp.forEach((res) => {
            data.push(res)
        })
    }

    if(!firstColumnAsKey)
        return data;

    let dic = {};
    const firstColumnKey = Object.keys(data[0])[0];
    // console.log("first col key:",firstColumnKey);
    for(let row of data) {
        const firstValue = row[firstColumnKey];
        dic[firstValue] = row;
    }
    return dic;
}

module.exports = parseXlsx;