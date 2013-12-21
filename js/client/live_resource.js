/*
 * LiveResource Object
 */
function LiveResource(url, type, media) {
    this.url = url;
    this.type = type;
    this.element = null;
    this.media = media;

    // set the method, if it's a local file or html we need to check the HTML.
    this.method = 'HEAD';
    if (this.type == 'html' || this.url.indexOf('file://') == 0 || $livePage.url.indexOf('file://') == 0 || $livePage.options.use_only_get == true) {
        this.method = 'GET';
    }


    this.headers = {
        "Etag": null,
        "Last-Modified": null,
        "Content-Length": null
    };
    this.cache = '';
    this.response = '';
    this.xhr = null;
}

/*
 * Generated a URL with a cache breaker in it.
 */
LiveResource.prototype.nonCacheURL = function () {
    if (this.url.indexOf('?') > 0) {
        return this.url + '&livePage=' + (new Date() * 1);
    }
    return this.url + '?livePage=' + (new Date() * 1);
}


/*
 * Checks if a newer version of the file is there.
 */
LiveResource.prototype.check = function () {
    //$LivePageDebug(['Checking', this.url]);

    this.xhr = new XMLHttpRequest();

    // Catch errors & remove bad links.
    try {
        this.xhr.open(this.method, this.nonCacheURL(), false);
        //this.xhr.setRequestHeader('If-Modified-Since', (new Date(0) * 1));
        //this.xhr.setRequestHeader('Cache-Control', 'no-cache');
        //this.xhr.setRequestHeader('Pragma', 'no-cache');
        this.xhr.send();

        // If it 404s
        if (this.xhr.status == 404) {
            throw "Error 404";
        }
    } catch (e) {
        $LivePageDebug(['Error Checking', this.url, e, 'Removing from list']);
        $livePage.removeResource(this.url);
        return;
    }


    if (this.xhr.readyState == 4 && this.xhr.status != 304) {
        // Pull all the headers
        this.xhr.getAllResponseHeaders();

        // Firstly, tidy up the code
        this.response = this.tidyCode(this.xhr.responseText);

        // If this is the first check, cache it and than move along.
        if (this.method != 'HEAD' && this.cache == '' && this.response != '') {
            this.cache = this.response;
            return;
        }

        // Compare the headers && responseText
        if (this.checkHeaders() && this.checkResponse()) {
            this.refresh();
        }
    }

    this.xhr = null;
}

/*
 * Cycles through the headers recieved looking for changes.
 */
LiveResource.prototype.checkHeaders = function () {
    if (this.method == 'GET' && (this.url.indexOf('file://') == 0 || $livePage.url.indexOf('file://') == 0)) { // If it's a file, it will always send bad headers. So check the content.
        return true;
    }

    var headersChanged = false;
    for (var h in this.headers) {
        if (this.headers[h] != null && (this.xhr.getResponseHeader(h) == null || this.headers[h] != this.xhr.getResponseHeader(h))) {
            headersChanged = true;
        }
        // Update the headers.
        this.headers[h] = this.xhr.getResponseHeader(h);
    }
    return headersChanged;
}

/*
 * Compares the responseText to the cached. 
 */
LiveResource.prototype.checkResponse = function () {
    if (this.method == 'HEAD' || (this.response != '' && this.cache != this.response)) {
        this.cache = this.response;
        return true;
    }
    this.cache = this.response;
    return false;
}

/*
 * Sets a session var of the last updated file.
 */
LiveResource.prototype.sessionCache = function () {
    cache = {};
    cache.url = this.url;
    cache.type = this.type;
    cache.media = this.media;

    sessionStorage.setItem('LivePage_LastUpdatedResource', JSON.stringify(cache));
}

/*
 * Refresh the code
 */
LiveResource.prototype.refresh = function () {
    $LivePageDebug(['Refreshing', this.url, this]);

    // Update the Superior Resource, so it gets checked more frqeuently.
    $livePage.superiorResource = this;

    if (this.type == 'css') {
        // create a new html element
        var cssElement = document.createElement('link');
        cssElement.setAttribute("type", "text/css");
        cssElement.setAttribute("rel", "stylesheet");
        cssElement.setAttribute("href", this.nonCacheURL() + "?LivePage=" + new Date() * 1);
        cssElement.setAttribute("media", this.media);

        $livePage.head.appendChild(cssElement);

        // Remove the old element we created in the last update. Than update.
        if (this.element != null) {
            $livePage.head.removeChild(document.querySelector('link[href^="' + this.element.href + '"]'));
        }
        this.element = cssElement;
    } else if (this.type == 'less') {
        // Tell LESS CSS to reload.
        $LivePageLESS.refresh(document.querySelector('link[href^="' + this.url + '"]'));
    } else {
        // Cache the item last updated so we poll it more.
        this.sessionCache();
        // Now reload the page.
        try {
            // This can let us reload the page & force a cache reload.
            chrome.extension.sendMessage({
                action: 'reload'
            }, function () {});
        } catch (e) {
            // An error occoured refreshing the page with the chrome socket. Do it differently.
            document.location.reload($livePage.url);
        }
    }
}

/*
 * Tidies up HTML (Removes comments and whitespace), if the users wants.
 */
LiveResource.prototype.tidyCode = function (html) {
    if ($livePage.options.tidy_html == true) {
        // Remove comments and whitespace.
        html = html.replace(/<!--([\s\S]*?)-->/gim, '');
        html = html.replace(/  /gim, ' ');
        html = html.replace(/(\r\n|\n|\r|\t\s)/gim, '');
    }

    if ($livePage.options.tidy_inline_html == true) {
        html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '');
        //html = html.replace(/<style(.*?)>(.*?)<\/style>/gim, '');
        html = html.replace(/<input(.*?)hidden(.*?)>/gim, '');
    }
    return html;
}
