// Add Buttons
const topicsArr = ["arts", "automobiles", "books", "business", "fashion", "food", "health", "home", "insider", "magazine", "movies", "ny region", "obituaries", "opinion", "politics", "real estate", "science", "sports", "sunday review", "technology", "theater", "t-magazine", "travel", "upshot", "us", "world"];
const topicsAttr = [];
let abstractArr = [];
let linkArr = [];

//buttons appear on page load
function showButtons() {
    $("#button-bar").empty();
    for (var i = 0; i < topicsArr.length; i++) {
        var button = $("<button>");
        button.attr("data-element", topicsAttr[i]);
        button.attr("id", "topic-button");
        button.attr("class", "btn btn-outline-primary")
        button.text(topicsArr[i]);
        $("#button-bar").append(button);
    };
};

//get rid of space in topicArr strings
function hasWhiteSpace(s) {
    return /\s/g.test(s);
}

for (let j = 0; j < topicsArr.length; j++) {
    topicsAttr.push(topicsArr[j])
    if (hasWhiteSpace(topicsArr[j])) {
        let noWhiteSpaceTopic;
        noWhiteSpaceTopic = topicsAttr[j].replace(/\s+/g, '')
        topicsAttr[j] = noWhiteSpaceTopic;
    }
}

// query for NYT API
$(document).on("click", "#topic-button", function () {
    abstractArr = [];
    linkArr = [];
    $("#dynNYT").empty();
    $("#senNYT").empty();
    $("#gifNYT").empty();


    const apiKey = "UA8uSAgssGj8XdWmpw2aN3UOEEBviYiJ";
    const topic = $(this).attr("data-element");
    const queryNYT = "https://api.nytimes.com/svc/topstories/v2/" + topic + ".json?api-key=" + apiKey;

    $.ajax({
        url: queryNYT,
        method: "GET"
    }).then(function (response) {

        console.log("NYT API worked");

        $("#welcome").remove();
        //abstract is the headline in json
        for (const item in response.results) {
            abstractArr.push(response.results[item].abstract);
            linkArr.push(response.results[item].url);
        }

        nytArr = [];
        nytLink = [];

        nytArr.push(abstractArr[0], abstractArr[1], abstractArr[2]);
        nytLink.push(linkArr[0], linkArr[1], linkArr[2])

        // Call Twinword API for every string sent to it
        for (let i = 0; i < nytArr.length; i++) {
            // Twinword Sentiment Analysis API
            const settings = {
                "async": true,
                "crossDomain": true,
                "url": "https://twinword-sentiment-analysis.p.rapidapi.com/analyze/",
                "method": "POST",
                "headers": {
                    "x-rapidapi-host": "twinword-sentiment-analysis.p.rapidapi.com",
                    "x-rapidapi-key": "ee17b152f8msh2255cbce79fae02p1d4262jsn63775420543c",
                    "content-type": "application/x-www-form-urlencoded"
                },
                "data": {
                    // Give this value of information from NYT API
                    "text": nytArr[i]
                }
            }

            $.ajax(settings).done(function (response) {
                // Extract positive, neutral, negative string to add to emotion coloumn
                const sentimentAnalysis = response.type
                const keywords = response.keywords[i].word;
                console.log(response)

                // feed GIPHY API response.type string
                let queryURL = "https://api.giphy.com/v1/gifs/random?api_key=BkaUZZWcFij6J7AoQj3WtPb1R2p9O6V9&tag=" + keywords;
                let GiphyLink;

                $.ajax({
                    url: queryURL,
                    method: "GET"
                }).then(function (response) {
                    // store image link to GiphyLink
                    GiphyLink = response.data.images.downsized_large.url;
                    // have GIPHY shown on the columns
                    addItems(nytArr[i], nytLink[i], sentimentAnalysis, GiphyLink);
                });
            });
        }
    });
});

// add Articles to DOM
function addItems(nytHeader, nytLink, SentimentAnalysis, GiphyLink) {

    var nyt = $("<div id='nytBox'><a href='" + nytLink + "' target='_blank'>'" + nytHeader + "</a>");
    var sen = $("<div id='senBox'>");
    var gifBox = $("<div id='gifBox'>");

    var emotionTd = sen.html(SentimentAnalysis);
    var giphyTd = gifBox.html("<img src=" + GiphyLink + ">");

    $("#dynNYT").append(nyt);
    $("#senNYT").append(emotionTd);
    $("#gifNYT").append(giphyTd);
}

//improvements to make: instead of appending to previous results on new clicks, remove previous

showButtons();