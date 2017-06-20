let main = function(){
    let zipCode = process.argv[2];
    console.log(zipCode);

};

if (require.main === module) {
    main();
}