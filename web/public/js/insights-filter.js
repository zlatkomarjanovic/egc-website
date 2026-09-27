(function () {
  function textOf(el) {
    return el
      ? String(el.textContent || "")
          .replace(/\u00a0/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      : "";
  }

  function initInsightsFilter() {
    var root = document.querySelector(".section_blog21");
    if (!root || root.getAttribute("data-insights-filter") === "ready") return;

    var search = root.querySelector("#Search");
    var radios = root.querySelectorAll('input[name="insights-category"]');
    var items = root.querySelectorAll(".blog21_list > .w-dyn-item");
    var empty = root.querySelector("#insights-empty");
    if (!items.length) return;

    root.setAttribute("data-insights-filter", "ready");

    function apply() {
      var query = search ? String(search.value || "").trim().toLowerCase() : "";
      var category = "";
      for (var i = 0; i < radios.length; i += 1) {
        if (radios[i].checked) {
          category = String(radios[i].value || "")
            .replace(/\u00a0/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          break;
        }
      }

      var shown = 0;
      for (var j = 0; j < items.length; j += 1) {
        var item = items[j];
        var title = textOf(item.querySelector("h3"));
        var itemCategory = textOf(item.querySelector(".tagline"));
        var summary = textOf(item.querySelector(".text-size-regular"));
        var author = textOf(item.querySelector(".text-weight-semibold"));
        var haystack = (title + " " + summary + " " + author).toLowerCase();
        var matchCategory = !category || itemCategory === category;
        var matchSearch = !query || haystack.indexOf(query) !== -1;
        var visible = matchCategory && matchSearch;
        item.hidden = !visible;
        item.style.display = visible ? "" : "none";
        if (visible) shown += 1;
      }

      if (empty) empty.style.display = shown ? "none" : "";
    }

    if (search) {
      try {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial && !search.value) search.value = initial;
      } catch (err) {
        /* ignore */
      }
      search.addEventListener("input", apply);
      search.addEventListener("keyup", apply);
      search.addEventListener("search", apply);
    }

    for (var k = 0; k < radios.length; k += 1) {
      radios[k].addEventListener("change", apply);
    }

    document.addEventListener(
      "click",
      function (event) {
        var target = event.target;
        if (!target || !target.closest) return;
        var label = target.closest(".section_blog21 .finsweet-radio");
        if (!label) return;
        var input = label.querySelector('input[type="radio"]');
        if (!input) return;
        input.checked = true;
        apply();
      },
      true
    );

    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initInsightsFilter);
  } else {
    initInsightsFilter();
  }
  window.addEventListener("load", initInsightsFilter);
})();
