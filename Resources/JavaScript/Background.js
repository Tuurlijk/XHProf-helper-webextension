/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, globalstrict: true,
 latedef:true, noarg:true, noempty:true, nonew:true, undef:true, maxlen:256,
 strict:true, trailing:true, boss:true, browser:true, devel:true, jquery:true */
/*global browser, chrome, document, localStorage, tabId, changeInfo, tab, openTab, localize */

'use strict';
if (typeof browser === "undefined") {
    var browser = chrome;
}

function getSettings() {
    return {
        cookieName: localStorage.cookieName ? localStorage.cookieName : '',
        sites: localStorage.sites ? JSON.parse(localStorage.sites) : []
    };
}

function isDomainEnabled(domainList, tab) {
    if (domainList.length === 0) {
        return false;
    }
    return domainList.some(function(domain) {
        let regex = new RegExp('https?:\/\/' + domain);
        return (tab.url.match(regex) !== null);
    });
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
    browser.pageAction.setTitle({
        tabId: tabId,
        title: title
    });

    // Update image
    browser.pageAction.setIcon({
        tabId: tabId,
        path: {
            '19': '/Resources/Icons/' + image + '19.png',
            '38': '/Resources/Icons/' + image + '38.png'
        }
    });
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // We only react on a complete load of a http(s) page,
    // only then we're sure the content.js is loaded.
    if (changeInfo.status !== 'complete' || tab.url.indexOf('http') !== 0) {
        return;
    }

    let settings = getSettings();

    // Check if we have a match or don't need to match at all
    if (settings.sites.length === 0 || isDomainEnabled(settings.sites, tab)) {
        // Show the pageAction
        browser.pageAction.show(tabId);

        // Request the current status and update the icon accordingly
        browser.tabs.sendMessage(
            tabId,
            {
                cmd: 'getStatus',
                cookieName: settings.cookieName
            },
            function(response) {
                updateIcon(response.status, tabId);
            }
        );
    }
});

browser.pageAction.onClicked.addListener(function(tab) {
    let settings = getSettings();

    // Request the current status and update the icon accordingly
    browser.tabs.sendMessage(
        tab.id,
        {
            cmd: 'toggleStatus',
            cookieName: settings.cookieName
        },
        function(response) {
            updateIcon(response.status, tab.id);
        }
    );
});
