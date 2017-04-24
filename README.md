# google-play-scraping
Small script based on <code>google play scraper</code> module I've done for one of my upWork clients. It allows you to save google play
search results(application name, developer Email, installs number and application rating) in json or csv format.
You can edit search parameters directly from command prompt.<br>
To run this script you must write: <code>node script.js &lt;search term&gt;</code>.<br>
Actually it takes 4 parameters <code>&lt;search term&gt; &lt;saving format&gt; &lt;country&gt; &lt;language&gt;</code>:
1. Search term e.g. "Video call". To run the script with this search term you have to write: <code>node script.js video+call</code>.<br>
Don't forget to use "+" instead of space when your search term contains more then 1 word.
2. Saving format is csv by default, but you can get your data as json file simply writing: <code>node script.js video+call json</code>.
3. By default country is Russia(ru), but you can change it to e.g. England writing: <code>node script.js video+call json en</code>.
4. It works the same way with with language just add one more parameter: <code>node script.js video+call json en en</code>.
<H3>See also</H3>
<a href="https://github.com/facundoolano/google-play-scraper">Google play scraper github page</a> to understand my code better, or
make your modifications.
