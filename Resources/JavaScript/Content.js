/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, globalstrict: true,
 latedef:true, noarg:true, noempty:true, nonew:true, undef:true, maxlen:256,
 strict:true, trailing:true, boss:true, browser:true, devel:true, jquery:true */
/*global browser, chrome, document, localStorage, tabId, changeInfo, tab, openTab, localize */

'use strict';
if (typeof browser === "undefined") {
    var browser = chrome;
}

let XHProf = (function() {
    // Set a cookie
    function setCookie(name, value, hours) {
        let exp = new Date();
        exp.setTime(exp.getTime() + (hours * 60 * 60 * 1000));
        document.cookie = name + '=' + value + '; expires=' +
            exp.toGMTString() + '; path=/';
    }

    // Get the content in a cookie
    function getCookie(name) {
        // Search for the start of the goven cookie
        let prefix = name + '=',
            cookieStartIndex = document.cookie.indexOf(prefix),
            cookieEndIndex;

        // If the cookie is not found return null
        if (cookieStartIndex === -1) {
            return null;
        }

        // Look for the end of the cookie
        cookieEndIndex =
            document.cookie.indexOf(';', cookieStartIndex + prefix.length);
        if (cookieEndIndex === -1) {
            cookieEndIndex = document.cookie.length;
        }

        // Extract the cookie content
        return decodeURIComponent(document.cookie.substring(
            cookieStartIndex + prefix.length, cookieEndIndex));
    }

    // Remove a cookie
    function deleteCookie(name) {
        setCookie(name, null, -60);
    }

    // Public methods
    let exposed = {
        // Handles messages from other extension parts
        messageListener: function(request, sender, sendResponse) {
            let newStatus,
                cookieName = '_profile';

            if (request.cookieName !== '') {
                cookieName = request.cookieName;
            }

            // Execute the requested command
            if (request.cmd === 'getStatus') {
                newStatus = exposed.getStatus(cookieName);
            }
            else if (request.cmd === 'toggleStatus') {
                newStatus = exposed.toggleStatus(cookieName);
            }
            else if (request.cmd === 'setStatus') {
                newStatus = exposed.setStatus(request.status, cookieName);
            }

            // Respond with the current status
            sendResponse({status: newStatus});
        },

        // Get current state
        getStatus: function(cookieName) {
            let status = 0;
            if (getCookie(cookieName) === '1') {
                status = 1;
            }
            return status;
        },

        // Toggle to the state
        toggleStatus: function(cookieName) {
            let state = exposed.getStatus(cookieName);
            state = 1 - state;
            return exposed.setStatus(state, cookieName);
        },

        // Set the state
        setStatus: function(status, cookieName) {
            if (status === 1) {
                // Set profiling on
                setCookie(cookieName, 1, 24);
            }
            else {
                deleteCookie(cookieName);
            }

            // Return the new status
            return exposed.getStatus(cookieName);
        }
    };

    return exposed;
})();

// Attach the message listener
browser.runtime.onMessage.addListener(XHProf.messageListener);
