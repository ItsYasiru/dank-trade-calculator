const converstions = {
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

    for (var i = 0; i < lines.length; i++) {
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

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i]; // x58  :Worm: Worm (⏣ 105,850)

        if (line.startsWith(" x")) {
            var parts = line.split(" "); // ['x58', '', ':Worm:', 'Worm', '(⏣', '105,850)']

            var item = parts.slice(4, parts.findIndex(x => x == "(⏣")).join(" ");
            var amount = parseInt(parts[1].replace("x", ""));

            var originalPrice = parts.slice(-1)[0];
            originalPrice = originalPrice.replace(")", "");
            originalPrice = originalPrice.replace(",", "");
            originalPrice = parseInt(originalPrice);

            result[item] = {
                "amount": amount,
                "originalPrice": originalPrice
            };
        }
        else {
            continue;
        }
    }
    return result;
}


function formatNo(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getCodeblock(fileFormat, content) {
    return "```" + `${fileFormat}\n${content}` + "```";
}

$("#calculate").click(function () {
    var itemList = $('#item-list').val();
    var priceList = $('#price-list').val();

    var items = filterItemList(itemList);
    var prices = filterPriceList(priceList);

    itemsList = [];

    var total = 0;
    var originalTotal = 0;

    var itemsFound = [], itemsNotFound = [];

    for (const [item, data] of Object.entries(items)) {
        var found = false;

        for (const [x, price] of Object.entries(prices)) {
            if (x.includes(item)) {
                found = true;

                total += data.amount * price;
                originalTotal += data.originalPrice;
                itemsFound.push(`${item} ${formatNo(data.amount)} x ${formatNo(price)} = ${formatNo(data.amount * price)} ⏣ (${formatNo(data.originalPrice)} ⏣)`);
                itemsList.push(item);
                break;
            }
        }
        if (found == false) {
            itemsNotFound.push(`${item} ${formatNo(data.amount)} x 0 = 0 ⏣ (${formatNo(data.originalPrice)} ⏣)`);
        }
    }

    if (total > 0) {
        var commands = [];
        var i, j, temporary, chunk = 10;

        // Generating trade commands
        for (i = 0, j = itemsList.length; i < j; i += chunk) {
            var command = "pls trade";

            temporary = itemsList.slice(i, i + chunk);
            for (var x = 0; x < temporary.length; x++) {
                command += ` ${items[temporary[x]].amount} ${temporary[x]}`;
            }

            if (i == 0) {
                command += ", " + total;
            }
            else {
                command += ", 1";
            }

            commands.push(command);
        }

        var output = "";
        output += `Total value of the item list, ⏣ ${formatNo(total)} (⏣ ${formatNo(originalTotal)})\n\n`;
        output += itemsFound.join("\n") + "\n\n";
        output += itemsNotFound.join("\n") + "\n\n";
        output += commands.join("\n");

        $('#output').val(output);
        $('#recipt').removeClass('hidden');

        var temp = "";
        temp += "# Total value of the item list, ⏣ " + formatNo(total) + " (⏣ " + formatNo(originalTotal) + ")\n";
        temp += "# Recipt generated by: https://itsyasiru.github.io/Dank-Trade-Calculator/\n\n";

        for (i = 0; i < itemsFound.length; i++) {itemsFound[i] = "+ " + itemsFound[i];}
        for (i = 0; i < itemsNotFound.length; i++) {itemsNotFound[i] = "- " + itemsNotFound[i];}

        temp += `${itemsFound.join("\n")}\n\n`;
        temp += `${itemsNotFound.join("\n")}`;

        var toCopyPart1 = getCodeblock("diff", temp);
        var toCopyPart2 = getCodeblock("fix", commands.join("\n"));

        var toCopy = toCopyPart1 + toCopyPart2;

        copyToClipboard(toCopy);
        alert("Recipt coppied to clipboard!");
    }
});
