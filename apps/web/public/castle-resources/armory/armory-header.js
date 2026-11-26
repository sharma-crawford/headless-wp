/* Inserts the shared Armory header at the top of a static resource page. Keep in sync with components/armory/armory-nav. */
(function () {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/castle-resources/armory/armory-header.css";
  document.head.appendChild(link);
  var header = document.createElement("header");
  header.className = "ar-header";
  header.innerHTML =
    '<a class="ar-brand" href="/castle#courtyard" aria-label="The Armory courtyard">' +
    '<img src="/castle/pen-sword-logo.png" alt="The Pen &amp; Sword" width="190" height="67">' +
    '<span><strong>ARMORY</strong><small>Explore. Learn. Practice.</small></span></a>' +
    '<nav aria-label="Armory navigation"><a href="/castle#courtyard">Castle</a>' +
    '<a href="/castle#list">Course rooms</a><a href="/my-training">My Training</a></nav>';
  document.body.insertBefore(header, document.body.firstChild);
})();
