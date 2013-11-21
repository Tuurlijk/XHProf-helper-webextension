/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, globalstrict: true,
 latedef:true, noarg:true, noempty:true, nonew:true, undef:true, maxlen:256,
 strict:true, trailing:true, boss:true, browser:true, devel:true, jquery:true */
/*global chrome, safari, SAFARI, openTab, Ember, DS, localize */
'use strict';


jQuery(document).ready(function($) {

    function addItem(id, value) {
        var opt = document.createElement('option');
        document.getElementById(id).options.add(opt);
        opt.value = value;
        opt.text = value;
    }

    function restore_options() {
        var cookieName = localStorage.cookieName,
            sites = localStorage.sites;

        if (!cookieName) {
            cookieName = '_profile';
        }

        if (cookieName === '_profile' || cookieName === 'XHProf_Profile') {
            $('#cookieName').val(cookieName);
        }
        else {
            $('#cookieName').val('null');
            $('.customCookieName').fadeIn();
        }
        $('#customCookieName').val(cookieName);

        if (sites) {
            sites = JSON.parse(sites);
            for (var i = 0; i < sites.length; i++) {
                addItem('siteBox', sites[i]);
            }
        }
    }

    function save_options() {
        var cookieName = $('#cookieName').val(),
            siteBox = document.getElementById('siteBox'),
            sites = [];

        if (cookieName === 'null') {
            cookieName = $('#customCookieName').val();
        }
        localStorage.cookieName = cookieName;

        for (var i = 0; i < siteBox.length; i++) {
            sites.push(siteBox.options[i].value);
        }
        localStorage.sites = JSON.stringify(sites);
    }

    function addSite() {
        var siteText = document.getElementById('newSite').value;
        addItem('siteBox', siteText);
        save_options();
        document.getElementById('newSite').value = '';
        save_options();
    }

    function removeSelectedSite() {
        var siteBox = document.getElementById('siteBox');
        for (var i = siteBox.length - 1; i >= 0; i--) {
            if (siteBox.options[i].selected) {
                siteBox.remove(i);
            }
        }
        save_options();
    }

    $('#cookieName').change(function() {
        if ($('#cookieName').val() !== 'null') {
            $('.customCookieName').fadeOut();
        }
        else {
            $('.customCookieName').fadeIn();
        }
        save_options();
    });

    $('#customCookieName').change(function() {
        save_options();
    });

    $('#add-site').click(addSite);
    $('#remove-site').click(removeSelectedSite);
    $('#save-options').click(save_options);
    restore_options();
});
