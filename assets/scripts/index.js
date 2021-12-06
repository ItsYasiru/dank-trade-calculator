var converstions = {
    "k": 1000,
    "m": 1000000,
    "b": 1000000000,
    "t": 1000000000000,
};

function copyToClipboard(content) {
    navigator.clipboard.writeText(content);
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
    var itemList = $('#item-list').val();
    var priceList = $('#price-list').val();

    var items = filterItemList(itemList);
    var prices = filterPriceList(priceList);

    var total = 0;
    var command = "";

    var itemsFound = "";
    var itemsNotFound = "";

    for (const [item, amount] of Object.entries(items)) {
        var found = false;

        for (const [x, price] of Object.entries(prices)) {
            if (x.includes(item)) {
                found = true;

                total += amount * price;
                itemsFound += `${item} ${formatNo(amount)} x ${formatNo(price)} = ${formatNo(amount * price)} ⏣\n`;
                command += ` ${amount} ${item}`;
                break;
            }
        }
        if (found == false) {
            itemsNotFound += `${item} ${formatNo(amount)} x 0 = 0 ⏣\n`;
        }
    }

    if (total > 0) {
        command = `pls trade${command}, ${total}`;

        var output = `Total value of the item list, ${formatNo(total)} ⏣\n\n${itemsFound}\n${itemsNotFound}`;

        copyToClipboard(output);
        copyToClipboard(command);

        $('#output').val(output);
        $('#recipt').removeClass('hidden');
    }
});
