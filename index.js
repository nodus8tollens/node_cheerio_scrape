const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const currentDirectory = path.dirname(__filename);
const outputDirectory = path.join(currentDirectory, "output");

// Create directory for .txt files
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
  console.log("Directory created successfully");
} else {
  console.log("Directory already exists");
}

// URL of the website you want to scrape
const url =
  "https://www.marketsandmarkets.com/Market-Reports/intermodal-freight-transportation-market-196728664.html";

// Regex for extracting filename
const regex = /Reports\/(.*?)\-market/;
const match = url.match(regex);
const filename = match[1].split("-").join("_");
const filePath = path.join(outputDirectory, `${filename}.txt`);

// Make an HTTP request to the website
axios
  .get(url)
  .then((response) => {
    // Load the HTML content into Cheerio
    const $ = cheerio.load(response.data);
    let reportTabContent = $(".reportTabContent");

    const children = reportTabContent.find("h1, h2, h3, h4, h5, h6, p");

    // Accumulate text content in a variable
    let accumulatedContent = "SOURCE: Markets and Markets\n\n";
    children.each((index, element) => {
      accumulatedContent += $(element).text() + "\n";
    });

    // Write the accumulated content to the file
    fs.writeFileSync(filePath, accumulatedContent, (err) => {
      if (err) {
        console.error("Error creating file: ", err);
      } else {
        console.log("File created: ", filePath);
      }
    });
  })
  .catch((error) => {
    console.error("Error fetching the webpage:", error);
  });
