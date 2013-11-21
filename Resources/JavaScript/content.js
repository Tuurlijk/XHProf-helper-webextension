/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, globalstrict: true,
 latedef:true, noarg:true, noempty:true, nonew:true, undef:true, maxlen:256,
 strict:true, trailing:true, boss:true, browser:true, devel:true, jquery:true */
/*global chrome, safari, SAFARI, openTab, Ember, DS, localize */
'use strict';

var XHProf = (function() {
    // Set a cookie
    function setCookie(name, value, hours) {
        var exp = new Date();
        exp.setTime(exp.getTime() + (hours * 60 * 60 * 1000));
        document.cookie = name + '=' + value + '; expires=' +
            exp.toGMTString() + '; path=/';
    }

    // Get the content in a cookie
    function getCookie(name) {
        // Search for the start of the goven cookie
        var prefix = name + '=',
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
        return unescape(document.cookie.substring(
            cookieStartIndex + prefix.length, cookieEndIndex));
    }

    // Remove a cookie
    function deleteCookie(name) {
        setCookie(name, null, -60);
    }

    // Public methods
    var exposed = {
        // Handles messages from other extension parts
        messageListener: function(request, sender, sendResponse) {
            var newStatus,
                idekey = 'XHProf_PROFILE';

            // Execute the requested command
            if (request.cmd === 'getStatus') {
                newStatus = exposed.getStatus(idekey);
            }
            else if (request.cmd === 'toggleStatus') {
                newStatus = exposed.toggleStatus(idekey);
            }
            else if (request.cmd === 'setStatus') {
                newStatus = exposed.setStatus(request.status, idekey);
            }

            // Respond with the current status
            sendResponse({ status: newStatus });
        },

        // Get current state
        getStatus: function(idekey) {
            var status = 0;

            if (getCookie('XHProf_PROFILE') === idekey) {
                status = 1;
            }

            return status;
        },

        // Toggle to the next state
        toggleStatus: function(idekey) {
            var nextStatus = (exposed.getStatus(idekey) + 1) % 4;
            return exposed.setStatus(nextStatus, idekey);
        },

        // Set the state
        setStatus: function(status, idekey) {
            if (status === 1) {
                // Set profiling on
                setCookie('XHProf_PROFILE', idekey, 24);
            }
            else {
                deleteCookie('XHProf_PROFILE');
            }

            // Return the new status
            return exposed.getStatus(idekey);
        }
    };

    return exposed;
})();

// Attach the message listener
chrome.runtime.onMessage.addListener(XHProf.messageListener);
