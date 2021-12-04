var command = "";

var converstions = {
    "k": 1000,
    "m": 1000000
};

function copyCommand() {
    navigator.clipboard.writeText(command);
}

function convertPrice(price) {
    var result = 0;
    for (const [key, value] of Object.entries(converstions)) {
        if (price.includes(key)) {
            var amount = parseFloat(price.slice(0, price.search(key)));
            var multiplier = value;

            result = amount * multiplier;
        }
    }
    return result;
}

function filterPriceList(priceList) {
    var result = {};

    var lines = priceList.split("\n");
    var length = lines.length;

    for (var i = 0; i < length; i++) {
        var line = lines[i];

        var item = line.slice(0, line.search('-')).trim();
        var price = line.slice(line.search('-') + 2);

        price = convertPrice(price);

        result[item] = price;
    }
    return result;
}

function filterItemList(itemList) {
    var result = {};

    var lines = itemList.split("\n");
    var length = lines.length;

    for (var i = 0; i < length; i++) {
        var line = lines[i];

        var item = line.slice(line.search(": ") + 2, line.search("⏣") - 2);
        var amount = parseInt(line.slice(line.search("x") + 1, line.search(": ") - 1));

        result[item] = amount;
    }
    return result;
}


function formatNo(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$("#calculate").click(function () {
    var priceList = $('#price-list').val();
    var itemList = $('#item-list').val();

    $('#item-list').val("");

    var prices = filterPriceList(priceList);
    var items = filterItemList(itemList);

    var total = 0;
    var output = "";
    command = "";

    for (const [item, amount] of Object.entries(items)) {
        var found = false;

        for (const [x, price] of Object.entries(prices)) {
            if (x.includes(item)) {
                found = true;

                total += amount * price;
                output += `\nFound '${item}' ${formatNo(amount)} x ${formatNo(price)} = ${formatNo(amount * price)} ⏣`;
                command += ` ${amount} ${item}`;
                break;
            }
        }
        if (found == false) {
            output += `\nCouldn't find '${item}'`
        }
    }

    command = `pls trade ${command}, ${total}`;
    output = `Total value of the item list, ${formatNo(total)} ⏣ \nTrade command coppied to clipboard!\n` + output;

    $('#output').val(output);
    $('#output').removeClass('hidden');
    copyCommand();
});