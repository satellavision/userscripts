// ==UserScript==
// @name        wishlist highlighter for virtu.pet
// @match       https://virtu.pet/*
// @version     1.0
// @author      satella
// ==/UserScript==

(function() {
  'use strict';

  function getWishlistItems() {
    const wishlistUrl = 'https://virtu.pet/wishlist';
    return fetch(wishlistUrl)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const mb1Elements = doc.querySelectorAll('.mb-1');

        // the first mb-1 element is the nst time, hence the slice(1)
        return Array.from(mb1Elements).map(elem => elem.textContent.trim()).slice(1);
      })
      .catch(error => {
        console.error('Error fetching wishlist items:', error);
        return [];
      });
  }

  async function updateWishlistStorage() {
    try {
      const wishlistItems = await getWishlistItems();
      const wishlistString = JSON.stringify(wishlistItems);
      localStorage.setItem('wishlist', wishlistString);
    } catch (error) {
      console.error('Error updating wishlist storage:', error);
    }
  }

  const username = document.querySelector('#username').textContent.trim();
  const wishlistUserUrl = `https://virtu.pet/wishlist/${username}`;

  if (localStorage.getItem('wishlist') == null || location.href == wishlistUserUrl) {
    updateWishlistStorage();
  }

  var wishlistStorage = JSON.parse(localStorage.getItem('wishlist'));

  var textNodes = document.evaluate("//text()", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

  for (var i = 0; i < textNodes.snapshotLength; i++) {
    var node = textNodes.snapshotItem(i);
    var text = node.textContent.trim();

    if (wishlistStorage.includes(text)) {
      var span = document.createElement("span");
      span.style.backgroundColor = "#000000";
      span.style.color = "#44FF44";
      var highlightedText = document.createTextNode(text);
      span.appendChild(highlightedText);
      node.parentNode.replaceChild(span, node);
    }
  }
})();




