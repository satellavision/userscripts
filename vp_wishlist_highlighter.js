// ==UserScript==
// @name        wishlist highlighter for virtu.pet
// @match       https://virtu.pet/*
// @version     0.1
// @author      satella
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

(async function() {
  'use strict';

  const username = document.querySelector('#username').textContent.trim();
  const wishlistUrl = `https://virtu.pet/wishlist/${username}`;

  async function getWishlistItems() {
    const response = await fetch(wishlistUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch wishlist items (${response.status})`);
    }
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const wishlistElements = doc.querySelectorAll('.mb-1');

    // the first mb-1 element is the nst time, hence the slice(1)
    return Array.from(wishlistElements).map(elem => elem.textContent.trim()).slice(1);
  }

  async function updateWishlistStorage() {
    try {
      const wishlistItems = await getWishlistItems();
      const wishlistString = JSON.stringify(wishlistItems);
      await GM.setValue('wishlist', wishlistString);
    } catch (error) {
      console.error('Error updating wishlist storage:', error);
    }
  }

  const wishlistStorage = JSON.parse(await GM.getValue('wishlist', '[]'));

  if (wishlistStorage.length === 0 || location.href === wishlistUrl) {
    await updateWishlistStorage();
  }

  const textNodes = document.evaluate("//text()", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

  for (let i = 0; i < textNodes.snapshotLength; i++) {
    const node = textNodes.snapshotItem(i);
    const text = node.textContent.trim();

    if (wishlistStorage.includes(text)) {
      const span = document.createElement("span");
      span.style.backgroundColor = "#000000";
      span.style.color = "#44FF44";
      const highlightedText = document.createTextNode(text);
      span.appendChild(highlightedText);
      node.parentNode.replaceChild(span, node);
    }
  }
})();