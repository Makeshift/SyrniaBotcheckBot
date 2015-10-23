# WHAT IS
A very simple botcheck bot for the text based game, Syrnia. Developed in June 2015 as a learning experiment for JavaScript.
## HOW MADE
This is a Tampermonkey/Greasemonkey script, written primarily in JavaScript. It was my first JavaScript project and has not really been updated since. It is being released on GitHub as a learning tool for others.
## WHAT DO
* Periodically checks for botchecks, if it finds them it uploads them to 2captcha, awaits the result, and then enters the result into the input field.
* Logs you in if you get logged out.
* Gives some rudimentary details on the work page.
* Can be configured to only work during certain times of the day.
* Will attempt to do the main action for that page, such as digging. (WIP, unsure if I will ever come back to this project)

## HOW DO

* Replace stopTime and startTime with your preferred running times. Times are based on system times.
```javascript
var stopTime = 0; //Stops at midnight
var startTime = 4; //Starts at 4am
```
* Replace username and password with your own if you wish the auto-login to work.
* You will need an account and credit on 2captcha.com, and you can replace the apikey variable with your captcha key from the site.
* Simply install with Greasemonkey or Tampermonkey, then browse to the Syrnia homepage.
