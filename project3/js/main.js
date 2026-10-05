/*
 * RecPickup - Project 3 behavior (CS 5774)
 *
 * Loaded on every page after jQuery 3.7.1, so this one file serves all six
 * pages. All three setup functions run once the DOM is ready:
 *
 *   initSearchResults - search.html: simulated search (switch on keyphrase).
 *                       Returns early on pages without #search-results.
 *   initJoinButtons   - Join (click, delegation, traversal). Binds to every
 *                       .game-list on the page, but the handler only reacts to
 *                       .join-btn buttons, which exist only on list.html and in
 *                       search.html results. On pages without them it does nothing.
 *   initCommentForm   - detail.html: add a comment (submit).
 *                       Returns early on pages without .comment-form.
 */
(function ($) {
  'use strict';

  /* ---------- Simulated search (search.html) ---------- */

  // The one keyphrase that returns results. Every search box's placeholder hints at it.
  var SEARCH_KEYPHRASE = 'tennis';

  // Simulated results for the keyphrase, using the same fields the Browse rows show.
  var TENNIS_GAMES = [
    { sport: 'Tennis', time: 'Wed, Sep 30, 5:00–6:30 pm', court: 'Tennis Court 1, Tennis Center', joined: 4, max: 4 },
    { sport: 'Tennis', time: 'Thu, Oct 1, 7:00–8:30 pm', court: 'Tennis Court 3, Tennis Center', joined: 3, max: 4 },
    { sport: 'Tennis', time: 'Fri, Oct 2, 6:00–7:30 pm', court: 'Tennis Court 2, Tennis Center', joined: 1, max: 4 },
    { sport: 'Tennis', time: 'Sun, Oct 4, 9:00–10:30 am', court: 'Tennis Court 3, Tennis Center', joined: 2, max: 4 }
  ];

  /**
   * Builds one game row with the same markup as the rows in list.html,
   * so it gets the existing .game styles and works with the Join handler.
   * @param {{sport: string, time: string, court: string, joined: number, max: number}} game
   * @returns {jQuery} a new li.game element (not yet in the page)
   */
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

  /**
   * Adds a friendly "no results" box to the results section.
   * @param {jQuery} $section the .search-results section
   * @param {string} message first line; may contain user text, so it is set with text:
   */
  function showNoResults($section, message) {
    var $box = $('<div>', { 'class': 'panel-box no-results', role: 'status' }).append(
      $('<p>', { text: message }),
      $('<p>', { 'class': 'hint' }).append(
        // Built from constants only; never pass user text to append().
        'Try searching for “' + SEARCH_KEYPHRASE + '”, or ',
        $('<a>', { href: 'list.html', text: 'browse all games' }),
        '.'
      )
    );
    $section.append($box);
  }

  /**
   * Reads the GET keyphrase (?q=...) and shows simulated results when it
   * matches SEARCH_KEYPHRASE, or a friendly message when it does not.
   */
  function initSearchResults() {
    var $results = $('#search-results');
    if (!$results.length) {
      return; // not on search.html
    }

    // The form uses GET, so the phrase arrives in the URL query string.
    var rawQuery = (new URLSearchParams(window.location.search).get('q') || '').trim();
    var query = rawQuery.toLowerCase();
    var $note = $('#results-note');

    // Keep what the user typed in the header box so they can edit it.
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

  /* ---------- Interaction 1: Join a game (list.html, search.html) ---------- */

  /**
   * One delegated click handler on each .game-list handles every Join button,
   * including rows that search.html creates after the page loads.
   * Clicking Join:
   *   - modifies the row's existing count ("7 of 10" -> "8 of 10") and button ("Joined", disabled)
   *   - adds a new status line under the row
   */
  function initJoinButtons() {
    // Firefox restores a button's JS-set "disabled" state on reload; the page's
    // Join buttons always start enabled. (Full buttons have no join-btn class.)
    $('.join-btn').prop('disabled', false);

    $('.game-list').on('click', '.join-btn', function () {
      var $button = $(this);

      // DOM traversal: up from the button to its row, then down to the row's count.
      var $game = $button.closest('.game');
      var $count = $game.find('.game-count');

      var match = $count.text().match(/(\d+) of (\d+)/);
      if (!match) {
        return;
      }
      var joined = parseInt(match[1], 10) + 1;
      var max = parseInt(match[2], 10);

      // Modify existing elements.
      $count.text(joined + ' of ' + max + ' joined');
      $button.text('Joined').prop('disabled', true).removeClass('join-btn');

      // Add a new element that did not exist before.
      var $status = $('<p>', { 'class': 'joined-status', role: 'status' }).append(
        'You\'re in. ',
        $('<a>', { href: 'home-signed-in.html', text: 'See your games' })
      );
      $game.append($status);
    });
  }

  /* ---------- Interaction 2: Add a comment (detail.html) ---------- */

  // The signed-in student in this prototype (see "Welcome back, Maya" on the dashboard).
  var CURRENT_USER = 'Maya';

  /**
   * Submitting the comment form adds the comment to the list without a server:
   *   - adds a new li.comment at the end of the existing list
   *   - modifies the existing text box: clears it and changes its placeholder
   * A blank comment is ignored.
   */
  function initCommentForm() {
    var $form = $('.comment-form');
    if (!$form.length) {
      return; // not on detail.html
    }

    $form.on('submit', function (event) {
      event.preventDefault(); // no back end: keep the comment on this page

      var $input = $('#comment-text');
      var text = String($input.val()).trim();
      if (text === '') {
        $input.trigger('focus');
        return;
      }

      // Add a new element: a comment built with the same markup as the existing ones.
      var $comment = $('<li>', { 'class': 'comment' }).append(
        $('<p>', { 'class': 'comment-author', text: CURRENT_USER + ' ' }).append(
          $('<time>', { datetime: new Date().toISOString(), text: 'Just now' })
        ),
        $('<p>', { text: text })
      );
      $('.comment-list').append($comment);

      // Modify an existing element: reset the text box for the next comment.
      $input.val('').attr('placeholder', 'Add another comment').trigger('focus');
    });
  }

  // Run page setup once the DOM is ready.
  $(function () {
    initSearchResults();
    initJoinButtons();
    initCommentForm();
  });
}(jQuery));
