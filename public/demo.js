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
/*eslint no-native-reassign: "off"*/
'use strict';

$(document).ready(function () {
  var modelList = [];
  var pageDomain = '';
  var sourceList = [];
  var sourceLangSelect = 'Choose Language';
  var langAbbrevList = [];
  var nmtValue  = '2018-05-01';

  // Update input-output dropdown based on selected domain
  $('input:radio[name=group1]').click(function () {
    sourceList = [];
    pageDomain = $(this).val();

    // Reset all the values when domain is changed
    $('#resetSpan').trigger('click');

    // Autodetect language option
    $('#ulSourceLang').append('<li role="presentation"><a role="menuitem" tabindex="-1" >Detect Language</a></li>');
    // Update language array based on domain

    for (var y in modelList) {
      var sourceVal = '';
      var targetVal = '';
      // if model has the domain property then add the language in dropdown list. Otherwise add 'news' domain to JSON model list
      if (!(modelList[y].hasOwnProperty('domain'))) {
        modelList[y].domain = 'general';
        //console.log('no domain');
      }
      var modelListDomain = modelList[y].domain.toString();
      //console.log(modelListDomain.toLowerCase() + ' DOMAIN ' + pageDomain.toString().toLowerCase() );
      if (modelListDomain.toLowerCase() === pageDomain.toString().toLowerCase()) {
        sourceVal = getLanguageName(modelList[y].source);
        targetVal = getLanguageName(modelList[y].target);
        sourceList.push({
          source: sourceVal,
          target: targetVal
        });
        //console.log("source" + sourceVal + "target" + targetVal);
      }
    }

    // Sort by source then target ,so source languages are sorted in dropdown 
    sourceList.sort(function(a,b) {
      return (a.source > b.source) ? 1 : ((b.source > a.source) ? -1 :
        ( a.target < b.target ? -1 : a.target > b.target ? 1 : 0)); 
    });

    // Update Input Dropdown Menu with Source Language
    $('#ulSourceLang').html('');
    $('#ulSourceLang').append('<li role="presentation"><a role="menuitem" tabindex="-1" >Detect Language</a></li>');
    $('#ulTargetLang').html('');
    fillInDropdown('ulSourceLang');
  });

  // Get list of Models after getting languages
  $.ajax({
    type: 'GET',
    url: '/api/models',
    headers: {
      'X-Watson-Technology-Preview': nmtValue
    },
    async: true
  })
    .done(function (data) {
      //console.log(data + " response received");
      modelList = data.models;

      // Get list of languages
      $.ajax({
        type: 'GET',
        url: '/api/identifiable_languages',
        headers: {
          'X-Watson-Technology-Preview': nmtValue
        },
        async: true
      })
        .done(function (data) {
          //console.log("demo.js identifiable",data);
          langAbbrevList = data.languages;
          // select news option in domain and update dropdown with language selections
          $('input:radio[name=group1]:nth(1)').prop('checked', true).trigger('click');
        });
    })
    .fail(function (jqXHR, statustext, errorthrown) {
      console.log(statustext + errorthrown);
    });

  // Update dropdown Menu Input value with source lang selected
  $('#ulSourceLang').on('click', 'a', function (e) {
    e.preventDefault();
    sourceLangSelect = $.trim($(this).text());
    //console.log('click href ' + sourceLangSelect);
    $('#dropdownMenuInput').html('').html(sourceLangSelect + '<span class="caret"></span>');

    // if Choose lang or detect lang is selected again then send request for lang id service
    if (sourceLangSelect.toLowerCase().indexOf('language') >= 0) {
      if (parseInt($('#home textarea').val().length) > 0) {
        doneTyping();
      }
    }
    updateOutputDropdownMenu();
    getTranslation();
  });

  // Update dropdown Menu Output value with target lang selected
  $('#ulTargetLang').on('click', 'a', function (e) {
    e.preventDefault();
    //console.log('click href ' + $(this).text());
    $('#dropdownMenuOutput').html('').html($(this).text() + '<span class="caret"></span>');
    getTranslation();
  });

  // Lang Service - Start - This set send request for lang service to detect language
  // setup timer value for function
  var typingTimer; //timer identifier
  var doneTypingInterval = 1000; //time in ms, 1 second

  // on keyup, start the countdown
  $('#home textarea').keyup(function () {
    // if textarea is empty the reset value of textarea
    if (parseInt($('#home textarea').val().length) <= 0) {
      $('#home2 textarea').val('');
      $('#profile textarea').val('');
      $('#profile2 textarea').val('');

      if ((sourceLangSelect.toLowerCase() === 'detect language') || (sourceLangSelect.toLowerCase() === 'choose language')) {
        $('#dropdownMenuInput').html('Choose Language <span class="caret"></span>');
        $('#dropdownMenuOutput').html('Choose Language <span class="caret"></span>');
      }
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);

  });

  // on keydown, clear the countdown
  $('#home textarea').keydown(function () {
    clearTimeout(typingTimer);
  });
  // Lang Service - End here

  // Reset all the values on page
  $('#resetSpan').click(function (e) {
    e.preventDefault();
    $('#dropdownMenuInput').html('Choose Language <span class="caret"></span>');
    $('#dropdownMenuOutput').html('Choose Language <span class="caret"></span>');
    $('#home textarea').val('');
    $('#home2 textarea').val('');
    $('#profile textarea').val('');
    $('#profile2 textarea').val('');
    sourceLangSelect = 'Choose Language';
  });

  /* -------------------------------- Functions start from here ---------------------------------------- */

  // user is "finished typing," send for service request
  function doneTyping() {
    //console.log('done typing - ' + $('#home textarea').val() + ' SourceLangSelect ' + sourceLangSelect.toLowerCase());
    // if option selected for dropdown is detect or choose language then send request for service to get lang-id
    if (((sourceLangSelect.toLowerCase() === 'detect language') || (sourceLangSelect.toLowerCase() === 'choose language')) && (parseInt($('#home textarea').val().length) > 0)) {
      // Create call for AJAX and to get Lang-Id for text
      var restAPICall = {
        type: 'POST',
        url: '/api/identify',
        headers: {
          'X-Watson-Technology-Preview': nmtValue
        },
        data: {
          text: $('#home textarea').val()
        },
        async: true
      };

      var oldSrcLang = $('#dropdownMenuInput').html();
      $('#dropdownMenuInput').html('detecting language...');
      $.ajax(restAPICall)
        .done(function (data) {
          //console.log(data + "  data " + langAbbrevList[data]);
          var langIdentified = false;
          //console.log("detected language code is " + data);
          data = data.languages[0].language;
          var dataLangName = getLanguageName(data);
          //console.log("detected language as " + dataLangName);
          $.each(sourceList, function (index, value) {
            //console.log(value.source + ' source value ' +  getLanguageName(data));
            if (value.source == dataLangName) {
              langIdentified = true;
            }
          });

          if (langIdentified) {
            //console.log('lang identified');
            // If souce lang is same as identified land then add in dropdown Input menu
            $('#dropdownMenuInput').html('').html(dataLangName + ' <span class="caret"></span>');
          } else {
            //console.log('lang not identified');
            $('#dropdownMenuInput').html('').html(dataLangName + ': not supported for this domain <span class="caret"></span>');
          }
          // update outputDropDown only when the detected source changed
          if (oldSrcLang != $('#dropdownMenuInput').html())
            updateOutputDropdownMenu();
          getTranslation();
        })
        .always(function () {
          getTranslation();
        })
        .fail(function (jqXHR, statustext, errorthrown) {
          $('#dropdownMenuInput').html(oldSrcLang);
          console.log(statustext + errorthrown);
        });
    } else {
      //console.log('gettranslation  not in if');
      getTranslation();
    }
  }

  // get Language Name from abbreviation
  function getLanguageName(langAbbrev) {
    // the /models endpoint doesn't include names, and the /identifiable_languages endpoint doesn't include Egyptian Arabic
    // so it's hard-coded for now
    if (langAbbrev === 'arz') {
      return 'Egyptian Arabic';
    }
    if (langAbbrev === 'zht') {
      return 'Traditional Chinese';
    }
    var test = langAbbrevList;
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
    // the /models endpoint doesn't include names, and the /identifiable_languages endpoint doesn't include Egyptian Arabic and Catalan
    // so it's hard-coded for now
    if (langName === 'Egyptian Arabic') {
      return 'arz';
    }
    if (langName === 'Catalan') {
      return 'ca';
    }
    var test = langAbbrevList;
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
    $.each(sourceList, function (index, value) {
      var exists = false;
      // Look for source value in drop down list
      $('#' + ulName).find('a').each(function() {
        if ($(this).text() == value.source) {
          exists = true;
          return false;  // exit the loop when match is found
        }
      });
      // Create new list item if source value was not in select list
      if (!exists) {
        $('#' + ulName).append('<li role="presentation"><a role="menuitem" tabindex="-1" >' + value.source + '</a></li>');
      }
      else {
        console.log(value.source,'source lang already exist in li list');
      }
    });
  }

  function updateOutputDropdownMenu() {
    var exists;
    $('#ulTargetLang').html('');
    $('#dropdownMenuOutput').html('').html('Choose Language <span class="caret"></span>');

    // Update output dropdown menu with target language
    $.each(sourceList, function (index, value) {
      if (value.source == $.trim($('#dropdownMenuInput').text())) {
        exists = false;
        // Look for target value in drop down list
        $('#ulTargetLang').find('a').each(function() {
          if ($(this).text() == value.target) {
            exists = true;
            return false;  // exit the loop when match is found
          }
        });
        // Create new list item if source value was not in select list
        if (!exists) {
          $('#ulTargetLang').append('<li role="presentation"><a role="menuitem" tabindex="-1" >' + value.target + '</a></li>');
        }
        else {
          console.log(value.target,'target lang already exist in li list');
        }
      }
    });

    if ($('#ulTargetLang li').length == 1) {
      $('#dropdownMenuOutput').html('').html($($('#ulTargetLang a')).text() + '<span class="caret"></span>');
    }
  }

  // Send request to translate service if input-output and textarea have values
  function getTranslation() {
    var pageDomain = '';
    var source = '';
    var target = '';
    var textContent = '';

    if ($('input:radio[name=\'group1\']').is(':checked')) {
      pageDomain = $('input:radio[name=group1]:checked').val();
    }

    if (($('#dropdownMenuInput').text()).toLowerCase().indexOf('choose language') < 0) {
      source = getLanguageCode($.trim($('#dropdownMenuInput').text()));
    }

    if (($('#dropdownMenuOutput').text()).toLowerCase().indexOf('choose language') < 0) {
      target = getLanguageCode($.trim($('#dropdownMenuOutput').text()));
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
        url: '/api/translate',
        data: callData,
        dataType: 'json',
        headers: {
          'X-WDC-PL-OPT-OUT': $('input:radio[name=serRadio]:radio:checked').val(),
          'X-Watson-Technology-Preview': nmtValue
        },
        async: true
      };

      $('#profile textarea').val(JSON.stringify(callData, null, 2));
      $('#home2 textarea').val('translating...');

      $.ajax(restAPICall)
        .done(function (data) {
          $('#home2 textarea').val(data['translations'][0]['translation']);
          $('#profile2 textarea').val(JSON.stringify(data, null, 2));
        })
        .fail(function (jqXHR, statustext, errorthrown) {
          $('#home2 textarea').val('translation error');
          console.log(statustext + errorthrown);
        });
    } else {
      console.log('not all values' + 'source- ' + source + '  target- ' + target + '   textContent- ' + textContent + ' model_id - ' + model_id);
    }
  } // get Translation end here

  // accepts a lang or locale (e.g. en-US) and returns the lang (e.g. en)
  function getLang(locale){
    // split/shift rather than substr to handle cases like arz where the language part is actually 3 letters
    return locale.split('-').shift().toLowerCase();
  }

  // Get model_id from domain, source , target
  function getModelId(pageDomain, source, target) {
    var modelId = '';

    // Preferred: search for an exact lang/locale match (e.g. en-US to es-LA)
    for (var y in modelList) {
      if (modelList[y].hasOwnProperty('domain')) {
        var modelListDomain = modelList[y].domain.toString();
        if ((modelListDomain.toLowerCase() === pageDomain.toString().toLowerCase()) && source === modelList[y].source && target === modelList[y].target) {
          modelId = modelList[y].model_id;
          return modelId;
        }
      }
    }

    // Fallback: search for a language-only match (e.g. en to es)
    source = getLang(source);
    target = getLang(target);
    for (var y2 in modelList) {
      if (modelList[y2].hasOwnProperty('domain')) {
        var modelListDomain2 = modelList[y2].domain.toString();
        if ((modelListDomain2.toLowerCase() === pageDomain.toString().toLowerCase()) && source === getLang(modelList[y2].source) && target === getLang(modelList[y2].target)) {
          modelId = modelList[y2].model_id;
          return modelId;
        }
      }
    }

    return modelId;
  }

  $('#nav-tabs a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

});
