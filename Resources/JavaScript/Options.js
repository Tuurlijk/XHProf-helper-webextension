/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, globalstrict: true,
 latedef:true, noarg:true, noempty:true, nonew:true, undef:true, maxlen:256,
 strict:true, trailing:true, boss:true, browser:true, devel:true, jquery:true */
/*global browser, document, localStorage, safari, SAARI, openTab, DS, localize */

'use strict';

document.addEventListener('DOMContentLoaded', function() {

    function saveOptions() {
        let cookieName = document.getElementById('cookieName').value,
            sites = [];

        if (cookieName === '') {
            cookieName = document.getElementById('customCookieName').value;
        }
        localStorage.cookieName = cookieName;

        document.getElementById('domains').childNodes.forEach(function(domain) {
            sites.push(domain.textContent);
        });
        localStorage.sites = JSON.stringify(sites);
    }

    function removeElement(element) {
        element.remove();
        saveOptions();
    }

    function addElement(element, newElementId, containerID) {
        if (element === '') {
            return;
        }

        let closeButton = document.createElement('span'),
            label = document.createElement('span'),
            elementText;

        elementText = document.createTextNode(element);
        closeButton.classList.add('aui-icon', 'aui-icon-close');
        label.classList.add('aui-label', 'aui-label-closeable');
        label.appendChild(elementText);
        label.appendChild(closeButton);

        document.getElementById(containerID).appendChild(label);
        closeButton.addEventListener('click', function(event) {
            removeElement(event.target.parentNode);
        });

        document.getElementById(newElementId).value = '';
        saveOptions();
    }

    function restoreOptions() {
        document.getElementById('cookieName').value = '';
        document.getElementById('customCookieName').value = localStorage.cookieName || '';

        let sites = localStorage.sites ? JSON.parse(localStorage.sites) : [];
        sites.forEach(function(domain) {
            addElement(domain, 'newDomain', 'domains');
        });
    }

    document.getElementById('cookieName').addEventListener('change', function() {
        document.getElementById('customCookieName').value = document.getElementById('cookieName').value;
        saveOptions();
    });
    document.getElementById('customCookieName').addEventListener('change', function() {
        saveOptions();
    });
    document.getElementById('customCookieName').addEventListener('keyup', function(event) {
        saveOptions();
    });

    document.getElementById('addDomain').addEventListener('click', function() {
        addElement(document.getElementById('newDomain').value, 'newDomain', 'domains');
    });
    document.getElementById('newDomain').addEventListener('keyup', function(event) {
        if (event.keyCode === 13) {
            addElement(event.target.value, 'newDomain', 'domains');
        }
    });
    restoreOptions();
});
