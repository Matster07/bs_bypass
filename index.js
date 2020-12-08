const Monitor = require("./src/Monitor")

function main() {
    new Monitor(process.argv[2]).request();
}

main();