function validateArgs() {
    const validZipRegex = /^\d{5}(?:-\d{4})?$/;
    //a valid zipcode looks like "82801" or "82801-2202"
    //(ie, no need to worry about the case of "82801 2202")
    if (!process.argv[2]) {
        console.log("Error:  Please provide a zipcode");
        return false;
    } else if (!validZipRegex.test(process.argv[2])) {
        console.log("Error:  Please provide a valid zipcode");
        return false;
    } else {
        return true;
    }
}


let main = function () {
    if (validateArgs()) {
        let zipCode = process.argv[2];
        console.log(zipCode);
    } else {
        //if we had trouble parsing argv, let's just bail
        process.exit(1);
    }

};

if (require.main === module) {
    main();
}