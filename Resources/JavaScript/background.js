/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, globalstrict: true,
 latedef:true, noarg:true, noempty:true, nonew:true, undef:true, maxlen:256,
 strict:true, trailing:true, boss:true, browser:true, devel:true, jquery:true */
/*global chrome, safari, SAFARI, openTab, Ember, DS, localize */
'use strict';

function isValueInArray(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        var re = new RegExp(arr[i], 'gi');
        if (re.test(val)) {
            return true;
        }
    }
    return false;
}

function updateIcon(status, tabId) {
    // Figure the correct title/image with the given state
    var title = 'Profiling disabled',
        image = 'StopwatchDisabled';

    if (status === 1) {
        title = 'Profiling enabled';
        image = 'Stopwatch';
    }

    // Update title
    chrome.pageAction.setTitle({
        tabId: tabId,
        title: title
    });

    // Update image
    chrome.pageAction.setIcon({
        tabId: tabId,
        path: {
            '19': '/Resources/Icons/' + image + '19.png',
            '38': '/Resources/Icons/' + image + '38.png'
        }
    });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // We only react on a complete load of a http(s) page,
    // only then we're sure the content.js is loaded.
    if (changeInfo.status !== 'complete' || tab.url.indexOf('http') !== 0) {
        return;
    }

    // Prep some variables
    var sites = [],
        cookieName = '',
        match,
        domain;

    // Check if localStorage is available and get the settings out of it
    if (localStorage) {
        if (localStorage.sites) {
            sites = JSON.parse(localStorage.sites);
            cookieName = localStorage.cookieName;
        }
    }

    // Get the current domain out of the tab URL and check if it matches
    // anything in the sites array
    domain = tab.url.match(/:\/\/(.[^\/]+)/)[1];
    match = isValueInArray(sites, domain);

    // Check if we have a match or don't need to match at all
    if (match || sites.length === 0) {
        // Show the pageAction
        chrome.pageAction.show(tabId);

        // Request the current status and update the icon accordingly
        chrome.tabs.sendMessage(
            tabId,
            {
                cmd: 'getStatus',
                cookieName: cookieName
            },
            function(response) {
                updateIcon(response.status, tabId);
            }
        );
    }
});

chrome.pageAction.onClicked.addListener(function(tab) {
    var cookieName = '';

    // Check if localStorage is available and get the settings out of it
    if (localStorage) {
        if (localStorage.cookieName) {
            cookieName = localStorage.cookieName;
        }
    }

    // Request the current status and update the icon accordingly
    chrome.tabs.sendMessage(
        tab.id,
        {
            cmd: 'toggleStatus',
            cookieName: cookieName
        },
        function(response) {
            updateIcon(response.status, tab.id);
        }
    );
});
