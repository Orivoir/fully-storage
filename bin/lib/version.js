module.exports = function() {

    console.log(
        chalk`\n\t{bold.cyan full-storage} version {bold.green ${pkg.version} }\n\n\tAuthor {bold.cyan ${pkg.author}}\n`
    );

    process.exit( null );
}