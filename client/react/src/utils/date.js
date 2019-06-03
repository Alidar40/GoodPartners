const dateFormat1 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const dateFormat2 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}$/;
const dateFormat3 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{2}Z$/;
const dateFormat4 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{5}Z$/;
const dateFormat5 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[.]\d{6}Z$/;
const dateFormat6 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

function reviver(key, value) {
    if (typeof value === "string" && (dateFormat1.test(value) || dateFormat2.test(value) || dateFormat3.test(value) || dateFormat4.test(value) || dateFormat5.test(value) || dateFormat6.test(value))) {
        var date = new Date(value);

	//console.log(date.toString())
        return date.toString().substring(0, 15);
    }

    //console.log(value)
    return value;
}

export function formatJsonDateToUTC(jsonWithDate) {
    //return JSON.parse(JSON.stringify(jsonWithDate), reviver)
    return JSON.parse(jsonWithDate, reviver)
}
