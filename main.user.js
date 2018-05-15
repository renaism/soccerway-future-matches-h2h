// ==UserScript==
// @name         Soccerway - Future Match Outcome Chances
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Created to help with MOSI Final Task at Telkom University
// @author       Rezza Nafi
// @include      http*://*soccerway.com/teams/comparison/?competition_ids[]=*team_ids[]=*competition_ids[]=*team_ids[]=*
// @include      http*://*soccerway.com/teams/comparison/?*
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require      https://fastcdn.org/FileSaver.js/1.1.20151003/FileSaver.min.js
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    $("#page_teams_1_block_h2hsection_head2head_3-wrapper").append(
		"<button id='calculate_h2h_percentage'>Calculate & Download Chances Data</button>"
    );
    $("div.h2h_cols.submit").append('<input type="submit" value="Show H2H"/>');
    $("div.h2h_cols.submit input:eq(0)").hide();
})();

function roundNumber(n) {
    return Math.round(n * 1e3) / 1e3;
}

$("#calculate_h2h_percentage").click(function() {
    var $table = $("table.table.compare").first(); // Find the H2H table
    var $stat = $table.find("tbody"); // The part of the table that display the stats

    // Get the general data
    var teamA = $("div.logo-wrapper.left a").text(); // Get the first team name (team A)
    var teamB = $("div.logo-wrapper.right a").text(); // Get the second team name (team B)

    var nA = parseInt($stat.find("tr:eq(0) td:eq(1)").text()); // Find the number of home matches for team A against team B
    var nB = parseInt($stat.find("tr:eq(0) td:eq(2)").text()); // Find the number of home matches for team B against team A

    var c_w_AvB, c_d_AvB, c_l_AvB;
    var c_w_BvA, c_d_BvA, c_l_BvA;

    console.log("Team A: " + teamA + ", H Matches: " + nA + " || Team B: " + teamB + ", H Matches: " + nB);

    // If the records of team A at home against team B not available
    if(!nA || nA <= 0) {
        // Distribute the chances equally
        c_w_AvB = 0.333;
        c_d_AvB = 0.334;
        c_l_AvB = 0.333;
    }
    else {
        // Team A (H) vs Team B stats
        var w_AvB = parseInt($stat.find("tr:eq(1) td:eq(1)").text()); // Find the number of wins for team A in their home against team B
        var d_AvB = parseInt($stat.find("tr:eq(2) td:eq(1)").text()); // Find the number of draws for team A in their home against team B
        var l_AvB = parseInt($stat.find("tr:eq(3) td:eq(1)").text()); // Find the number of losts for team A in their home against team B

        // Calculate the chances of the outcome in future matches (team A (H) vs team B)
        c_w_AvB = w_AvB / nA;
        c_d_AvB = d_AvB / nA;
        c_l_AvB = l_AvB / nA;
    }

    // If the records of team B at home against team A not available
    if(!nB || nB <= 0) {
        c_w_BvA = 0.333;
        c_d_BvA = 0.334;
        c_l_BvA = 0.333;
    }
    else {
        // Team B (H) vs Team A stats
        var w_BvA = parseInt($stat.find("tr:eq(1) td:eq(4)").text()); // Find the number of wins for team B in their home against team A
        var d_BvA = parseInt($stat.find("tr:eq(2) td:eq(4)").text()); // Find the number of draws for team B in their home against team A
        var l_BvA = parseInt($stat.find("tr:eq(3) td:eq(4)").text()); // Find the number of losts for team B in their home against team A

        // Calculate the chances of the outcome in future matches (team B (H) vs team A)
        c_w_BvA = w_BvA / nB;
        c_d_BvA = d_BvA / nB;
        c_l_BvA = l_BvA / nB;
    }

    if(c_w_AvB === null || c_d_AvB === null || c_l_AvB === null || c_w_BvA === null || c_d_BvA === null  || c_l_BvA === null ) {
        alert("An error happened. Collect the data manually or consult to me (Rezza)");
        return;
    }

    //Create the JSON
    var statJSON = {};
    statJSON[teamA] = {};
    statJSON[teamA][teamB] = {
        "W" : roundNumber(c_w_AvB),
        "D" : roundNumber(c_d_AvB),
        "L" : roundNumber(c_l_AvB)
    };
    statJSON[teamB] = {};
    statJSON[teamB][teamA] = {
        "W" : roundNumber(c_w_BvA),
        "D" : roundNumber(c_d_BvA),
        "L" : roundNumber(c_l_BvA)
    };

    console.log(statJSON);

    var statTEXT = JSON.stringify(statJSON);

    //Download the file
    var filename = teamA + " - " + teamB + ".json";
    var blob = new Blob([statTEXT], {
        type: "text/plain;charset=utf-8"
    });

    saveAs(blob, filename);
});
