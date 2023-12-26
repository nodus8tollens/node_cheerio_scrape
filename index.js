//INSTALL NODE
//INSTALL NPM
//RUN WITH "node index.js"

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const currentDirectory = path.dirname(__filename);
const outputDirectory = path.join(currentDirectory, "output");

//Create directory for .txt files
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
  console.log("Directory created successfully");
} else {
  console.log("Directory already exists");
}

// URL of the website you want to scrape
const url =
  "https://www.marketsandmarkets.com/Market-Reports/contact-center-software-market-257044641.html";
//Regex for extracting filename
const regex = /Reports\/(.*?)\-market/;
const match = url.match(regex);
const filename = match[1].split("-").join("_");
// Make an HTTP request to the website
axios
  .get(url)
  .then((response) => {
    // Load the HTML content into Cheerio
    const $ = cheerio.load(response.data);

    //First Paragraph Content
    const marketValueParagraph = $(".reportTabContent")
      .children()
      .first()
      .text()
      .trim(); //Good

    //Create output file and write first paragraph (add title/keyword for paragraph)
    const filePath = outputDirectory + `/${filename}.txt`;
    fs.writeFile(filePath, "MARKET VALUE: \n" + marketValueParagraph, (err) => {
      if (err) {
        console.error("Error creating file: ", err);
      } else {
        console.log("File created: ", filePath);
      }
    });

    //console.log(firstParagraph);

    // Find the <h4> elements with specific content
    const marketDynamicsH3 = $('h3:contains("Market Dynamics")');
    const restraintH4 = $('h4:contains("Restraint:")');

    // Find the <p> elements between the two <h4> elements
    const drivers = marketDynamicsH3.next().next();
    drivers.each((index, element) => {
      //Append content
      fs.appendFile(
        filePath,
        "\nDRIVERS: \n" + $(element).text().trim(),
        (err) => {
          if (err) {
            console.error("Error creating file: ", err);
          } else {
            console.log("File created: ", filePath);
          }
        }
      );
      //console.log("DRIVERS: ", $(element).text().trim());
    }); //Good

    const ecosystemH3 = $('h3:contains("Ecosystem")');
    const playersH3 = $('h3:contains("Players:")');
    const segments = ecosystemH3.nextUntil(playersH3, "h4");
    segments.each((index, element) => {
      //Append content
      fs.appendFile(
        filePath,
        "\nSEGMENTS: \n" + $(element).text().trim(),
        (err) => {
          if (err) {
            console.error("Error creating file: ", err);
          } else {
            console.log("File created: ", filePath);
          }
        }
      );
      //console.log("SEGMENTS: ", $(element).text().trim());
    });
    //Get the paragraph about key market players
    const marketPlayersH3 = $('h3:contains("Market Players")');
    const marketPlayersParagraph = marketPlayersH3.next();
    fs.appendFile(
      filePath,
      "\nKEY MARKET PLAYERS: \n" + marketPlayersParagraph.text().trim(),
      (err) => {
        if (err) {
          console.error("Error creating file: ", err);
        } else {
          console.log("File created: ", filePath);
        }
      }
    );
    //console.log("MARKET PLAYERS: ", marketPlayersParagraph.text().trim());

    // Print the extracted titles
    //console.log("Titles:", titles);
  })
  .catch((error) => {
    console.error("Error fetching the webpage:", error);
  });
