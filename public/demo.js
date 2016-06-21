/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

$(document).ready(function() {
    var modelList = '';
    var pageDomain = '';
    var sourceList = [];
    var sourceLangSelect = 'Choose Language';
    var langAbbrevList = [];

    // Update input-output dropdown based on selected domain
    $("input:radio[name=group1]").click(function() {
        sourceList = [];
        pageDomain = $(this).val();

        // Reset all the values when domain is changed
        $('#resetSpan').trigger('click');

        // Autodetect language option
        $("#ulSourceLang").append('<li role="presentation"><a role="menuitem" tabindex="-1" >Detect Language</a></li>');
        // Update language array based on domain
        for (var x in modelList) {
            for (var y in modelList[x]) {
                var sourceVal = '';
                var targetVal = '';
                // if model has the domain property then add the language in dropdown list. Otherwise add 'news' domain to JSON model list
                if (!(modelList[x][y].hasOwnProperty("domain"))) {
                    modelList[x][y].domain = 'news';
                    //console.log('no domain');
                }
                var modelListDomain = modelList[x][y].domain.toString();
                //console.log(modelListDomain.toLowerCase() + ' DOMAIN ' + pageDomain.toString().toLowerCase() );
                if (modelListDomain.toLowerCase() === pageDomain.toString().toLowerCase()) {
                    sourceVal = getLanguageName(modelList[x][y].source);
                    targetVal = getLanguageName(modelList[x][y].target);
                    sourceList.push({
                        source: sourceVal,
                        target: targetVal
                    });
                    //console.log("source" + sourceVal + "target" + targetVal);
                }
            }
        }

        // Update Input Dropdown Menu with Source Language
        $("#ulSourceLang").html('');
        $("#ulSourceLang").append('<li role="presentation"><a role="menuitem" tabindex="-1" >Detect Language</a></li>');
        $("#ulTargetLang").html('');
        fillInDropdown('ulSourceLang');
    });

    // Get list of Models after getting languages
    $.ajax({
            type: 'GET',
            url: "/api/models",
            async: true
        })
        .done(function(data) {
            //console.log(data + " response received");
            modelList = data;

            // Get list of languages
            $.ajax({
                    type: 'GET',
                    url: "/api/identifiable_languages",
                    async: true
                })
                .done(function(data) {
                    //console.log(data);
                    langAbbrevList = data;
                    // select news option in domain and update dropdown with language selections
                    $("input:radio[name=group1]:nth(1)").prop("checked", true).trigger("click");
                })
                .fail(function(jqXHR, statustext, errorthrown) {
                    //console.log(statustext + errorthrown + ' error');
                });
        })
        .fail(function(jqXHR, statustext, errorthrown) {
            console.log(statustext + errorthrown);
        });

    // Update dropdown Menu Input value with source lang selected
    $('#ulSourceLang').on('click', 'a', function(e) {
        e.preventDefault();
        sourceLangSelect = $.trim($(this).text());
        //console.log('click href ' + sourceLangSelect);
        $("#dropdownMenuInput").html('').html(sourceLangSelect + '<span class="caret"></span>');
        $('#demoSubmit').attr("disabled", false);

        // if Choose lang or detect lang is selected again then send request for lang id service
        if (sourceLangSelect.toLowerCase().indexOf("language") >= 0) {
            if (parseInt($('#home textarea').val().length) > 0) {
                doneTyping();
            }
        }
        updateOutputDropdownMenu();
        getTranslation();
    });

    // Update dropdown Menu Output value with target lang selected
    $('#ulTargetLang').on('click', 'a', function(e) {
        e.preventDefault();
        //console.log('click href ' + $(this).text());
        $("#dropdownMenuOutput").html('').html($(this).text() + '<span class="caret"></span>');
        getTranslation();
    });

    // Lang Service - Start - This set send request for lang service to detect language
    // setup timer value for function
    var typingTimer; //timer identifier
    var doneTypingInterval = 1000; //time in ms, 1 second

    // on keyup, start the countdown
    $('#home textarea').keyup(function() {
        // if textarea is empty the reset value of textarea
        if (parseInt($('#home textarea').val().length) <= 0) {
            $('#home2 textarea').val('');
            $('#profile textarea').val('');
            $('#profile2 textarea').val('');

            if ((sourceLangSelect.toLowerCase() === 'detect language') || (sourceLangSelect.toLowerCase() === 'choose language')) {
                $("#dropdownMenuInput").html('').html('Choose Language <span class="caret"></span>');
                $("#dropdownMenuOutput").html('').html('Choose Language <span class="caret"></span>');
            }
        }
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTyping, doneTypingInterval);

    });

    // on keydown, clear the countdown
    $('#home textarea').keydown(function() {
        clearTimeout(typingTimer);
    });
    // Lang Service - End here

    // Reset all the values on page
    $('#resetSpan').click(function(e) {
        e.preventDefault();
        $("#dropdownMenuInput").html('').html('Choose Language <span class="caret"></span>');
        $("#dropdownMenuOutput").html('').html('Choose Language <span class="caret"></span>');
        $('#demoSubmit').attr("disabled", false);
        $('#home textarea').val('');
        $('#home2 textarea').val('');
        $('#profile textarea').val('');
        $('#profile2 textarea').val('');
        sourceLangSelect = 'Choose Language';
    });

    // Translation form is submitted
    $("#demoSubmit").button().click(function() {
        //var modelId = '';
        // Validations
        if ($("input:radio[name='group1']").is(":checked")) {
            var pageDomain = $("input:radio[name=group1]:checked").val();
        } else {
            alert('Select Domain.');
            return false;
        }

        if (($("#dropdownMenuInput").text()).toLowerCase().indexOf("language") < 0) {
            var source = getLanguageCode($.trim($("#dropdownMenuInput").text()));
            //console.log(source + '  source ');
        } else {
            alert('Select Input Language.');
            return false;
        }

        if (($("#dropdownMenuOutput").text()).toLowerCase().indexOf("language") < 0) {
            var target = getLanguageCode($.trim($("#dropdownMenuOutput").text()));
        } else {
            alert('Select Output Language.');
            return false;
        }

        var textContent = $('#home textarea').val();
        if (textContent === '') {
            alert('Input Text cannot be empty.');
            $("#dropdownMenuOutput").focus();
            return false;
        }

        for (var x in modelList) {
            for (var y in modelList[x]) {
                // Get modal_id for AJAX call
                if (modelList[x][y].hasOwnProperty("domain")) {
                    var modelListDomain = modelList[x][y].domain.toString();
                    if ((modelListDomain.toLowerCase() === pageDomain.toString().toLowerCase()) && source === modelList[x][y].source && target === modelList[x][y].target) {
                        modelId = modelList[x][y].model_id;
                    }
                }
            }
        }

        // If model is not found then check the language translator
        if (modelId === '') {
            alert('Select correct translation language.');
            $('#dropdownMenuOutput').focus();
            return false;
        }

        //console.log('source-' + source + '  target-' + target + '   textContent-' + textContent);

        // Create call for AJAX and to populate REST API tab
        var callData = {
            text: textContent,
            source: source,
            target: target
        };

        var restAPICall = {
            type: 'POST',
            url: "/api/translate",
            data: callData,
            headers: {
                'X-WDC-PL-OPT-OUT': $('input:radio[name=serRadio]:radio:checked').val()
            },
            async: true
        };

        $('#profile textarea').val(JSON.stringify(callData, null, 2));

        $.ajax(restAPICall)
            .done(function(data) {
                //console.log(data['translations'][0]['translation'] + " translation");
                $('#home2 textarea').val(data['translations'][0]['translation']);
                $('#profile2 textarea').val(JSON.stringify(data, null, 2));
            })
            .fail(function(jqXHR, statustext, errorthrown) {
                console.log(statustext + errorthrown);
            });
    });
    // Translation submit till here

    /* -------------------------------- Functions start from here ---------------------------------------- */

    // user is "finished typing," send for service request
    function doneTyping() {
        //console.log('done typing - ' + $('#home textarea').val() + ' SourceLangSelect ' + sourceLangSelect.toLowerCase());
        // if option selected for dropdown is detect or choose language then send request for service to get lang-id
        if (((sourceLangSelect.toLowerCase() === 'detect language') || (sourceLangSelect.toLowerCase() === 'choose language')) && (parseInt($('#home textarea').val().length) > 0)) {
            // Create call for AJAX and to get Lang-Id for text
            var restAPICall = {
                type: 'POST',
                url: "/api/identify",
                data: {
                    textData: $('#home textarea').val()
                },
                async: true
            };

            var oldSrcLang = $('#dropdownMenuInput').html();
            $('#dropdownMenuInput').html('detecting language...');
            $.ajax(restAPICall)
                .done(function(data) {
                    //console.log(data + "  data " + langAbbrevList[data]);
                    var langIdentified = false;
                    //console.log("detected language code is " + data);
                    data = data.languages[0].language
                    var dataLangName = getLanguageName(data);
                    //console.log("detected language as " + dataLangName);
                    $.each(sourceList, function(index, value) {
                        //console.log(value.source + ' source value ' +  getLanguageName(data));
                        if (value.source == dataLangName) {
                            langIdentified = true;
                        }
                    });

                    if (langIdentified) {
                        //console.log('lang identified');
                        $('#demoSubmit').attr("disabled", false);
                        // If souce lang is same as identified land then add in dropdown Input menu
                        $("#dropdownMenuInput").html('').html(dataLangName + ' <span class="caret"></span>');
                    } else {
                        //console.log('lang not identified');
                        $('#demoSubmit').attr("disabled", true);
                        $("#dropdownMenuInput").html('').html(dataLangName + ': not supported for this domain <span class="caret"></span>');
                    }
                    // update outputDropDown only when the detected source changed
                    if (oldSrcLang != $('#dropdownMenuInput').html())
                        updateOutputDropdownMenu();
                    getTranslation();
                })
                .always(function(data) {
                    //console.log('gettranslation');
                    getTranslation()
                })
                .fail(function(jqXHR, statustext, errorthrown) {
                    $('#dropdownMenuInput').html(oldSrcLang);
                    console.log(statustext + errorthrown);
                });
        } else {
            //console.log('gettranslation  not in if');
            getTranslation()
        }
    }

    // get Language Name from abbreviation
    function getLanguageName(langAbbrev) {
        var test = langAbbrevList.languages;
        for (var i = 0; i < test.length; i++) {
            //console.log ('length ' + langAbbrev.length);
            var langString = (langAbbrev.length == 2) ? test[i].language.substring(0, 2) : test[i].language;
            //console.log(langString + '   ggg   ' + langAbbrev);
            if (langString == langAbbrev) {
                //console.log('   return   ' + test[i].name);
                return test[i].name;
            }
        }
        return langAbbrev;
    }

    // get abbreviation of language from Name
    function getLanguageCode(langName) {
        var test = langAbbrevList.languages;
        for (var i = 0; i < test.length; i++) {
            //console.log(test[i].name + '  dd   '+ langName);
            if (test[i].name == langName) {
                return test[i].language;
            }
        }
        return langName;
    }

    // Fill in dropdown menu
    function fillInDropdown(ulName) {
        $.each(sourceList, function(index, value) {
            if ($("#" + ulName + ' li:contains("' + value.source + '")').length) {
                console.log('source lang already exist in li list');
            } else {
                $("#" + ulName).append('<li role="presentation"><a role="menuitem" tabindex="-1" >' + value.source + '</a></li>');
            }
        });
    }

    function updateOutputDropdownMenu() {
        $("#ulTargetLang").html('');
        $("#dropdownMenuOutput").html('').html('Choose Language <span class="caret"></span>');

        // Update output dropdown menu with target language
        $.each(sourceList, function(index, value) {
            //console.log(value.source + ' source value ' +  $("#dropdownMenuInput").text());
            if (value.source == $.trim($("#dropdownMenuInput").text())) {
                if (!($("#ulTargetLang li:contains('" + value.target + "')").length)) {
                    //console.log('source lang already exist in li list');
                    //}
                    //else {
                    $("#ulTargetLang").append('<li role="presentation"><a role="menuitem" tabindex="-1" >' + value.target + '</a></li>');
                }
            }
        });

        if ($("#ulTargetLang li").length == 1) {
            $("#dropdownMenuOutput").html('').html($($('#ulTargetLang a')).text() + '<span class="caret"></span>');
        }
    }

    // Send request to translate service if input-output and textarea have values
    function getTranslation() {
            var pageDomain = '';
            var source = '';
            var target = '';
            var textContent = '';
            var modelId = '';

            if ($("input:radio[name='group1']").is(":checked")) {
                pageDomain = $("input:radio[name=group1]:checked").val();
            }

            if (($("#dropdownMenuInput").text()).toLowerCase().indexOf("language") < 0) {
                source = getLanguageCode($.trim($("#dropdownMenuInput").text()));
            }

            if (($("#dropdownMenuOutput").text()).toLowerCase().indexOf("language") < 0) {
                target = getLanguageCode($.trim($("#dropdownMenuOutput").text()));
            }

            if ((parseInt($('#home textarea').val().length) > 0)) {
                textContent = $('#home textarea').val();
            }

            // get model_id from domain, source and target
            var model_id = getModelId(pageDomain, source, target);

            if (pageDomain && source && target && textContent && model_id) {
                //console.log('source-' + source + '  target-' + target + '   textContent-' + textContent);

                // Create call for AJAX and to populate REST API tab
                var callData = {
                    model_id: model_id,
                    text: textContent
                };

                var restAPICall = {
                    type: 'POST',
                    url: "/api/translate",
                    data: callData,
                    dataType: "json",
                    headers: {
                        'X-WDC-PL-OPT-OUT': $('input:radio[name=serRadio]:radio:checked').val()
                    },
                    async: true
                };

                $('#profile textarea').val(JSON.stringify(callData, null, 2));
                $('#home2 textarea').val('translating...');

                $.ajax(restAPICall)
                    .done(function(data) {
                        $('#home2 textarea').val(data['translations'][0]['translation']);
                        $('#profile2 textarea').val(JSON.stringify(data, null, 2));
                    })
                    .fail(function(jqXHR, statustext, errorthrown) {
                        $('#home2 textarea').val('translation error');
                        console.log(statustext + errorthrown);
                    });
            } else {
                console.log('not all values' + 'source- ' + source + '  target- ' + target + '   textContent- ' + textContent + ' model_id - ' + model_id);
            }
        } // get Translation end here

    // Get model_id from domain, source , target
    function getModelId(pageDomain, source, target) {
        var modelId = '';
        for (var x in modelList) {
            for (var y in modelList[x]) {
                if (modelList[x][y].hasOwnProperty("domain")) {
                    var modelListDomain = modelList[x][y].domain.toString();
                    if ((modelListDomain.toLowerCase() === pageDomain.toString().toLowerCase()) && source === modelList[x][y].source && target === modelList[x][y].target) {
                        modelId = modelList[x][y].model_id;
                        return modelId;
                    }
                }
            }
        }
        return modelId;
    }

});
