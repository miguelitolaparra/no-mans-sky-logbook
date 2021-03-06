var App = App || {};

App.Timeline = (function()
{
    /**
     * Settings
     */
    var numberOfEntries = 55;
    var entriesPerPage = 25;
    
    /**
     * Variables
     */
    var currentPage = 1;
    var maxPages = Math.floor((numberOfEntries - 1) / entriesPerPage) + 1;
    var startEntry;
    var endEntry;
    
    /**
     * Buttons
     */
    $(".pagination__button--prev").on("click", loadPreviousPage);
    $(".pagination__button--next").on("click", loadNextPage);
    
    /**
     * Event for using the browser back button or refresh
     */
    $(window).on('popstate', function() {
        init();
    });
    
    
    
    
    
    /**
     * Setup
     */
    function init()
    {
        //check url for page
        //set current page if found and not of range of min/max pages
        var page = App.Helpers.getParameterByName("page");
        
        if(page && page > 0 && page <= maxPages) {
            currentPage = page;
        } else {
            currentPage = 1;
        }
        
        loadCurrentPage();
    }
    
    /**
     * Load current page of entries
     */
    function loadCurrentPage()
    {
        clearTimeline();
        calculateEntriesToLoad();
        addPlaceholders();
        loadEntries();
        hideShowButtons();
    }
    
    /**
     * Load next page of entries
     */
    function loadNextPage(event)
    {
        event.preventDefault();
        
        currentPage++;
        
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?page=' + currentPage;
        window.history.pushState({path:newurl},'',newurl);
        
        loadCurrentPage();
    }
    
    /**
     * Load previous page of entries
     */
    function loadPreviousPage(event)
    {
        event.preventDefault();
        
        currentPage--;
        
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?page=' + currentPage;
        window.history.pushState({path:newurl},'',newurl);
        
        loadCurrentPage();
    }
    
    /**
     * Remove all elements from the timeline
     */
    function clearTimeline()
    {
        $(".timeline").empty();
    }
    
    /**
     * Calculate which entries to load
     */
    function calculateEntriesToLoad()
    {
        startEntry = (entriesPerPage * currentPage) - entriesPerPage + 1;
        endEntry = entriesPerPage * currentPage;
        
        // done start at less than 1
        if (startEntry < 1) {
            startEntry = 1;
        }
        
        // dont load more entries than we have
        if (endEntry > numberOfEntries) {
            endEntry = numberOfEntries;
        }
    }
    
    /**
     * Add placeholder elements for entries
     * placeholders are needed as ajax may load them in the wrong order
     */
    function addPlaceholders()
    {
        for (var i = startEntry; i <= endEntry; i++) {
            $(".timeline").append("<div class='entry entry--" + i + "'></div>");
        }
    }
    
    /**
     * Load entries
     */
    function loadEntries()
    {
        for (var i = startEntry; i <= endEntry; i++) {
            $.ajax({
                dataType: "json",
                url: "logs/" + i + ".json",
                index: i,
                cache: false,
                success: function(entry) { renderEntry(this.index, entry) }
            });
        }
    }
    
    /**
     * Display a entry within its placeholder
     */
    function renderEntry(index, entry)
    {
        var imageTemplate = "";
        var textClass = "";
        
        if (entry.image) {
            imageTemplate = "<div class='entry__image'><img src='images/logs/" + entry.image + "' /></div>";
        } else {
            textClass = "entry__text--full";
        }
        
        var entryTemplate = ["<div class='entry__icon'></div>",
                            "<div class='entry__content'>",
                                "<h2 class='entry__title'>" + entry.title + "</h2>",
                                "<div class='entry__date'>" + entry.date + "</div>",
                                imageTemplate,
                                "<p class='entry__text " + textClass + "'>" + entry.text.join("<br /><br />") + "</p>",
                            "</div>",
                            ].join("\n");
        
        //add class for type, so can be styled differently
        $(".entry--" + index).addClass("entry--" + entry.type);
        
        //add entry to the page
        //with a fade in to look pretty
        $(".entry--" + index).append(entryTemplate).hide().fadeIn(200);
    }
    
    /**
     * Hide or show buttons when needed
     */
    function hideShowButtons()
    {
        // hide/show previous button
        if (currentPage > 1) {
            $(".pagination__button--prev").show();
        } else {
            $(".pagination__button--prev").hide();
        }
        
        // hide/show next button
        if (currentPage >= maxPages) {
            $(".pagination__button--next").hide();
        } else {
            $(".pagination__button--next").show();
        }
    }
    
    
    
    
    
    /**
     * Public functions
     */
    return {
        init: init
    };
})();