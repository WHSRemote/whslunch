# WHSLunch

### Created 01/25/2021
A Node.js application to scrape waylandschoolmeals.com for the lunch menu. Runs on Heroku at [whslunch.herokuapp.com](http://whslunch.herokuapp.com/).

- GETs the [menu page](http://www.waylandschoolmeals.com/index.php?sid=1583875606329&page=menus) and retrieves the high school menu link; changes every month
- GETs the high school menu and parses the menu ID from the URI hash, e.g. "/menu?id=5d42dc235d2ea&..."
- Queries their GraphQL DB with the fields I need, namely date and menu items
- Parses JSON to retrieve all menu items for today and tomorrow.

***Warning***: Does not work at the end of months due to waylandschoolmeals' limitation of not showing next month food items.
