/*
 * RecPickup - CS 5774 Project 3
 * Search results, Join buttons, and the comment form. Loaded on every page.
 */
(function ($) {
  'use strict';

  // ----- Search results (search.html) -----

  // Only this phrase returns results
  var SEARCH_KEYPHRASE = 'tennis';

  // Fake results for the keyphrase
  var TENNIS_GAMES = [
    { sport: 'Tennis', time: 'Wed, Sep 30, 5:00–6:30 pm', court: 'Tennis Court 1, Tennis Center', joined: 4, max: 4 },
    { sport: 'Tennis', time: 'Thu, Oct 1, 7:00–8:30 pm', court: 'Tennis Court 3, Tennis Center', joined: 3, max: 4 },
    { sport: 'Tennis', time: 'Fri, Oct 2, 6:00–7:30 pm', court: 'Tennis Court 2, Tennis Center', joined: 1, max: 4 },
    { sport: 'Tennis', time: 'Sun, Oct 4, 9:00–10:30 am', court: 'Tennis Court 3, Tennis Center', joined: 2, max: 4 }
  ];

  // Builds a game row with the same markup as the rows on list.html
  function buildGameRow(game) {
    var isFull = game.joined >= game.max;
    var $button = $('<button>', {
      type: 'button',
      'class': 'btn game-action',
      text: isFull ? 'Full' : 'Join'
    });

    if (isFull) {
      $button.prop('disabled', true);
    } else {
      $button.addClass('join-btn');
    }

    return $('<li>', { 'class': 'game' }).append(
      $('<div>', { 'class': 'game-info' }).append(
        $('<p>', { 'class': 'game-sport', text: game.sport }),
        $('<h3>', { 'class': 'game-time' }).append(
          $('<a>', { href: 'detail.html', text: game.time })
        ),
        $('<p>', { 'class': 'game-court', text: game.court })
      ),
      $('<p>', { 'class': 'game-count', text: game.joined + ' of ' + game.max + ' joined' }),
      $button
    );
  }

  // Shows the no-results box. User input is only ever set as text.
  function showNoResults($section, message) {
    var $box = $('<div>', { 'class': 'panel-box no-results', role: 'status' }).append(
      $('<p>', { text: message }),
      $('<p>', { 'class': 'hint' }).append(
        // fixed text only here
        'Try searching for “' + SEARCH_KEYPHRASE + '”, or ',
        $('<a>', { href: 'list.html', text: 'browse all games' }),
        '.'
      )
    );
    $section.append($box);
  }

  // Reads ?q= from the URL and shows the results or a message
  function initSearchResults() {
    var $results = $('#search-results');
    if (!$results.length) {
      return; // not on search.html
    }

    var rawQuery = (new URLSearchParams(window.location.search).get('q') || '').trim();
    var query = rawQuery.toLowerCase();
    var $note = $('#results-note');

    // put the search back in the header box
    $('#header-search').val(rawQuery);

    switch (query) {
      case SEARCH_KEYPHRASE:
        TENNIS_GAMES.forEach(function (game) {
          $results.append(buildGameRow(game));
        });
        $note.text(TENNIS_GAMES.length + ' tennis games, soonest first');
        break;
      case '':
        $note.text('0 games');
        showNoResults($('.search-results'), 'Enter a search term to find games.');
        break;
      default:
        $note.text('0 games');
        showNoResults($('.search-results'), 'No games match “' + rawQuery + '”.');
    }
  }

  // ----- Join buttons (list.html, search.html) -----

  // One click handler on the list handles every Join button, even rows added later
  function initJoinButtons() {
    // Firefox can keep a button disabled after a reload, so start them enabled
    $('.join-btn').prop('disabled', false);

    $('.game-list').on('click', '.join-btn', function () {
      var $button = $(this);

      // go up to the game row, then down to its count
      var $game = $button.closest('.game');
      var $count = $game.find('.game-count');

      var match = $count.text().match(/(\d+) of (\d+)/);
      if (!match) {
        return;
      }
      var joined = parseInt(match[1], 10) + 1;
      var max = parseInt(match[2], 10);

      // update the count and the button
      $count.text(joined + ' of ' + max + ' joined');
      $button.text('Joined').prop('disabled', true).removeClass('join-btn');

      // add the "You're in" line under the row
      var $status = $('<p>', { 'class': 'joined-status', role: 'status' }).append(
        'You\'re in. ',
        $('<a>', { href: 'home-signed-in.html', text: 'See your games' })
      );
      $game.append($status);
    });
  }

  // ----- Comment form (detail.html) -----

  // signed-in user in this prototype
  var CURRENT_USER = 'Maya';

  // Adds the comment to the list and resets the text box. Empty comments are ignored.
  function initCommentForm() {
    var $form = $('.comment-form');
    if (!$form.length) {
      return; // not on detail.html
    }

    $form.on('submit', function (event) {
      event.preventDefault(); // no server, so stay on this page

      var $input = $('#comment-text');
      var text = String($input.val()).trim();
      if (text === '') {
        $input.trigger('focus');
        return;
      }

      // same markup as the existing comments
      var $comment = $('<li>', { 'class': 'comment' }).append(
        $('<p>', { 'class': 'comment-author', text: CURRENT_USER + ' ' }).append(
          $('<time>', { datetime: new Date().toISOString(), text: 'Just now' })
        ),
        $('<p>', { text: text })
      );
      $('.comment-list').append($comment);

      // clear the box for the next comment
      $input.val('').attr('placeholder', 'Add another comment').trigger('focus');
    });
  }

  $(function () {
    initSearchResults();
    initJoinButtons();
    initCommentForm();
  });
}(jQuery));
